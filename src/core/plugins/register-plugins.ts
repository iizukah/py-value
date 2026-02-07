/**
 * プラグイン登録（ビルド時・アプリ起動時）
 * ARC-01-003: type 'python-analysis' を 1 件登録
 */

import { registerPlugin } from "./registry";
import PythonAnalysisPlugin from "./python-analysis/index";
import { judgeAdapter } from "./python-analysis/judge";

registerPlugin("python-analysis", PythonAnalysisPlugin, judgeAdapter);
