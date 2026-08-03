import type { Constraint } from './constraints';
import type { Query } from './store';

export interface Template {
  id: string;
  title: string;
  description: string;
  points: string[];
  // 判別共用体の配列リテラルはTypeScriptが各要素の型を個別に絞り込めず
  // プロパティ不一致エラーになりやすいため、テンプレート定義側では any 経由で
  // 緩やかに型付けし、実際の型安全性は constraints.ts 側の buildResidualFn の
  // switch文（網羅性チェック付き）で担保する。
  constraints: any[];
  queries: any[];
}

// ① ラングレーの問題
// AB=AC, ∠BAC=20° の二等辺三角形ABC。辺AB上に点E、辺AC上に点Dをとり
// ∠CBD=60°, ∠ECB=50° となるようにしたとき、∠BDE の大きさを求めよ。
const langley: Template = {
  id: 'langley',
  title: 'ラングレーの問題',
  description:
    'AB=AC, ∠BAC=20° の二等辺三角形ABCがある。辺AB上に点E、辺AC上に点Dをとり∠CBD=60°, ∠ECB=50° となるようにしたとき、∠BDEの大きさを求めよ。',
  points: ['A', 'B', 'C', 'D', 'E'],
  constraints: [
    { type: 'length', segment: ['A', 'B'], value: 1 },
    { type: 'lengthEqual', seg1: ['A', 'B'], seg2: ['A', 'C'] },
    { type: 'angle', points: ['B', 'A', 'C'], value: (20 * Math.PI) / 180 },
    { type: 'onSegment', point: 'E', seg: ['A', 'B'] },
    { type: 'onSegment', point: 'D', seg: ['A', 'C'] },
    { type: 'angle', points: ['C', 'B', 'D'], value: (60 * Math.PI) / 180 },
    { type: 'angle', points: ['E', 'C', 'B'], value: (50 * Math.PI) / 180 },
  ],
  queries: [{ type: 'angle', points: ['B', 'D', 'E'] }],
};

// ② 京大入試2013年第一問
// 平行四辺形ABCDにおいて、辺ABを1:1に内分する点をE, 辺BCを2:1に内分する点をF,
// 辺CDを3:1に内分する点をG。線分CEと線分FGの交点をP、線分APを延長した直線と
// 辺BCの交点をQとするとき、比AP:PQを求めよ。
const kyodai2013: Template = {
  id: 'kyodai2013',
  title: '京大入試2013年 第一問',
  description:
    '平行四辺形ABCDにおいて、辺ABを1:1に内分する点をE, 辺BCを2:1に内分する点をF, 辺CDを3:1に内分する点をGとする。線分CEと線分FGの交点をP、線分APを延長した直線と辺BCの交点をQとするとき、比AP:PQを求めよ。',
  points: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'P', 'Q'],
  constraints: [
    { type: 'length', segment: ['A', 'B'], value: 2 },
    { type: 'parallelogram', points: ['A', 'B', 'C', 'D'] },
    { type: 'length', segment: ['A', 'D'], value: 1.4 },
    { type: 'internalDivision', point: 'E', seg: ['A', 'B'], ratio: [1, 1] },
    { type: 'internalDivision', point: 'F', seg: ['B', 'C'], ratio: [2, 1] },
    { type: 'internalDivision', point: 'G', seg: ['C', 'D'], ratio: [3, 1] },
    { type: 'onLine', point: 'P', line: ['C', 'E'] },
    { type: 'onLine', point: 'P', line: ['F', 'G'] },
    { type: 'onLine', point: 'Q', line: ['A', 'P'] },
    { type: 'onLine', point: 'Q', line: ['B', 'C'] },
  ],
  queries: [{ type: 'lengthRatioQuery', seg1: ['A', 'P'], seg2: ['P', 'Q'] }],
};

// ③ 灘中学校2026年度1日目第9問
// 四角形ABCDは長方形、四角形DEFGは正方形。点Fは対角線BD上にあり、点Gは辺BC上にある。
// GCの長さは①cm。辺ADと辺EFが交わる点をHとすると、AHの長さは②cm。
//
// 長方形ABCDの辺の長さは問題文に明示されていないため、代表値として
// AB=一定値・AD=一定値を仮定する（実際の入試ではこれらの値が別途与えられているはず）。
// 注意: この構成（Fが対角線BD上、Gが辺BC上）が成立するのは、辺ADが辺ABより長い
// 「縦長」の長方形の場合のみ。AB > AD（横長）にすると、Gが辺BCの延長線上にしか
// 存在できず、条件が矛盾して図形が生成できなくなる。ここでは AB=6, AD=8 を使用する。
// 実際の問題文にある数値に置き換える場合は、AD > AB となるよう注意すること。
const nada2026: Template = {
  id: 'nada2026',
  title: '灘中学校 2026年度 1日目 第9問',
  description:
    '四角形ABCDは長方形，四角形DEFGは正方形です。点Fは対角線BD上にあり，点Gは辺BC上にあります。GCの長さと，辺ADと辺EFの交点Hに対するAHの長さを求めよ。（長方形の辺の長さは仮の数値です。実際の問題文にある数値に置き換えて調整してください。AD>ABとなる数値にしてください）',
  points: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
  constraints: [
    { type: 'rectangle', points: ['A', 'B', 'C', 'D'] },
    { type: 'length', segment: ['A', 'B'], value: 6 },
    { type: 'length', segment: ['A', 'D'], value: 8 },
    { type: 'square', points: ['D', 'E', 'F', 'G'] },
    { type: 'onLine', point: 'F', line: ['B', 'D'] },
    { type: 'onSegment', point: 'G', seg: ['B', 'C'] },
    { type: 'onLine', point: 'H', line: ['A', 'D'] },
    { type: 'onLine', point: 'H', line: ['E', 'F'] },
  ],
  queries: [
    { type: 'length', segment: ['G', 'C'] },
    { type: 'length', segment: ['A', 'H'] },
  ],
};

export const TEMPLATES: Template[] = [langley, kyodai2013, nada2026];
