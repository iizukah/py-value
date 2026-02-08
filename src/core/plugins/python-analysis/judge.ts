/**
 * 判定アダプタ（ARC-02）— value_match で ans のみ（INFRA-01 §7.3）
 * クライアントで Pyodide を CDN から読み込み、変数 ans を取得して expected_value と比較する。
 */

import type { Question } from "@/lib/types";

interface PyodideRuntime {
  runPythonAsync(code: string): Promise<void>;
  runPython?(code: string): unknown;
  globals: { get(name: string): unknown };
  loadPackage?(names: string[]): Promise<void>;
}
import type { JudgeResult } from "@/lib/types";

const PYODIDE_PACKAGES = ["numpy", "matplotlib", "pandas", "scipy", "scikit-learn", "statsmodels"];
let pyodideInstance: PyodideRuntime | null = null;

/** DD-023: プラグイン mount 時のプリロード用に export */
export async function getPyodide(): Promise<PyodideRuntime> {
  if (pyodideInstance) return pyodideInstance;
  const loadPyodide = (globalThis as typeof window & { loadPyodide?: (opts: { indexURL: string }) => Promise<PyodideRuntime> }).loadPyodide;
  if (!loadPyodide) {
    await new Promise<void>((resolve, reject) => {
      const s = document.createElement("script");
      s.src = "https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js";
      s.onload = () => resolve();
      s.onerror = () => reject(new Error("Failed to load Pyodide script"));
      document.head.appendChild(s);
    });
  }
  const loadPyodideFn = (globalThis as typeof window & { loadPyodide: (opts: { indexURL: string }) => Promise<PyodideRuntime> }).loadPyodide;
  const pyodide = await loadPyodideFn({
    indexURL: "https://cdn.jsdelivr.net/pyodide/v0.26.4/full/",
  });
  if (pyodide.loadPackage) {
    try {
      await pyodide.loadPackage(PYODIDE_PACKAGES);
    } catch {
      // continue without some packages
    }
  }
  await pyodide.runPythonAsync(`
import sys
if 'matplotlib' in sys.modules or True:
    try:
        import matplotlib
        matplotlib.use('Agg')
    except Exception:
        pass
  `.trim());
  pyodideInstance = pyodide;
  return pyodide;
}

/** TC-P04: 複数セルを結合して 1 スクリプトにする。単体テスト用に export。 */
export function getCombinedCode(userAnswer: Record<string, unknown>): string {
  const cells = (userAnswer.cells as { id: string; content: string }[] | undefined) ?? [];
  if (cells.length === 0) return "";
  return cells.map((c) => c.content).join("\n\n");
}

function compareWithTolerance(
  actual: number,
  expected: number,
  atol: number = 1e-5,
  rtol: number = 1e-3
): boolean {
  const diff = Math.abs(actual - expected);
  return diff <= atol + rtol * Math.abs(expected);
}

/** TC-P05: watchVariables で指定した変数の値を取得。単体テスト用に export。 */
export function getWatchVariableValues(
  globals: { get(name: string): unknown },
  names: string[]
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const name of names) {
    const v = globals.get(name);
    const js = typeof (v as { toJs?: () => unknown })?.toJs === "function"
      ? (v as { toJs: () => unknown }).toJs()
      : v;
    out[name] = js;
  }
  return out;
}

/** TC-P06: 2 配列のピアソン相関 r。r > 0.99 で一致とみなす（FR-P009）。単体テスト用に export。 */
export function computeCorrelation(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 0;
  const n = a.length;
  const sumA = a.reduce((s, x) => s + x, 0);
  const sumB = b.reduce((s, x) => s + x, 0);
  const meanA = sumA / n;
  const meanB = sumB / n;
  let num = 0;
  let denA = 0;
  let denB = 0;
  for (let i = 0; i < n; i++) {
    const da = a[i]! - meanA;
    const db = b[i]! - meanB;
    num += da * db;
    denA += da * da;
    denB += db * db;
  }
  const den = Math.sqrt(denA * denB);
  return den === 0 ? 0 : num / den;
}

const DEFAULT_TIMEOUT_MS = 60_000;

/** TC-P02: タイムアウト時は details.kind: "timeout" を返すための race 用。単体テスト用に export。 */
export function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T | "timeout"> {
  return Promise.race([
    promise,
    new Promise<"timeout">((resolve) => setTimeout(() => resolve("timeout"), ms)),
  ]);
}

export async function runJudge(
  question: Question,
  userAnswer: Record<string, unknown>,
  options?: { timeoutMs?: number }
): Promise<JudgeResult> {
  const code = getCombinedCode(userAnswer);
  const validation = question.validation;
  if (!validation || validation.method !== "value_match") {
    return {
      isCorrect: false,
      message: "この問題は value_match で採点されます。",
      details: { kind: "judge_error" },
    };
  }

  const expected = validation.expected_value;
  if (expected === undefined) {
    return {
      isCorrect: false,
      message: "期待値が設定されていません。",
      details: { kind: "judge_error" },
    };
  }

  const timeoutMs = options?.timeoutMs ?? DEFAULT_TIMEOUT_MS;

  try {
    if (typeof window === "undefined") {
      return {
        isCorrect: false,
        message: "Pyodide はブラウザでのみ利用できます。",
        details: { kind: "runtime_error" },
      };
    }
    const pyodide = await getPyodide();
    const runResult = await withTimeout(pyodide.runPythonAsync(code), timeoutMs);
    if (runResult === "timeout") {
      return {
        isCorrect: false,
        message: "実行がタイムアウトしました。",
        details: { kind: "timeout" },
      };
    }
    const ans = pyodide.globals.get("ans");
    if (ans === undefined) {
      return {
        isCorrect: false,
        message: "変数 ans が定義されていません。",
        details: { kind: "value_match", expected, actual: undefined },
      };
    }
    const actualValue =
      typeof (ans as { toJs?: () => unknown })?.toJs === "function"
        ? (ans as { toJs: () => unknown }).toJs()
        : ans;
    const atol = validation.tolerance?.atol ?? 1e-5;
    const rtol = validation.tolerance?.rtol ?? 1e-3;

    if (typeof expected === "number" && typeof actualValue === "number") {
      const ok = compareWithTolerance(actualValue, expected, atol, rtol);
      return {
        isCorrect: ok,
        message: ok ? "正解です。" : "不正解です。",
        details: { kind: "value_match", expected, actual: actualValue },
      };
    }
    if (Array.isArray(expected) && Array.isArray(actualValue)) {
      if (expected.length !== actualValue.length) {
        return {
          isCorrect: false,
          message: "配列の長さが一致しません。",
          details: { kind: "value_match", expected, actual: actualValue },
        };
      }
      const ok = expected.every(
        (e, i) => typeof e === "number" && typeof actualValue[i] === "number" &&
          compareWithTolerance(actualValue[i], e, atol, rtol)
      );
      return {
        isCorrect: ok,
        message: ok ? "正解です。" : "不正解です。",
        details: { kind: "value_match", expected, actual: actualValue },
      };
    }

    return {
      isCorrect: false,
      message: "期待値と型が一致しません。",
      details: { kind: "value_match", expected, actual: actualValue },
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      isCorrect: false,
      message: `実行エラー: ${message}`,
      details: { kind: "runtime_error", actual: message },
    };
  }
}

/** セル実行結果（stdout/stderr/plot）。DATA-02 §4.2, FR-P003 */
export interface CellRunResult {
  variables: Record<string, unknown>;
  stdout?: string;
  stderr?: string;
  error?: string;
  plotBase64?: string;
}

/** DD-010 / プラン: セル単位実行。stdout/stderr 取得、plt.show() 時は plotBase64 返却。 */
export async function runCodeAndGetVariables(
  code: string,
  watchNames: string[],
  options?: { timeoutMs?: number }
): Promise<CellRunResult> {
  const timeoutMs = options?.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  try {
    if (typeof window === "undefined") {
      return { variables: {}, error: "Pyodide はブラウザでのみ利用できます。" };
    }
    const pyodide = await getPyodide();
    const indented = code.split("\n").map((l) => "  " + l).join("\n");
    const wrap =
      `
import sys, io
_so, _se = io.StringIO(), io.StringIO()
_old_stdout, _old_stderr = sys.stdout, sys.stderr
sys.stdout, sys.stderr = _so, _se
try:
` +
      indented +
      `
except Exception as e:
    import traceback
    _se.write(traceback.format_exc())
finally:
    sys.stdout, sys.stderr = _old_stdout, _old_stderr
__pyodide_stdout__ = _so.getvalue()
__pyodide_stderr__ = _se.getvalue()
`;
    const runResult = await withTimeout(pyodide.runPythonAsync(wrap), timeoutMs);
    if (runResult === "timeout") {
      return { variables: {}, error: "タイムアウトしました。" };
    }
    const variables = getWatchVariableValues(pyodide.globals, watchNames.length ? watchNames : ["ans"]);
    const rawStdout = pyodide.globals.get("__pyodide_stdout__");
    const rawStderr = pyodide.globals.get("__pyodide_stderr__");
    const stdout = rawStdout != null ? String(rawStdout) : "";
    const stderr = rawStderr != null ? String(rawStderr) : "";
    let plotBase64: string | undefined;
    try {
      await pyodide.runPythonAsync(`
import sys
__plot_b64__ = None
if 'matplotlib' in sys.modules:
    try:
        import matplotlib.pyplot as plt
        if plt.get_fignums():
            import io, base64
            buf = io.BytesIO()
            plt.savefig(buf, format='png', bbox_inches='tight')
            plt.close('all')
            __plot_b64__ = base64.b64encode(buf.getvalue()).decode('utf-8')
    except Exception:
        pass
  `.trim());
      const b64 = pyodide.globals.get("__plot_b64__");
      if (b64 != null) plotBase64 = String(b64);
    } catch {
      // ignore plot export errors
    }
    return { variables, stdout: stdout || undefined, stderr: stderr || undefined, plotBase64 };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { variables: {}, error: message };
  }
}

export const judgeAdapter = { runJudge, runCodeAndGetVariables };
