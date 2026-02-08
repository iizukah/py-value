# 0035 デバッグ: QuestionListClient filteredQuestions TDZ ReferenceError

## 日付

2025-02-07

## 事象

- **エラー**: `ReferenceError: Cannot access 'filteredQuestions' before initialization`
- **発生箇所**: `src/app/[workbookId]/QuestionListClient.tsx` 369 行付近（IntersectionObserver の useEffect の依存配列 `[visibleCount, filteredQuestions.length]`）

## 原因（ログによる確認）

- 同一レンダー内で、`useEffect` の依存配列が評価される時点では、`filteredQuestions` はまだ 392 行目で宣言されていなかった。
- JavaScript の **Temporal Dead Zone（TDZ）** により、`const` 宣言前の参照で ReferenceError が発生。
- 計測ログで「before_useEffect」のみ記録され「after_filteredQuestions」が一度も記録されないことを確認し、宣言順が原因と特定。

## 対応

- **修正**: `filteredByStatus` / `filteredByDifficulty` / `filteredQuestionsBase` / `filteredQuestions` の宣言を、IntersectionObserver の `useEffect` より**前**に移動した。
- **結果**: 依存配列評価時に `filteredQuestions` が定義済みとなり、エラー解消。検証ログで `after_filteredQuestions` と有効な `len` が記録されることを確認後、計測を削除。

## 変更ファイル

- `src/app/[workbookId]/QuestionListClient.tsx` — 宣言順の入れ替え（useEffect の依存で参照する変数を、その useEffect より前に定義）

---

## 中級・上級インポート用問題（.drafts）と解答例

`docs/.drafts/import_questions_chukyu_joukyu.json` に中級 6 問・上級 6 問を配置。以下に各問の解説と解答例コードを記載する。

### 中級 1. グループごとの最大値（pandas）

- **ねらい**: iris を DataFrame 化し、種別ごとの petal length の最大値を求め、その合計を出す。
- **使用ライブラリ**: pandas, sklearn.datasets
- **期待する解答**: 3 種別の最大値の合計を `ans` に（約 16.3）。

```python
import pandas as pd
from sklearn.datasets import load_iris
iris = load_iris()
df = pd.DataFrame(iris.data, columns=iris.feature_names)
df['target'] = iris.target
max_by_target = df.groupby('target')['petal length (cm)'].max()
ans = float(max_by_target.sum())
```

### 中級 2. ヒストグラムの描画（matplotlib）

- **ねらい**: 正規乱数をヒストグラムで可視化し、Pyodide 上で表示する。
- **使用ライブラリ**: numpy, matplotlib
- **期待する解答**: プロット後に `ans = True`。

```python
import numpy as np
import matplotlib
matplotlib.use('module://matplotlib_backend_pyodide')
import matplotlib.pyplot as plt
np.random.seed(42)
data = np.random.randn(100)
plt.hist(data, bins=10)
plt.show()
ans = True
```

### 中級 3. 配列の平均と標準偏差（numpy）

- **ねらい**: 1～20 の配列の平均を求める。
- **使用ライブラリ**: numpy
- **期待する解答**: `ans = 10.5`。

```python
import numpy as np
arr = np.arange(1, 21)
ans = float(np.mean(arr))  # 10.5
```

### 中級 4. 2変量の相関係数（pandas）

- **ねらい**: 2 列の DataFrame からピアソン相関係数（1 変数）を求める。
- **使用ライブラリ**: pandas
- **期待する解答**: 完全正の相関で `ans = 1.0`。

```python
import pandas as pd
df = pd.DataFrame({'x': [1,2,3,4,5,6,7,8,9,10], 'y': [1,2,3,4,5,6,7,8,9,10]})
ans = float(df['x'].corr(df['y']))
```

### 中級 5. 線形回帰の傾き（sklearn）

- **ねらい**: LinearRegression で単回帰し、傾き（coef_）を取得する。
- **使用ライブラリ**: sklearn.linear_model, numpy
- **期待する解答**: 傾き 2.0 に近い値を `ans` に。

```python
from sklearn.linear_model import LinearRegression
import numpy as np
X = np.array([[1],[2],[3],[4],[5]])
y = np.array([2, 4, 6, 8, 10])
model = LinearRegression().fit(X, y)
ans = float(model.coef_[0])
```

### 中級 6. 正規分布の累積確率（scipy）

- **ねらい**: 標準正規分布の P(X ≤ 0) を求める。
- **使用ライブラリ**: scipy.stats
- **期待する解答**: `ans = 0.5`。

```python
from scipy import stats
ans = float(stats.norm.cdf(0))  # 0.5
```

### 上級 1. 時系列の移動平均（pandas）

- **ねらい**: Series の rolling(3).mean() の最後の値を求める。
- **使用ライブラリ**: pandas
- **期待する解答**: 最後の移動平均 40.0 を `ans` に。

```python
import pandas as pd
s = pd.Series([10, 20, 30, 40, 50])
rolling_mean = s.rolling(3).mean()
ans = float(rolling_mean.iloc[-1])
```

### 上級 2. 複数サブプロット（matplotlib）

- **ねらい**: 2×2 のサブプロットに 4 本の折れ線を描画する。
- **使用ライブラリ**: matplotlib
- **期待する解答**: 描画後に `ans = True`。

```python
import matplotlib
matplotlib.use('module://matplotlib_backend_pyodide')
import matplotlib.pyplot as plt
fig, axes = plt.subplots(2, 2)
axes[0, 0].plot([1, 2, 3])
axes[0, 1].plot([4, 5, 6])
axes[1, 0].plot([7, 8, 9])
axes[1, 1].plot([10, 11, 12])
plt.show()
ans = True
```

### 上級 3. 行列のトレース（numpy）

- **ねらい**: 2×2 行列の対角和（トレース）を求める。
- **使用ライブラリ**: numpy
- **期待する解答**: `ans = 5`。

```python
import numpy as np
A = np.array([[1, 2], [3, 4]])
ans = int(np.trace(A))  # 5
```

### 上級 4. ロジスティック回帰の係数（statsmodels）

- **ねらい**: Logit で二値分類をフィットし、定数項の係数を得る。
- **使用ライブラリ**: numpy, statsmodels.api
- **期待する解答**: 定数項（const）の係数を `ans` に。

```python
import numpy as np
import statsmodels.api as sm
X = sm.add_constant([1, 2, 3, 4, 5])
y = [0, 0, 1, 1, 1]
model = sm.Logit(y, X).fit(disp=0)
ans = float(model.params['const'])
```

### 上級 5. KMeans の inertia（sklearn）

- **ねらい**: KMeans(n_clusters=2, random_state=42) で inertia_ を取得する。
- **使用ライブラリ**: sklearn.cluster, numpy
- **期待する解答**: クラスタ内二乗和を `ans` に。

```python
from sklearn.cluster import KMeans
import numpy as np
X = np.array([[1,2], [1.5,2], [5,8], [8,8], [1,0.5]])
model = KMeans(n_clusters=2, random_state=42).fit(X)
ans = float(model.inertia_)
```

### 上級 6. 対応のない t 検定の p 値（scipy）

- **ねらい**: ttest_ind で 2 群の t 検定を行い、p 値を得る。
- **使用ライブラリ**: scipy.stats
- **期待する解答**: p 値を `ans` に。

```python
from scipy import stats
a = [1, 2, 3, 4, 5]
b = [2, 3, 4, 5, 6]
_, ans = stats.ttest_ind(a, b)
ans = float(ans)
```
