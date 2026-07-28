/**
 * 汎用非線形連立方程式ソルバー
 * Levenberg-Marquardt法（減衰付きGauss-Newton法）
 */

export type ResidualFn = (x: number[]) => number[];

export type SolveStatus =
  | 'ok'
  | 'underdetermined_similarOnly' // 条件不足だが、相似な図形しか出てこない
  | 'underdetermined_shapeVaries' // 条件不足で、形自体が変わる図形も考えられる
  | 'contradiction';

export interface SolveResult {
  x: number[];
  residualNorm: number;
  converged: boolean;
  iterations: number;
  status: SolveStatus;
  deficiency: number;
  diverged: boolean;
}

export interface SolveOptions {
  maxIterations?: number;
  tolerance?: number;
  initialLambda?: number;
}

function numericalJacobian(residualFn: ResidualFn, x: number[], eps = 1e-6) {
  const r0 = residualFn(x);
  const m = r0.length;
  const n = x.length;
  const J: number[][] = Array.from({ length: m }, () => new Array(n).fill(0));

  for (let j = 0; j < n; j++) {
    const xPerturbed = x.slice();
    const h = eps * Math.max(1, Math.abs(x[j]));
    xPerturbed[j] += h;
    const r1 = residualFn(xPerturbed);
    for (let i = 0; i < m; i++) {
      J[i][j] = (r1[i] - r0[i]) / h;
    }
  }
  return { J, r0 };
}

function matMulTranspose(J: number[][]): number[][] {
  const m = J.length;
  const n = J[0].length;
  const JTJ: number[][] = Array.from({ length: n }, () => new Array(n).fill(0));
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      let sum = 0;
      for (let k = 0; k < m; k++) sum += J[k][i] * J[k][j];
      JTJ[i][j] = sum;
    }
  }
  return JTJ;
}

function matVecTranspose(J: number[][], r: number[]): number[] {
  const m = J.length;
  const n = J[0].length;
  const result = new Array(n).fill(0);
  for (let i = 0; i < n; i++) {
    let sum = 0;
    for (let k = 0; k < m; k++) sum += J[k][i] * r[k];
    result[i] = sum;
  }
  return result;
}

function solveLinearSystem(A: number[][], b: number[]): number[] {
  const n = b.length;
  const M = A.map((row, i) => [...row, b[i]]);

  for (let col = 0; col < n; col++) {
    let maxRow = col;
    for (let row = col + 1; row < n; row++) {
      if (Math.abs(M[row][col]) > Math.abs(M[maxRow][col])) maxRow = row;
    }
    [M[col], M[maxRow]] = [M[maxRow], M[col]];

    if (Math.abs(M[col][col]) < 1e-14) {
      M[col][col] += 1e-10;
    }

    for (let row = col + 1; row < n; row++) {
      const factor = M[row][col] / M[col][col];
      for (let c = col; c <= n; c++) {
        M[row][c] -= factor * M[col][c];
      }
    }
  }

  const x = new Array(n).fill(0);
  for (let row = n - 1; row >= 0; row--) {
    let sum = M[row][n];
    for (let col = row + 1; col < n; col++) {
      sum -= M[row][col] * x[col];
    }
    x[row] = sum / M[row][row];
  }
  return x;
}

export function norm(v: number[]): number {
  return Math.sqrt(v.reduce((s, vi) => s + vi * vi, 0));
}

// 対称行列の固有値・固有ベクトルをヤコビ法で計算する。
// 戻り値: { eigenvalues: number[], eigenvectors: number[][] }
// eigenvectors[k] が eigenvalues[k] に対応する単位固有ベクトル。
function symmetricEigen(A: number[][], maxIter = 100): { eigenvalues: number[]; eigenvectors: number[][] } {
  const n = A.length;
  const M = A.map((row) => row.slice());
  // Vは固有ベクトルを列として蓄積する回転行列の積（初期値は単位行列）
  const V: number[][] = Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => (i === j ? 1 : 0))
  );

  for (let iter = 0; iter < maxIter; iter++) {
    let p = 0, q = 1, maxVal = 0;
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        if (Math.abs(M[i][j]) > maxVal) {
          maxVal = Math.abs(M[i][j]);
          p = i; q = j;
        }
      }
    }
    if (maxVal < 1e-12) break;

    const theta = M[p][p] === M[q][q]
      ? Math.PI / 4
      : 0.5 * Math.atan2(2 * M[p][q], M[p][p] - M[q][q]);
    const c = Math.cos(theta), s = Math.sin(theta);

    const Mpp = c * c * M[p][p] + s * s * M[q][q] + 2 * s * c * M[p][q];
    const Mqq = s * s * M[p][p] + c * c * M[q][q] - 2 * s * c * M[p][q];
    M[p][p] = Mpp;
    M[q][q] = Mqq;
    M[p][q] = 0;
    M[q][p] = 0;

    for (let i = 0; i < n; i++) {
      if (i !== p && i !== q) {
        const Mip = M[i][p], Miq = M[i][q];
        M[i][p] = c * Mip + s * Miq;
        M[p][i] = M[i][p];
        M[i][q] = -s * Mip + c * Miq;
        M[q][i] = M[i][q];
      }
    }

    // 回転行列VにもGivens回転を適用して固有ベクトルを蓄積
    for (let i = 0; i < n; i++) {
      const Vip = V[i][p], Viq = V[i][q];
      V[i][p] = c * Vip + s * Viq;
      V[i][q] = -s * Vip + c * Viq;
    }
  }

  const eigenvalues = M.map((row, i) => row[i]);
  // eigenvectors[k] は V の k列目
  const eigenvectors = eigenvalues.map((_, k) => V.map((row) => row[k]));

  return { eigenvalues, eigenvectors };
}

export type DeficiencyKind = 'none' | 'scaleOnly' | 'shapeChanging';

export interface RankInfo {
  rank: number;
  deficiency: number;
  eigenvalues: number[];
  // 余っている自由度が「全体を原点中心に拡大縮小する方向」だけなのか、
  // それ以外の（図形の"形"そのものを変えてしまう）方向も含むのかを判定する。
  deficiencyKind: DeficiencyKind;
}

export function estimateRank(J: number[][], centeredX: number[], tol = 1e-6): RankInfo {
  const n = J[0].length;

  const colNorms = new Array(n).fill(0);
  for (let j = 0; j < n; j++) {
    let s = 0;
    for (let i = 0; i < J.length; i++) s += J[i][j] * J[i][j];
    colNorms[j] = Math.sqrt(s) || 1;
  }
  const Jn = J.map((row) => row.map((v, j) => v / colNorms[j]));

  const JTJ = matMulTranspose(Jn);
  const { eigenvalues, eigenvectors } = symmetricEigen(JTJ);
  const maxEig = Math.max(...eigenvalues, 1e-12);

  // 固有値が小さい方向 = 制約がほとんど効いていない方向（自由度が余っている方向）
  const nullDirections: number[][] = [];
  for (let k = 0; k < eigenvalues.length; k++) {
    if (eigenvalues[k] / maxEig <= tol) {
      nullDirections.push(eigenvectors[k]);
    }
  }
  const deficiency = nullDirections.length;

  let deficiencyKind: DeficiencyKind = 'none';

  if (deficiency > 0) {
    // 「全体を原点中心に一様拡大縮小する」方向ベクトルを作る。
    // これは各点の(x,y)座標そのもの（centeredXを正規化したベクトル）。
    // ※ centeredX は「最初の点を原点に固定した後」の座標なので、
    //   このベクトル方向への変化 = 原点を中心にスケールする動き、に対応する。
    //
    // 重要: nullDirections は「列正規化されたヤコビ行列 Jn」の零空間なので、
    // colNorms でスケールされた座標系の中のベクトルになっている。
    // scaleDir と比較する前に、同じスケーリング（colNormsを掛ける）を
    // 適用する必要がある。そうしないと単位が揃わず、本来平行なベクトル
    // 同士でも直交しているかのように誤判定してしまう。
    const scaledCenteredX = centeredX.map((v, i) => v * colNorms[i]);
    const scaleDirNorm = norm(scaledCenteredX);

    if (scaleDirNorm < 1e-9) {
      // 全点が原点に重なるなど退化しているケース（実質的に判定不能）
      deficiencyKind = 'shapeChanging';
    } else {
      const scaleDir = scaledCenteredX.map((v) => v / scaleDirNorm);

      // 余っている自由度の空間（nullDirectionsが張る空間）に、
      // scaleDirがどれだけ含まれているかを調べる。
      // 固有ベクトルの符号は不定（+v も -v も同じ固有空間を表す）なので、
      // 射影を引く際は符号付きの内積をそのまま使ってよい
      // （射影は方向に関わらず「その軸に沿った成分」を正しく除去するため）。
      let residual = scaleDir.slice();
      for (const dir of nullDirections) {
        const dot = residual.reduce((s, v, i) => s + v * dir[i], 0);
        residual = residual.map((v, i) => v - dot * dir[i]);
      }
      const residualNorm = norm(residual);

      deficiencyKind = deficiency === 1 && residualNorm < 0.15 ? 'scaleOnly' : 'shapeChanging';
    }
  }

  const rank = n - deficiency;
  return { rank, deficiency, eigenvalues, deficiencyKind };
}

export function solve(
  residualFn: ResidualFn,
  x0: number[],
  options: SolveOptions = {}
): SolveResult {
  const {
    maxIterations = 200,
    tolerance = 1e-9,
    initialLambda = 1e-3,
  } = options;

  // 座標の絶対値がこの値を超えたら「発散」とみなして打ち切る。
  // 有限の解として現実的な図形のスケールをはるかに超える値。
  const DIVERGENCE_THRESHOLD = 1e5;

  // 探索の途中経過にだけ、座標が際限なく大きくなるのを防ぐ弱い正則化項を加える。
  // これは「解を歪める」ためではなく、角度条件だけで拘束される点などが
  // 勾配に沿って無限遠に飛んでいってしまい、本来「条件不足」であるべき
  // ケースが数値的に破綻して「矛盾」に誤判定されるのを防ぐための工夫。
  //
  // 正則化の強さは反復が進むにつれて指数的に弱める（アニーリング）。
  // 序盤は発散を防ぐために強めに効かせ、終盤はほぼ0にすることで、
  // 「正則化のせいで本来の残差が収束しきれない」問題を避けつつ、
  // 発散しやすい初期の挙動だけを安全に抑制する。
  const INITIAL_REGULARIZATION = 0.02;
  const REGULARIZATION_DECAY = 0.9; // 反復ごとにこの倍率で弱める

  let x = x0.slice();
  let lambda = initialLambda;
  let regularizationStrength = INITIAL_REGULARIZATION;
  const makeRegularizedFn = (strength: number): ResidualFn => (xx) => {
    const base = residualFn(xx);
    if (strength <= 1e-10) return base;
    const regTerms = xx.map((v) => v * strength);
    return [...base, ...regTerms];
  };

  let iterations = 0;
  let diverged = false;

  for (let iter = 0; iter < maxIterations; iter++) {
    iterations = iter + 1;
    const regularizedResidualFn = makeRegularizedFn(regularizationStrength);
    const { J, r0 } = numericalJacobian(regularizedResidualFn, x);

    // 収束判定は正則化なしの本来の残差で行う
    // （正則化項があるせいで、本当は解けているのに閾値を満たせない、
    //   という誤判定を避けるため）
    const trueCurrentCost = norm(residualFn(x));
    if (trueCurrentCost < tolerance) {
      break;
    }

    const currentCost = norm(r0);
    const JTJ = matMulTranspose(J);
    const JTr = matVecTranspose(J, r0);

    let accepted = false;
    let attempts = 0;

    while (!accepted && attempts < 20) {
      attempts++;
      const A = JTJ.map((row, i) =>
        row.map((v, j) => (i === j ? v * (1 + lambda) : v))
      );
      const b = JTr.map((v) => -v);
      const delta = solveLinearSystem(A, b);

      const xNew = x.map((xi, i) => xi + delta[i]);
      const rNew = regularizedResidualFn(xNew);
      const newCost = norm(rNew);

      if (newCost < currentCost) {
        x = xNew;
        lambda = Math.max(lambda / 3, 1e-12);
        accepted = true;
      } else {
        lambda *= 5;
      }
    }

    if (!accepted) {
      break;
    }

    // 正則化を反復ごとに弱めていく（アニーリング）。
    // 十分小さくなったら完全に0にし、正則化の残滓が最後の精密な収束を
    // 妨げないようにする。
    regularizationStrength *= REGULARIZATION_DECAY;
    if (regularizationStrength < 1e-8) regularizationStrength = 0;

    // 発散チェック: 座標が現実離れした大きさになったら即打ち切る。
    // これ以上続けても数値精度が破綻するだけで、真の矛盾判定を汚染する。
    if (x.some((xi) => Math.abs(xi) > DIVERGENCE_THRESHOLD)) {
      diverged = true;
      break;
    }
  }

  // 最終的な残差評価・収束判定・ランク判定は、必ず正則化なしの本来の
  // 残差関数で行う（正則化項が最終結果の精度や判定に影響しないようにするため）。
  const finalCost = norm(residualFn(x));
  const convergedResult = !diverged && finalCost < 1e-6;
  let status: SolveStatus = 'contradiction';
  let deficiency = 0;

  if (convergedResult) {
    const { J } = numericalJacobian(residualFn, x);
    // x は既に「最初の点が原点」になるよう固定されているので、
    // このままスケール変換の方向ベクトル（原点中心の拡大縮小）として使える。
    const rankInfo = estimateRank(J, x);
    deficiency = rankInfo.deficiency;
    if (deficiency === 0) {
      status = 'ok';
    } else if (rankInfo.deficiencyKind === 'scaleOnly') {
      status = 'underdetermined_similarOnly';
    } else {
      status = 'underdetermined_shapeVaries';
    }
  }

  return {
    x,
    residualNorm: finalCost,
    converged: convergedResult,
    iterations,
    status,
    deficiency,
    diverged,
  };
}
