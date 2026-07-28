import { create } from 'zustand';
import type { Constraint, PointDef } from './constraints';
import { buildSystem } from './constraints';
import { solve } from './solver';

export type QueryType = 'length' | 'angle' | 'coordinate' | 'area' | 'perimeter' | 'lengthRatioQuery';

export interface Query {
  id: string;
  type: QueryType;
  // length: segment指定 / angle: points指定 / coordinate: point指定
  segment?: [string, string];
  points?: [string, string, string];
  point?: string;
  // area / perimeter: polygon（3点以上）を指定
  polygon?: string[];
  // lengthRatioQuery: 2つの線分の比を尋ねる
  seg1?: [string, string];
  seg2?: [string, string];
}

export interface SolvedPoint {
  name: string;
  x: number;
  y: number;
}

export interface QueryResult {
  id: string;
  label: string;
  value: string;
}

export type SolveStatusUI =
  | 'idle'
  | 'ok'
  | 'underdetermined_similarOnly'
  | 'underdetermined_shapeVaries'
  | 'contradiction';

interface AppState {
  points: PointDef[];
  constraints: Constraint[];
  queries: Query[];

  solvedPoints: SolvedPoint[];
  queryResults: QueryResult[];
  solveStatus: SolveStatusUI;
  deficiency: number;

  addPoint: (name: string) => { ok: boolean; error?: string };
  removePoint: (name: string) => void;
  renamePoint: (oldName: string, newName: string) => { ok: boolean; error?: string };

  addConstraint: (c: Omit<Constraint, 'id'>) => void;
  removeConstraint: (id: string) => void;

  addQuery: (q: Omit<Query, 'id'>) => void;
  removeQuery: (id: string) => void;

  runSolve: () => void;
}

let idCounter = 0;
function genId(): string {
  idCounter += 1;
  return `id_${idCounter}`;
}

function formatNumber(n: number): string {
  const rounded = Math.round(n * 1000) / 1000;
  return rounded.toString();
}

export const useAppStore = create<AppState>((set, get) => ({
  points: [],
  constraints: [],
  queries: [],
  solvedPoints: [],
  queryResults: [],
  solveStatus: 'idle',
  deficiency: 0,

  addPoint: (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return { ok: false, error: '点名を入力してください' };
    const { points } = get();
    if (points.some((p) => p.name === trimmed)) {
      return { ok: false, error: `点名「${trimmed}」は既に使われています` };
    }
    set({ points: [...points, { name: trimmed }] });
    return { ok: true };
  },

  removePoint: (name: string) => {
    const { points, constraints, queries } = get();
    // 関連する制約・クエリも一緒に削除（不整合防止）
    const usesPoint = (names: (string | undefined)[]) => names.includes(name);

    // 制約が指定された点を参照しているかどうかを、型ごとに網羅的に判定する。
    // 新しい制約タイプを追加したときは、ここにもケースを追加すること
    // （追加を忘れると、削除したはずの点を参照する制約が残り続けるバグになる）。
    const constraintUsesPoint = (c: Constraint): boolean => {
      switch (c.type) {
        case 'length':
          return usesPoint(c.segment);
        case 'lengthEqual':
          return usesPoint(c.seg1) || usesPoint(c.seg2);
        case 'lengthEqualGroup':
          return c.segments.some((seg) => usesPoint(seg));
        case 'lengthRatio':
          return usesPoint(c.seg1) || usesPoint(c.seg2);
        case 'angle':
          return usesPoint(c.points);
        case 'angleEqual':
        case 'angleRatio':
          return usesPoint(c.angle1) || usesPoint(c.angle2);
        case 'collinear':
          return c.points.includes(name);
        case 'parallel':
        case 'perpendicular':
          return usesPoint(c.seg1) || usesPoint(c.seg2);
        case 'midpoint':
          return c.midpoint === name || usesPoint(c.seg);
        case 'onSegment':
          return c.point === name || usesPoint(c.seg);
        case 'onLine':
          return c.point === name || usesPoint(c.line);
        case 'onCircle':
          return c.point === name || c.center === name || c.radius === name;
        case 'circleRadius':
          return c.center === name || c.radiusPoint === name;
        case 'tangentLine':
          return c.center === name || c.radiusPoint === name || usesPoint(c.line);
        case 'tangentCircles':
          return [c.center1, c.radiusPoint1, c.center2, c.radiusPoint2].includes(name);
        case 'equilateralTriangle':
        case 'rightTriangle':
          return c.points.includes(name);
        case 'isoscelesTriangle':
          return c.apex === name || usesPoint(c.base);
        case 'centroid':
        case 'circumcenter':
        case 'incenter':
        case 'orthocenter':
          return c.center === name || c.triangle.includes(name);
        case 'quadrilateral':
        case 'parallelogram':
        case 'rectangle':
        case 'square':
          return c.points.includes(name);
        case 'trapezoid':
          return (
            c.points.includes(name) ||
            usesPoint(c.parallelSides[0]) ||
            usesPoint(c.parallelSides[1])
          );
        case 'area':
          return c.polygon.includes(name);
        case 'similarTriangles':
        case 'congruentTriangles':
          return c.triangle1.includes(name) || c.triangle2.includes(name);
        case 'incircleTangentPoint':
          return c.point === name || c.triangle.includes(name) || usesPoint(c.side);
        case 'powerOfPoint':
          return (
            c.point === name ||
            c.center === name ||
            c.radiusPoint === name ||
            c.linePoint1 === name ||
            c.linePoint2 === name
          );
        case 'harmonicConjugate':
          return c.points.includes(name);
        case 'reflection':
          return c.point1 === name || c.point2 === name || usesPoint(c.axis);
        case 'pointOutsidePolygon':
          return c.point === name || c.polygon.includes(name);
        case 'pointOutsideCircle':
          return c.point === name || c.center === name || c.radiusPoint === name;
        default:
          return false;
      }
    };

    const newConstraints = constraints.filter((c) => !constraintUsesPoint(c));

    const newQueries = queries.filter((q) => {
      if (q.type === 'length') return !q.segment || !usesPoint(q.segment);
      if (q.type === 'angle') return !q.points || !usesPoint(q.points);
      if (q.type === 'coordinate') return q.point !== name;
      if (q.type === 'area' || q.type === 'perimeter') return !q.polygon || !q.polygon.includes(name);
      if (q.type === 'lengthRatioQuery') {
        return !((q.seg1 && usesPoint(q.seg1)) || (q.seg2 && usesPoint(q.seg2)));
      }
      return true;
    });

    set({
      points: points.filter((p) => p.name !== name),
      constraints: newConstraints,
      queries: newQueries,
    });
  },

  renamePoint: (oldName, newName) => {
    const trimmed = newName.trim();
    if (!trimmed) return { ok: false, error: '点名を入力してください' };
    const { points } = get();
    if (points.some((p) => p.name === trimmed && p.name !== oldName)) {
      return { ok: false, error: `点名「${trimmed}」は既に使われています` };
    }

    const rename = (n: string) => (n === oldName ? trimmed : n);
    const renameTuple = (arr: string[]) => arr.map(rename);

    // 制約オブジェクト内の「点名を保持しているプロパティ」をすべて洗い出してリネームする。
    // 新しい制約タイプを追加したときは、ここにもプロパティを追加すること
    // （追加を忘れると、点の名前を変えたときに古い名前のまま制約に残ってしまうバグになる）。
    const renameConstraint = (c: Constraint): Constraint => {
      const copy: any = { ...c };
      if ('segment' in copy) copy.segment = renameTuple(copy.segment);
      if ('seg1' in copy) copy.seg1 = renameTuple(copy.seg1);
      if ('seg2' in copy) copy.seg2 = renameTuple(copy.seg2);
      if ('segments' in copy && Array.isArray(copy.segments)) {
        copy.segments = copy.segments.map((seg: string[]) => renameTuple(seg));
      }
      if ('points' in copy && Array.isArray(copy.points)) copy.points = renameTuple(copy.points);
      if ('angle1' in copy) copy.angle1 = renameTuple(copy.angle1);
      if ('angle2' in copy) copy.angle2 = renameTuple(copy.angle2);
      if ('midpoint' in copy) copy.midpoint = rename(copy.midpoint);
      if ('point' in copy) copy.point = rename(copy.point);
      if ('point1' in copy) copy.point1 = rename(copy.point1);
      if ('point2' in copy) copy.point2 = rename(copy.point2);
      if ('axis' in copy) copy.axis = renameTuple(copy.axis);
      if ('line' in copy) copy.line = renameTuple(copy.line);
      if ('seg' in copy) copy.seg = renameTuple(copy.seg);
      if ('center' in copy) copy.center = rename(copy.center);
      if ('center1' in copy) copy.center1 = rename(copy.center1);
      if ('center2' in copy) copy.center2 = rename(copy.center2);
      if ('radius' in copy) copy.radius = rename(copy.radius);
      if ('radiusPoint' in copy) copy.radiusPoint = rename(copy.radiusPoint);
      if ('radiusPoint1' in copy) copy.radiusPoint1 = rename(copy.radiusPoint1);
      if ('radiusPoint2' in copy) copy.radiusPoint2 = rename(copy.radiusPoint2);
      if ('apex' in copy) copy.apex = rename(copy.apex);
      if ('base' in copy) copy.base = renameTuple(copy.base);
      if ('triangle' in copy) copy.triangle = renameTuple(copy.triangle);
      if ('triangle1' in copy) copy.triangle1 = renameTuple(copy.triangle1);
      if ('triangle2' in copy) copy.triangle2 = renameTuple(copy.triangle2);
      if ('side' in copy) copy.side = renameTuple(copy.side);
      if ('polygon' in copy) copy.polygon = renameTuple(copy.polygon);
      if ('parallelSides' in copy && Array.isArray(copy.parallelSides)) {
        copy.parallelSides = copy.parallelSides.map((side: string[]) => renameTuple(side));
      }
      if ('linePoint1' in copy) copy.linePoint1 = rename(copy.linePoint1);
      if ('linePoint2' in copy) copy.linePoint2 = rename(copy.linePoint2);
      if ('rightAngleAt' in copy) copy.rightAngleAt = rename(copy.rightAngleAt);
      return copy;
    };

    set((state) => ({
      points: state.points.map((p) => (p.name === oldName ? { name: trimmed } : p)),
      constraints: state.constraints.map(renameConstraint),
      queries: state.queries.map((q) => {
        const copy = { ...q };
        if (copy.segment) copy.segment = renameTuple(copy.segment) as [string, string];
        if (copy.points) copy.points = renameTuple(copy.points) as [string, string, string];
        if (copy.point) copy.point = rename(copy.point);
        if (copy.polygon) copy.polygon = renameTuple(copy.polygon);
        if (copy.seg1) copy.seg1 = renameTuple(copy.seg1) as [string, string];
        if (copy.seg2) copy.seg2 = renameTuple(copy.seg2) as [string, string];
        return copy;
      }),
    }));
    return { ok: true };
  },

  addConstraint: (c) => {
    set((state) => ({ constraints: [...state.constraints, { ...c, id: genId() } as Constraint] }));
  },

  removeConstraint: (id) => {
    set((state) => ({ constraints: state.constraints.filter((c) => c.id !== id) }));
  },

  addQuery: (q) => {
    set((state) => ({ queries: [...state.queries, { ...q, id: genId() }] }));
  },

  removeQuery: (id) => {
    set((state) => ({ queries: state.queries.filter((q) => q.id !== id) }));
  },

  runSolve: () => {
    const { points, constraints, queries } = get();

    if (points.length === 0) {
      set({ solvedPoints: [], queryResults: [], solveStatus: 'idle', deficiency: 0 });
      return;
    }

    const pointIndex: Record<string, number> = {};
    points.forEach((p, i) => (pointIndex[p.name] = i));

    const residualFn = buildSystem(points, constraints);
    const n = points.length;

    // 複数の初期値パターンでリトライし、発散しない中で最も残差が小さい結果を採用する。
    // 1パターンの初期値だけだと、自由度が余っている点（例: 角度条件だけで
    // 位置が定まらない点）が無限遠に発散し、本来「条件不足」であるべきケースを
    // 誤って「矛盾」と判定してしまうことがあるための対策。
    //
    // 固定8パターンだけだと、条件セットによっては偶然すべて発散してしまう
    // ケースがあることが分かったため、非発散の結果が一定数集まるまで、
    // または試行回数の上限に達するまでリトライを続ける方式に変更する。
    function makeInitialGuess(seed: number): number[] {
      const x0: number[] = [];
      // seedを使って疑似ランダムに近い、多様な配置を作る
      // （単純な等間隔の角度オフセットだけだと、特定の対称性を持つ
      //   条件セットで毎回同じような発散を起こしやすいため、
      //   半径・角度の揺らぎ方をseedごとに大きく変える）
      const angleOffset = seed * 2.399963; // 黄金角に近い無理数的な間隔で回転をずらす
      const radiusBase = 1.5 + ((seed * 1.618) % 4); // 1.5〜5.5の範囲で変動
      for (let i = 0; i < n; i++) {
        const angle = (2 * Math.PI * i) / n + angleOffset;
        const radius = radiusBase + i * 0.31 * ((seed % 2 === 0) ? 1 : -1);
        x0.push(radius * Math.cos(angle) + i * 0.13 + seed * 0.07);
        x0.push(radius * Math.sin(angle) + i * 0.11 - seed * 0.05);
      }
      return x0;
    }

    const MIN_SUCCESSFUL = 3; // 「本当に収束成功した」結果がこれだけ集まれば十分とみなす
    const MAX_ATTEMPTS = 60; // これ以上は試行しない（無限リトライ防止）

    const results: ReturnType<typeof solve>[] = [];
    let successfulCount = 0;
    for (let i = 0; i < MAX_ATTEMPTS; i++) {
      const seed = i * 0.6 + (i % 3) * 0.21; // シードの並びに単純な周期性を持たせない
      const r = solve(residualFn, makeInitialGuess(seed));
      results.push(r);
      // 「発散していない」だけでなく「実際に収束できた(contradictionでない)」ことを
      // 成功の基準にする。発散はしていないが反復回数切れで収束しきれていない
      // ケース（数値的に不安定な初期値に当たった場合など）を、成功として
      // 誤ってカウントしないようにするため。
      if (r.status !== 'contradiction') successfulCount++;
      if (successfulCount >= MIN_SUCCESSFUL) break;
    }

    // 「本当に収束成功した」結果があればその中から、なければ「発散していない」結果から、
    // それもなければ全結果から、最も残差が小さいものを選ぶ。
    const successful = results.filter((r) => r.status !== 'contradiction');
    const nonDiverged = results.filter((r) => !r.diverged);
    const candidates = successful.length > 0 ? successful : nonDiverged.length > 0 ? nonDiverged : results;
    const result = candidates.reduce((best, cur) =>
      cur.residualNorm < best.residualNorm ? cur : best
    );

    const solvedPoints: SolvedPoint[] = points.map((p, i) => ({
      name: p.name,
      x: result.x[i * 2],
      y: result.x[i * 2 + 1],
    }));

    let queryResults: QueryResult[] = [];
    if (result.status !== 'contradiction') {
      queryResults = queries.map((q) => {
        if (q.type === 'length' && q.segment) {
          const [a, b] = q.segment;
          const pa = solvedPoints.find((p) => p.name === a)!;
          const pb = solvedPoints.find((p) => p.name === b)!;
          const d = Math.sqrt((pa.x - pb.x) ** 2 + (pa.y - pb.y) ** 2);
          return { id: q.id, label: `${a}${b}`, value: formatNumber(d) };
        }
        if (q.type === 'angle' && q.points) {
          const [a, b, c] = q.points;
          const pa = solvedPoints.find((p) => p.name === a)!;
          const pb = solvedPoints.find((p) => p.name === b)!;
          const pc = solvedPoints.find((p) => p.name === c)!;
          const v1 = [pa.x - pb.x, pa.y - pb.y];
          const v2 = [pc.x - pb.x, pc.y - pb.y];
          const dot = v1[0] * v2[0] + v1[1] * v2[1];
          const cross = v1[0] * v2[1] - v1[1] * v2[0];
          const angleRad = Math.abs(Math.atan2(cross, dot));
          const angleDeg = (angleRad * 180) / Math.PI;
          return { id: q.id, label: `∠${a}${b}${c}`, value: `${formatNumber(angleDeg)}°` };
        }
        if (q.type === 'coordinate' && q.point) {
          const p = solvedPoints.find((pt) => pt.name === q.point)!;
          return {
            id: q.id,
            label: q.point,
            value: `(${formatNumber(p.x)}, ${formatNumber(p.y)})`,
          };
        }
        if (q.type === 'area' && q.polygon && q.polygon.length >= 3) {
          const pts = q.polygon.map((name) => solvedPoints.find((p) => p.name === name)!);
          // シューレース公式（多角形の面積）
          let sum = 0;
          for (let i = 0; i < pts.length; i++) {
            const p1 = pts[i];
            const p2 = pts[(i + 1) % pts.length];
            sum += p1.x * p2.y - p2.x * p1.y;
          }
          const area = Math.abs(sum) / 2;
          return { id: q.id, label: `${q.polygon.join('')} の面積`, value: formatNumber(area) };
        }
        if (q.type === 'perimeter' && q.polygon && q.polygon.length >= 3) {
          const pts = q.polygon.map((name) => solvedPoints.find((p) => p.name === name)!);
          let perimeter = 0;
          for (let i = 0; i < pts.length; i++) {
            const p1 = pts[i];
            const p2 = pts[(i + 1) % pts.length];
            perimeter += Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
          }
          return { id: q.id, label: `${q.polygon.join('')} の周長`, value: formatNumber(perimeter) };
        }
        if (q.type === 'lengthRatioQuery' && q.seg1 && q.seg2) {
          const [a1, b1] = q.seg1;
          const [a2, b2] = q.seg2;
          const pa1 = solvedPoints.find((p) => p.name === a1)!;
          const pb1 = solvedPoints.find((p) => p.name === b1)!;
          const pa2 = solvedPoints.find((p) => p.name === a2)!;
          const pb2 = solvedPoints.find((p) => p.name === b2)!;
          const d1 = Math.sqrt((pa1.x - pb1.x) ** 2 + (pa1.y - pb1.y) ** 2);
          const d2 = Math.sqrt((pa2.x - pb2.x) ** 2 + (pa2.y - pb2.y) ** 2);
          const ratio = d2 === 0 ? Infinity : d1 / d2;
          return {
            id: q.id,
            label: `${a1}${b1} : ${a2}${b2}`,
            value: `${formatNumber(ratio)} : 1`,
          };
        }
        return { id: q.id, label: '?', value: '-' };
      });
    }

    set({
      solvedPoints,
      queryResults,
      solveStatus: result.status,
      deficiency: result.deficiency,
    });
  },
}));
