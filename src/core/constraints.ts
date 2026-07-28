import type { ResidualFn } from './solver';

export interface PointDef {
  name: string;
}

export type Constraint =
  | { id: string; type: 'length'; segment: [string, string]; value: number }
  | { id: string; type: 'lengthEqual'; seg1: [string, string]; seg2: [string, string] }
  | {
      id: string;
      type: 'lengthRatio';
      seg1: [string, string];
      seg2: [string, string];
      ratio: [number, number];
    }
  | { id: string; type: 'angle'; points: [string, string, string]; value: number }
  | {
      id: string;
      type: 'angleEqual';
      angle1: [string, string, string];
      angle2: [string, string, string];
    }
  | {
      id: string;
      type: 'angleRatio';
      angle1: [string, string, string];
      angle2: [string, string, string];
      ratio: [number, number];
    }
  | { id: string; type: 'collinear'; points: string[] }
  | { id: string; type: 'parallel'; seg1: [string, string]; seg2: [string, string] }
  | { id: string; type: 'perpendicular'; seg1: [string, string]; seg2: [string, string] }
  | { id: string; type: 'midpoint'; midpoint: string; seg: [string, string] }
  | { id: string; type: 'onSegment'; point: string; seg: [string, string] }
  | { id: string; type: 'onLine'; point: string; line: [string, string] }
  // --- Version2: 円関連 ---
  | { id: string; type: 'onCircle'; point: string; center: string; radius: string }
  | { id: string; type: 'circleRadius'; center: string; radiusPoint: string; value: number }
  | { id: string; type: 'tangentLine'; center: string; radiusPoint: string; line: [string, string] }
  | { id: string; type: 'tangentCircles'; center1: string; radiusPoint1: string; center2: string; radiusPoint2: string }
  // --- Version2: 三角形の特殊形 ---
  | { id: string; type: 'equilateralTriangle'; points: [string, string, string] }
  | { id: string; type: 'isoscelesTriangle'; apex: string; base: [string, string] }
  | { id: string; type: 'rightTriangle'; rightAngleAt: string; points: [string, string, string] }
  // --- Version3: 三角形の中心 ---
  | { id: string; type: 'centroid'; center: string; triangle: [string, string, string] }
  | { id: string; type: 'circumcenter'; center: string; triangle: [string, string, string] }
  | { id: string; type: 'incenter'; center: string; triangle: [string, string, string] }
  | { id: string; type: 'orthocenter'; center: string; triangle: [string, string, string] }
  // --- Version3: 四角形の特殊形（頂点順 A,B,C,D で周を成す） ---
  | { id: string; type: 'quadrilateral'; points: [string, string, string, string] }
  | { id: string; type: 'parallelogram'; points: [string, string, string, string] }
  | { id: string; type: 'rectangle'; points: [string, string, string, string] }
  | { id: string; type: 'square'; points: [string, string, string, string] }
  | {
      id: string;
      type: 'trapezoid';
      points: [string, string, string, string];
      parallelSides: [[string, string], [string, string]];
    }
  // --- 面積を条件として指定 ---
  | { id: string; type: 'area'; polygon: string[]; value: number }
  // --- 長さが等しい制約のグループ化（3本以上まとめて等しい） ---
  | { id: string; type: 'lengthEqualGroup'; segments: [string, string][] }
  // --- Version4: 相似・合同 ---
  | { id: string; type: 'similarTriangles'; triangle1: [string, string, string]; triangle2: [string, string, string] }
  | { id: string; type: 'congruentTriangles'; triangle1: [string, string, string]; triangle2: [string, string, string] }
  // --- Version4: 接円（三角形の内接円・傍接円） ---
  | { id: string; type: 'incircleTangentPoint'; point: string; triangle: [string, string, string]; side: [string, string] }
  // --- Version4: 高度な円幾何（方べきの定理） ---
  | {
      id: string;
      type: 'powerOfPoint';
      point: string;
      center: string;
      radiusPoint: string;
      // 点から円周上の2点を通る直線を引いたときの交点2つ
      linePoint1: string;
      linePoint2: string;
    }
  // --- Version4: 射影幾何（調和共役点） ---
  | {
      id: string;
      type: 'harmonicConjugate';
      // A, B, C, D が調和点列: (A,B;C,D) = -1
      points: [string, string, string, string];
    }
  // --- 線対称 ---
  | {
      id: string;
      type: 'reflection';
      // point1 と point2 が、直線axisに関して線対称
      point1: string;
      point2: string;
      axis: [string, string];
    }
  // --- 点が図形の外にある ---
  | {
      id: string;
      type: 'pointOutsidePolygon';
      point: string;
      // 多角形の頂点（周を成す順）。三角形なら3点、四角形なら4点など。
      polygon: string[];
    }
  | {
      id: string;
      type: 'pointOutsideCircle';
      point: string;
      center: string;
      radiusPoint: string;
    };

type PointIndex = Record<string, number>;
type Vec2 = [number, number];

export function getPoint(x: number[], pointIndex: PointIndex, name: string): Vec2 {
  const i = pointIndex[name];
  return [x[i * 2], x[i * 2 + 1]];
}

export function dist2(p: Vec2, q: Vec2): number {
  const dx = p[0] - q[0];
  const dy = p[1] - q[1];
  return dx * dx + dy * dy;
}

export function dist(p: Vec2, q: Vec2): number {
  return Math.sqrt(dist2(p, q));
}

export function angleAt(A: Vec2, B: Vec2, C: Vec2): number {
  const v1: Vec2 = [A[0] - B[0], A[1] - B[1]];
  const v2: Vec2 = [C[0] - B[0], C[1] - B[1]];
  const dot = v1[0] * v2[0] + v1[1] * v2[1];
  const cross = v1[0] * v2[1] - v1[1] * v2[0];
  return Math.atan2(cross, dot);
}

// 2つの線分(P1-P2)と(P3-P4)について、交差の「度合い」を表す滑らかな正の値を返す。
// t, u はそれぞれの線分上でのパラメータ位置（0〜1が線分の内側）。
// 交差している（t,uが共に(0,1)の内側）ときに正の値になり、
// 交差から離れるほど滑らかに0へ近づくペナルティ関数。
// 勾配ベースのソルバーが「交差を解消する方向」を認識できるよう、
// 0/1の硬い判定ではなく連続値にしていることが重要。
function crossingPenalty(P1: Vec2, P2: Vec2, P3: Vec2, P4: Vec2): number {
  const d1x = P2[0] - P1[0], d1y = P2[1] - P1[1];
  const d2x = P4[0] - P3[0], d2y = P4[1] - P3[1];

  const denom = d1x * d2y - d1y * d2x;
  if (Math.abs(denom) < 1e-9) return 0; // 平行（交差なし）

  const t = ((P3[0] - P1[0]) * d2y - (P3[1] - P1[1]) * d2x) / denom;
  const u = ((P3[0] - P1[0]) * d1y - (P3[1] - P1[1]) * d1x) / denom;

  // t, u が両方とも[0,1]の範囲に入っているときだけペナルティを課す。
  // 範囲内での "t(1-t)" は 0〜1 の中央(0.5)で最大値0.25を取り、
  // 端(0か1)に近づくほど0に近づく滑らかな山型関数。
  const tPenalty = t > 0 && t < 1 ? t * (1 - t) : 0;
  const uPenalty = u > 0 && u < 1 ? u * (1 - u) : 0;

  if (t <= 0 || t >= 1 || u <= 0 || u >= 1) return 0;

  const SCALE = 50;
  return SCALE * (tPenalty + uPenalty);
}

// 四角形ABCDが自己交差（ちょうちょ結び）している場合に、
// 交差の度合いに応じた滑らかなペナルティ残差を返す。
function nonSelfIntersectingPenalty(A: Vec2, B: Vec2, C: Vec2, D: Vec2): number {
  return crossingPenalty(A, B, C, D) + crossingPenalty(B, C, D, A);
}

export function buildResidualFn(constraint: Constraint, pointIndex: PointIndex): ResidualFn {
  const P = (x: number[], name: string) => getPoint(x, pointIndex, name);

  switch (constraint.type) {
    case 'length': {
      const [a, b] = constraint.segment;
      const v = constraint.value;
      return (x) => [dist2(P(x, a), P(x, b)) - v * v];
    }

    case 'lengthEqual': {
      const [a1, b1] = constraint.seg1;
      const [a2, b2] = constraint.seg2;
      return (x) => [dist2(P(x, a1), P(x, b1)) - dist2(P(x, a2), P(x, b2))];
    }

    case 'lengthRatio': {
      const [a1, b1] = constraint.seg1;
      const [a2, b2] = constraint.seg2;
      const [r1, r2] = constraint.ratio;
      return (x) => [
        r2 * r2 * dist2(P(x, a1), P(x, b1)) - r1 * r1 * dist2(P(x, a2), P(x, b2)),
      ];
    }

    case 'angle': {
      const [a, b, c] = constraint.points;
      const v = constraint.value;
      return (x) => {
        const angle = Math.abs(angleAt(P(x, a), P(x, b), P(x, c)));
        return [angle - v];
      };
    }

    case 'angleEqual': {
      const [a1, b1, c1] = constraint.angle1;
      const [a2, b2, c2] = constraint.angle2;
      return (x) => {
        const angle1 = Math.abs(angleAt(P(x, a1), P(x, b1), P(x, c1)));
        const angle2 = Math.abs(angleAt(P(x, a2), P(x, b2), P(x, c2)));
        return [angle1 - angle2];
      };
    }

    case 'angleRatio': {
      const [a1, b1, c1] = constraint.angle1;
      const [a2, b2, c2] = constraint.angle2;
      const [r1, r2] = constraint.ratio;
      return (x) => {
        const angle1 = Math.abs(angleAt(P(x, a1), P(x, b1), P(x, c1)));
        const angle2 = Math.abs(angleAt(P(x, a2), P(x, b2), P(x, c2)));
        return [r2 * angle1 - r1 * angle2];
      };
    }

    case 'collinear': {
      const [a, b, c] = constraint.points;
      return (x) => {
        const A = P(x, a), B = P(x, b), C = P(x, c);
        const cross = (B[0] - A[0]) * (C[1] - A[1]) - (B[1] - A[1]) * (C[0] - A[0]);
        return [cross];
      };
    }

    case 'parallel': {
      const [a1, b1] = constraint.seg1;
      const [a2, b2] = constraint.seg2;
      return (x) => {
        const A = P(x, a1), B = P(x, b1), C = P(x, a2), D = P(x, b2);
        const v1: Vec2 = [B[0] - A[0], B[1] - A[1]];
        const v2: Vec2 = [D[0] - C[0], D[1] - C[1]];
        return [v1[0] * v2[1] - v1[1] * v2[0]];
      };
    }

    case 'perpendicular': {
      const [a1, b1] = constraint.seg1;
      const [a2, b2] = constraint.seg2;
      return (x) => {
        const A = P(x, a1), B = P(x, b1), C = P(x, a2), D = P(x, b2);
        const v1: Vec2 = [B[0] - A[0], B[1] - A[1]];
        const v2: Vec2 = [D[0] - C[0], D[1] - C[1]];
        return [v1[0] * v2[0] + v1[1] * v2[1]];
      };
    }

    case 'midpoint': {
      const m = constraint.midpoint;
      const [a, b] = constraint.seg;
      return (x) => {
        const M = P(x, m), A = P(x, a), B = P(x, b);
        return [M[0] - (A[0] + B[0]) / 2, M[1] - (A[1] + B[1]) / 2];
      };
    }

    case 'onSegment': {
      // 点が「線分AB上」にある = 直線AB上にあり、かつ A,Bの間（0≤t≤1）に収まっている。
      // 前半（同一直線上）は等式で表せるが、後半（範囲内）は不等式なので、
      // 範囲からはみ出した分だけ大きくなる滑らかなペナルティとして表現する。
      const p = constraint.point;
      const [a, b] = constraint.seg;
      return (x) => {
        const P0 = P(x, p), A = P(x, a), B = P(x, b);
        const cross = (B[0] - A[0]) * (P0[1] - A[1]) - (B[1] - A[1]) * (P0[0] - A[0]);

        // Pを直線AB上に射影したときのパラメータt（A=0, B=1）
        const abx = B[0] - A[0], aby = B[1] - A[1];
        const abLen2 = abx * abx + aby * aby || 1;
        const t = ((P0[0] - A[0]) * abx + (P0[1] - A[1]) * aby) / abLen2;

        // tが[0,1]の範囲を外れた分だけペナルティを課す（範囲内なら0）
        const SCALE = 10;
        const outOfRangePenalty =
          t < 0 ? SCALE * (-t) * Math.sqrt(abLen2) :
          t > 1 ? SCALE * (t - 1) * Math.sqrt(abLen2) :
          0;

        return [cross, outOfRangePenalty];
      };
    }

    case 'onLine': {
      // 点が直線AB上にある（延長線上も含めてよい、範囲制限なし）
      const p = constraint.point;
      const [a, b] = constraint.line;
      return (x) => {
        const P0 = P(x, p), A = P(x, a), B = P(x, b);
        const cross = (B[0] - A[0]) * (P0[1] - A[1]) - (B[1] - A[1]) * (P0[0] - A[0]);
        return [cross];
      };
    }

    // --- Version2: 円関連 ---

    case 'onCircle': {
      // point が center を中心とし radiusPoint を通る円周上にある
      // -> |point-center|^2 - |radiusPoint-center|^2 = 0
      const { point, center, radius } = constraint;
      return (x) => {
        const Pt = P(x, point), C = P(x, center), R = P(x, radius);
        return [dist2(Pt, C) - dist2(R, C)];
      };
    }

    case 'circleRadius': {
      // center を中心とし radiusPoint を通る円の半径が value
      const { center, radiusPoint, value } = constraint;
      return (x) => {
        const C = P(x, center), R = P(x, radiusPoint);
        return [dist2(R, C) - value * value];
      };
    }

    case 'tangentLine': {
      // center-radiusPointで定義される円が、直線lineに接する
      // -> 中心から直線までの距離 = 半径
      // 距離の二乗 - 半径の二乗 = 0 (符号なし距離の二乗は射影公式で計算)
      const { center, radiusPoint, line } = constraint;
      const [a, b] = line;
      return (x) => {
        const C = P(x, center), R = P(x, radiusPoint), A = P(x, a), B = P(x, b);
        const abx = B[0] - A[0], aby = B[1] - A[1];
        const abLen2 = abx * abx + aby * aby;
        // 点Cから直線ABへの符号付き距離（外積 / |AB|）を使い、
        // (距離)^2 * |AB|^2 = 外積^2 という形にして平方根を避ける
        const cross = abx * (C[1] - A[1]) - aby * (C[0] - A[0]);
        const radius2 = dist2(R, C);
        return [cross * cross - radius2 * abLen2];
      };
    }

    case 'tangentCircles': {
      // 2円が外接する（中心間距離 = 半径の和）
      // 距離の二乗 = (r1+r2)^2 という形で残差化
      const { center1, radiusPoint1, center2, radiusPoint2 } = constraint;
      return (x) => {
        const C1 = P(x, center1), R1 = P(x, radiusPoint1);
        const C2 = P(x, center2), R2 = P(x, radiusPoint2);
        const r1 = dist(R1, C1);
        const r2 = dist(R2, C2);
        const centerDist2 = dist2(C1, C2);
        return [centerDist2 - (r1 + r2) * (r1 + r2)];
      };
    }

    // --- Version2: 三角形の特殊形 ---

    case 'equilateralTriangle': {
      // 3辺すべて等しい
      const [a, b, c] = constraint.points;
      return (x) => {
        const A = P(x, a), B = P(x, b), C = P(x, c);
        const ab = dist2(A, B), bc = dist2(B, C), ca = dist2(C, A);
        return [ab - bc, bc - ca];
      };
    }

    case 'isoscelesTriangle': {
      // apexから見て、base[0]とbase[1]への距離が等しい
      const { apex, base } = constraint;
      const [b1, b2] = base;
      return (x) => {
        const A = P(x, apex), B1 = P(x, b1), B2 = P(x, b2);
        return [dist2(A, B1) - dist2(A, B2)];
      };
    }

    case 'rightTriangle': {
      // rightAngleAt を頂点とする角が90度 -> 隣接2辺の内積が0
      const { rightAngleAt, points } = constraint;
      const others = points.filter((p) => p !== rightAngleAt);
      const [p1, p2] = others.length === 2 ? others : [points[0], points[2]];
      return (x) => {
        const V = P(x, rightAngleAt), A = P(x, p1), B = P(x, p2);
        const v1: Vec2 = [A[0] - V[0], A[1] - V[1]];
        const v2: Vec2 = [B[0] - V[0], B[1] - V[1]];
        return [v1[0] * v2[0] + v1[1] * v2[1]];
      };
    }

    // --- Version3: 三角形の中心 ---

    case 'centroid': {
      // 重心 = 3頂点の平均
      const { center, triangle } = constraint;
      const [a, b, c] = triangle;
      return (x) => {
        const G = P(x, center), A = P(x, a), B = P(x, b), C = P(x, c);
        return [
          G[0] - (A[0] + B[0] + C[0]) / 3,
          G[1] - (A[1] + B[1] + C[1]) / 3,
        ];
      };
    }

    case 'circumcenter': {
      // 外心 = 3頂点から等距離な点
      const { center, triangle } = constraint;
      const [a, b, c] = triangle;
      return (x) => {
        const O = P(x, center), A = P(x, a), B = P(x, b), C = P(x, c);
        return [dist2(O, A) - dist2(O, B), dist2(O, B) - dist2(O, C)];
      };
    }

    case 'incenter': {
      // 内心 = 各辺までの符号付き距離が等しい点（かつ三角形の内部）
      // 三角形ABCの内心は I = (a*A + b*B + c*C) / (a+b+c) で表せる
      // ここで a=|BC|, b=|CA|, c=|AB|（対辺の長さ）
      const { center, triangle } = constraint;
      const [a, b, c] = triangle;
      return (x) => {
        const I = P(x, center), A = P(x, a), B = P(x, b), C = P(x, c);
        const lenA = dist(B, C); // 頂点Aの対辺
        const lenB = dist(C, A); // 頂点Bの対辺
        const lenC = dist(A, B); // 頂点Cの対辺
        const sum = lenA + lenB + lenC;
        const ix = (lenA * A[0] + lenB * B[0] + lenC * C[0]) / sum;
        const iy = (lenA * A[1] + lenB * B[1] + lenC * C[1]) / sum;
        return [I[0] - ix, I[1] - iy];
      };
    }

    case 'orthocenter': {
      // 垂心 = 各頂点から対辺への垂線がすべて通る点
      // H-A が BCに垂直、かつ H-B が CAに垂直、という2条件で決まる
      const { center, triangle } = constraint;
      const [a, b, c] = triangle;
      return (x) => {
        const H = P(x, center), A = P(x, a), B = P(x, b), C = P(x, c);
        const HA: Vec2 = [A[0] - H[0], A[1] - H[1]];
        const BC: Vec2 = [C[0] - B[0], C[1] - B[1]];
        const HB: Vec2 = [B[0] - H[0], B[1] - H[1]];
        const CA: Vec2 = [A[0] - C[0], A[1] - C[1]];
        return [
          HA[0] * BC[0] + HA[1] * BC[1],
          HB[0] * CA[0] + HB[1] * CA[1],
        ];
      };
    }

    // --- Version3: 四角形の特殊形（頂点順 A,B,C,D） ---

    case 'quadrilateral': {
      // 「四角形ABCD」という指定そのもの。
      // 特別な形状条件はないが、A→B→C→Dの順で結んだときに
      // 自己交差しない（単純多角形になる）ことをペナルティとして課す。
      const [a, b, c, d] = constraint.points;
      return (x) => {
        const A = P(x, a), B = P(x, b), C = P(x, c), D = P(x, d);
        return [nonSelfIntersectingPenalty(A, B, C, D)];
      };
    }

    case 'parallelogram': {
      // 対角線の中点が一致する -> AC の中点 = BD の中点
      // （この条件だけで自動的に非自己交差な凸四角形になるため、追加のペナルティは不要）
      const [a, b, c, d] = constraint.points;
      return (x) => {
        const A = P(x, a), B = P(x, b), C = P(x, c), D = P(x, d);
        return [
          (A[0] + C[0]) / 2 - (B[0] + D[0]) / 2,
          (A[1] + C[1]) / 2 - (B[1] + D[1]) / 2,
        ];
      };
    }

    case 'rectangle': {
      // 平行四辺形 + 1つの角が直角
      const [a, b, c, d] = constraint.points;
      return (x) => {
        const A = P(x, a), B = P(x, b), C = P(x, c), D = P(x, d);
        const parallelogramResidual = [
          (A[0] + C[0]) / 2 - (B[0] + D[0]) / 2,
          (A[1] + C[1]) / 2 - (B[1] + D[1]) / 2,
        ];
        const AB: Vec2 = [B[0] - A[0], B[1] - A[1]];
        const AD: Vec2 = [D[0] - A[0], D[1] - A[1]];
        const rightAngleResidual = AB[0] * AD[0] + AB[1] * AD[1];
        return [...parallelogramResidual, rightAngleResidual];
      };
    }

    case 'square': {
      // 長方形 + 隣り合う2辺が等しい
      const [a, b, c, d] = constraint.points;
      return (x) => {
        const A = P(x, a), B = P(x, b), C = P(x, c), D = P(x, d);
        const parallelogramResidual = [
          (A[0] + C[0]) / 2 - (B[0] + D[0]) / 2,
          (A[1] + C[1]) / 2 - (B[1] + D[1]) / 2,
        ];
        const AB: Vec2 = [B[0] - A[0], B[1] - A[1]];
        const AD: Vec2 = [D[0] - A[0], D[1] - A[1]];
        const rightAngleResidual = AB[0] * AD[0] + AB[1] * AD[1];
        const equalSidesResidual = dist2(A, B) - dist2(A, D);
        return [...parallelogramResidual, rightAngleResidual, equalSidesResidual];
      };
    }

    case 'trapezoid': {
      // 指定された2辺が平行（頂点順 A,B,C,D は自己交差しない四角形を想定）
      const [a, b, c, d] = constraint.points;
      const [[s1p1, s1p2], [s2p1, s2p2]] = constraint.parallelSides;
      return (x) => {
        const A = P(x, a), B = P(x, b), C = P(x, c), D = P(x, d);
        const S1P1 = P(x, s1p1), S1P2 = P(x, s1p2);
        const S2P1 = P(x, s2p1), S2P2 = P(x, s2p2);

        const v1: Vec2 = [S1P2[0] - S1P1[0], S1P2[1] - S1P1[1]];
        const v2: Vec2 = [S2P2[0] - S2P1[0], S2P2[1] - S2P1[1]];
        const parallelResidual = v1[0] * v2[1] - v1[1] * v2[0];

        const penalty = nonSelfIntersectingPenalty(A, B, C, D);
        return [parallelResidual, penalty];
      };
    }

    // --- 面積を条件として指定 ---

    case 'area': {
      // シューレース公式による多角形の符号付き面積の絶対値 = value
      const value = constraint.value;
      const names = constraint.polygon;
      return (x) => {
        const coords = names.map((name) => P(x, name));
        let sum = 0;
        for (let i = 0; i < coords.length; i++) {
          const p1 = coords[i];
          const p2 = coords[(i + 1) % coords.length];
          sum += p1[0] * p2[1] - p2[0] * p1[1];
        }
        const area = Math.abs(sum) / 2;
        return [area - value];
      };
    }

    // --- 長さが等しい制約のグループ化 ---

    case 'lengthEqualGroup': {
      // 3本以上の線分すべてが等しい長さになるよう、隣接するペアごとに等式を作る
      const segs = constraint.segments;
      return (x) => {
        const lengths2 = segs.map(([a, b]) => dist2(P(x, a), P(x, b)));
        const residuals: number[] = [];
        for (let i = 1; i < lengths2.length; i++) {
          residuals.push(lengths2[i] - lengths2[0]);
        }
        return residuals;
      };
    }

    // --- Version4: 相似・合同 ---

    case 'similarTriangles': {
      // AA相似条件: 対応する2組の角がそれぞれ等しい（頂点の対応順: 1番目どうし、2番目どうし、3番目どうし）
      const [a1, b1, c1] = constraint.triangle1;
      const [a2, b2, c2] = constraint.triangle2;
      return (x) => {
        const A1 = P(x, a1), B1 = P(x, b1), C1 = P(x, c1);
        const A2 = P(x, a2), B2 = P(x, b2), C2 = P(x, c2);
        // 頂点1の角(B1A1C1) = 頂点1'の角(B2A2C2)
        const angle1a = Math.abs(angleAt(B1, A1, C1));
        const angle1b = Math.abs(angleAt(B2, A2, C2));
        // 頂点2の角(A1B1C1) = 頂点2'の角(A2B2C2)
        const angle2a = Math.abs(angleAt(A1, B1, C1));
        const angle2b = Math.abs(angleAt(A2, B2, C2));
        return [angle1a - angle1b, angle2a - angle2b];
      };
    }

    case 'congruentTriangles': {
      // 合同 = 対応する3辺がすべて等しい（頂点の対応順そのまま）
      const [a1, b1, c1] = constraint.triangle1;
      const [a2, b2, c2] = constraint.triangle2;
      return (x) => {
        const A1 = P(x, a1), B1 = P(x, b1), C1 = P(x, c1);
        const A2 = P(x, a2), B2 = P(x, b2), C2 = P(x, c2);
        return [
          dist2(A1, B1) - dist2(A2, B2),
          dist2(B1, C1) - dist2(B2, C2),
          dist2(C1, A1) - dist2(C2, A2),
        ];
      };
    }

    // --- Version4: 接円 ---

    case 'incircleTangentPoint': {
      // 三角形の内接円が辺sideに接する接点がpointである
      // 接点は、辺side上にあり、かつ内心から接点までの距離が内接円の半径に等しい
      const { point, triangle, side } = constraint;
      const [a, b, c] = triangle;
      const [s1, s2] = side;
      return (x) => {
        const Pt = P(x, point), A = P(x, a), B = P(x, b), C = P(x, c);
        const S1 = P(x, s1), S2 = P(x, s2);

        // 内心の座標
        const lenA = dist(B, C), lenB = dist(C, A), lenC = dist(A, B);
        const sum = lenA + lenB + lenC;
        const incenterX = (lenA * A[0] + lenB * B[0] + lenC * C[0]) / sum;
        const incenterY = (lenA * A[1] + lenB * B[1] + lenC * C[1]) / sum;
        const I: Vec2 = [incenterX, incenterY];

        // 接点は辺side上にある
        const onSideResidual =
          (S2[0] - S1[0]) * (Pt[1] - S1[1]) - (S2[1] - S1[1]) * (Pt[0] - S1[0]);

        // 接点は、内心から辺sideへの垂線の足である（IPt ⊥ side）
        const IPt: Vec2 = [Pt[0] - I[0], Pt[1] - I[1]];
        const sideVec: Vec2 = [S2[0] - S1[0], S2[1] - S1[1]];
        const perpResidual = IPt[0] * sideVec[0] + IPt[1] * sideVec[1];

        return [onSideResidual, perpResidual];
      };
    }

    // --- Version4: 高度な円幾何（方べきの定理） ---

    case 'powerOfPoint': {
      // 点Pから円に引いた割線が円周とA,Bで交わるとき、PA×PB は割線の向きによらず一定（方べき）
      // ここでは「点Pが、円との交点であるlinePoint1・linePoint2を通る直線上にある」ことと
      // 「PA×PB = |P-center|^2 - radius^2」という方べきの定義式を残差にする
      const { point, center, radiusPoint, linePoint1, linePoint2 } = constraint;
      return (x) => {
        const Pt = P(x, point), C = P(x, center), R = P(x, radiusPoint);
        const L1 = P(x, linePoint1), L2 = P(x, linePoint2);

        const radius2 = dist2(R, C);
        const power = dist2(Pt, C) - radius2;

        // PがL1,L2を通る直線上にある
        const onLineResidual =
          (L2[0] - L1[0]) * (Pt[1] - L1[1]) - (L2[1] - L1[1]) * (Pt[0] - L1[0]);

        // 符号付き距離の積 = 方べき（PL1・PL2 のベクトル内積を使うと、
        // 同一直線上なら符号付き長さの積と一致する）
        const PL1: Vec2 = [L1[0] - Pt[0], L1[1] - Pt[1]];
        const PL2: Vec2 = [L2[0] - Pt[0], L2[1] - Pt[1]];
        // 同一直線上にある前提で、内積の符号付き大きさが符号付き長さの積に対応
        const dotSign = PL1[0] * PL2[0] + PL1[1] * PL2[1] >= 0 ? 1 : -1;
        const signedProduct = dotSign * dist(Pt, L1) * dist(Pt, L2);

        return [onLineResidual, signedProduct - power];
      };
    }

    // --- Version4: 射影幾何（調和共役点） ---

    case 'harmonicConjugate': {
      // A,B,C,Dが同一直線上にあり、複比(A,B;C,D) = -1 となる
      // 複比 = (AC/CB) / (AD/DB) （符号付き長さの比）
      const [a, b, c, d] = constraint.points;
      return (x) => {
        const A = P(x, a), B = P(x, b), C = P(x, c), D = P(x, d);

        // 4点が同一直線上にある（AとBを基準線とする）
        const dir: Vec2 = [B[0] - A[0], B[1] - A[1]];
        const dirLen = Math.sqrt(dir[0] * dir[0] + dir[1] * dir[1]) || 1;
        const unitDir: Vec2 = [dir[0] / dirLen, dir[1] / dirLen];

        const collinearC =
          (B[0] - A[0]) * (C[1] - A[1]) - (B[1] - A[1]) * (C[0] - A[0]);
        const collinearD =
          (B[0] - A[0]) * (D[1] - A[1]) - (B[1] - A[1]) * (D[0] - A[0]);

        // 各点をAを原点とした符号付き1次元座標に射影
        const project = (Pt: Vec2) => (Pt[0] - A[0]) * unitDir[0] + (Pt[1] - A[1]) * unitDir[1];
        const tA = 0;
        const tB = project(B);
        const tC = project(C);
        const tD = project(D);

        // 複比 (A,B;C,D) = ((tC-tA)/(tC-tB)) / ((tD-tA)/(tD-tB)) = -1
        // -> (tC-tA)*(tD-tB) + (tC-tB)*(tD-tA) = 0 の形に変形（割り算を避ける）
        const crossRatioResidual =
          (tC - tA) * (tD - tB) + (tC - tB) * (tD - tA);

        return [collinearC, collinearD, crossRatioResidual];
      };
    }

    // --- 線対称 ---

    case 'reflection': {
      // point1とpoint2が、直線axisに関して線対称であるための条件は2つ：
      // (1) point1とpoint2を結ぶ線分の中点が、axis上にある
      // (2) point1とpoint2を結ぶ線分が、axisに対して垂直である
      const { point1, point2, axis } = constraint;
      const [axisA, axisB] = axis;
      return (x) => {
        const P1 = P(x, point1), P2 = P(x, point2);
        const A = P(x, axisA), B = P(x, axisB);

        const mid: Vec2 = [(P1[0] + P2[0]) / 2, (P1[1] + P2[1]) / 2];

        // 中点がaxis上にある（同一直線上）
        const midOnAxis =
          (B[0] - A[0]) * (mid[1] - A[1]) - (B[1] - A[1]) * (mid[0] - A[0]);

        // P1P2 が axis に垂直
        const p1p2: Vec2 = [P2[0] - P1[0], P2[1] - P1[1]];
        const axisDir: Vec2 = [B[0] - A[0], B[1] - A[1]];
        const perpendicular = p1p2[0] * axisDir[0] + p1p2[1] * axisDir[1];

        return [midOnAxis, perpendicular];
      };
    }

    // --- 点が図形の外にある ---

    case 'pointOutsidePolygon': {
      // 点が多角形の内部にある場合にだけ、内部への侵入度合いに応じた
      // 滑らかなペナルティを課す（外部にあればペナルティは0）。
      // 内外判定には巻き数（winding number）の考え方を使い、
      // 凸・凹どちらの多角形にも対応できるようにする。
      const { point, polygon } = constraint;
      return (x) => {
        const Pt = P(x, point);
        const vertices = polygon.map((name) => P(x, name));

        // 巻き数を使った内外判定（点が多角形の内部なら概ね±2π、外部なら0に近い）
        let angleSum = 0;
        for (let i = 0; i < vertices.length; i++) {
          const V1 = vertices[i];
          const V2 = vertices[(i + 1) % vertices.length];
          const v1: Vec2 = [V1[0] - Pt[0], V1[1] - Pt[1]];
          const v2: Vec2 = [V2[0] - Pt[0], V2[1] - Pt[1]];
          const cross = v1[0] * v2[1] - v1[1] * v2[0];
          const dot = v1[0] * v2[0] + v1[1] * v2[1];
          angleSum += Math.atan2(cross, dot);
        }
        const isInside = Math.abs(angleSum) > Math.PI; // 内部なら|angleSum|≈2π、外部なら≈0

        if (!isInside) return [0];

        // 内部にある場合、多角形の重心から点までの距離を使い、
        // 「重心にいるほど大きく、辺に近いほど小さくなる」滑らかなペナルティを作る。
        // 正確な最短距離ではないが、内部にいる限りペナルティが働き、
        // ソルバーを外へ押し出す勾配としては十分機能する。
        const centroid: Vec2 = [
          vertices.reduce((s, v) => s + v[0], 0) / vertices.length,
          vertices.reduce((s, v) => s + v[1], 0) / vertices.length,
        ];
        const distToCentroid = Math.sqrt(
          (Pt[0] - centroid[0]) ** 2 + (Pt[1] - centroid[1]) ** 2
        );
        // 多角形のおおよその大きさ（重心から各頂点までの平均距離）を基準にする
        const avgRadius =
          vertices.reduce(
            (s, v) => s + Math.sqrt((v[0] - centroid[0]) ** 2 + (v[1] - centroid[1]) ** 2),
            0
          ) / vertices.length;
        const penalty = Math.max(avgRadius - distToCentroid, 0) * 20;

        return [penalty];
      };
    }

    case 'pointOutsideCircle': {
      // 点が円の内部にある場合にだけ、侵入度合いに応じたペナルティを課す
      const { point, center, radiusPoint } = constraint;
      return (x) => {
        const Pt = P(x, point), C = P(x, center), R = P(x, radiusPoint);
        const radius = dist(R, C);
        const distToCenter = dist(Pt, C);
        // 内部（distToCenter < radius）にいる分だけペナルティ。外部なら0。
        const penalty = Math.max(radius - distToCenter, 0) * 5;
        return [penalty];
      };
    }

    default: {
      const _exhaustive: never = constraint;
      throw new Error(`Unknown constraint type: ${JSON.stringify(_exhaustive)}`);
    }
  }
}

export interface FixOptions {
  fixFirstPoint?: boolean;
  fixSecondPointOnXAxis?: boolean;
}

export function buildSystem(
  points: PointDef[],
  constraints: Constraint[],
  fixOptions: FixOptions = {}
): ResidualFn {
  const pointIndex: PointIndex = {};
  points.forEach((p, i) => (pointIndex[p.name] = i));

  const constraintFns = constraints.map((c) => buildResidualFn(c, pointIndex));

  const { fixFirstPoint = true, fixSecondPointOnXAxis = true } = fixOptions;

  return function residualFn(x: number[]): number[] {
    let residuals: number[] = [];
    for (const fn of constraintFns) {
      residuals = residuals.concat(fn(x));
    }

    if (fixFirstPoint && points.length >= 1) {
      residuals.push(x[0] - 0);
      residuals.push(x[1] - 0);
    }
    if (fixSecondPointOnXAxis && points.length >= 2) {
      residuals.push(x[3] - 0);
    }

    return residuals;
  };
}
