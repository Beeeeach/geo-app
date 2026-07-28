import type { Constraint } from './constraints';
import { parseNumericExpression, parseAngleExpressionToRadians } from './parseValue';

// Omit<Constraint, 'id'> は判別共用体に対して分配されず、
// 各メンバーの固有プロパティが失われてしまう（TypeScriptの既知の制約）。
// そのため、各制約型からidだけを取り除いた分配型を明示的に作る。
type ConstraintWithoutId = Constraint extends infer C
  ? C extends { id: string }
    ? Omit<C, 'id'>
    : never
  : never;

/**
 * 数学の記法に近い一行のテキストをパースし、Constraint（複数の場合あり）に変換する。
 * 例:
 *   "AB = 5"              -> 長さ
 *   "AB = AC"              -> 長さが等しい
 *   "AB : CD = 2 : 1"      -> 長さの比
 *   "∠ABC = 60"            -> 角度
 *   "∠ABC = ∠DEF"          -> 角度が等しい
 *   "AB // CD" / "AB∥CD"   -> 平行
 *   "AB ⊥ CD"              -> 垂直
 *   "A, B, C は同一直線上"  -> 共線
 *   "M は BC の中点"        -> 中点
 *   "P は AB 上"            -> 線分上
 *   "△ABC は正三角形"       -> 正三角形
 *   "△ABC は二等辺三角形 (A)" -> 二等辺三角形（Aが頂角）
 *   "△ABC は直角三角形 (B)" -> 直角三角形（Bが直角）
 *   "G は △ABC の重心"      -> 重心
 *   "四角形ABCD は平行四辺形" -> 平行四辺形
 *   "△ABC の面積 = 12"      -> 面積
 *
 * パースに失敗した場合は null を返す（呼び出し側でエラー表示する）。
 */

export interface ParseResult {
  constraints: ConstraintWithoutId[];
  // 人間が読める確認用の正規化された表現（"AB = 5" など）
  normalized: string;
}

// 全角記号を半角・統一表記に正規化する
function normalizeSymbols(input: string): string {
  return input
    .trim()
    .replace(/　/g, ' ') // 全角スペース
    .replace(/：/g, ':')
    .replace(/＝/g, '=')
    .replace(/／/g, '/')
    .replace(/∥|∦|\/\//g, '∥')
    .replace(/⊥/g, '⊥')
    .replace(/，/g, ',')
    .replace(/、/g, ',');
}

// "ABC" のような文字列を1文字ずつの点名配列に分解する
// （点名は基本1文字だが、複数文字の点名（"M1"等）にも対応するため、
//  既知の点名リストと照合して最長一致で分割する）
function splitPointSequence(str: string, knownPoints: string[]): string[] | null {
  const trimmed = str.trim();
  if (knownPoints.includes(trimmed)) return [trimmed];

  const sorted = [...knownPoints].sort((a, b) => b.length - a.length);
  const result: string[] = [];
  let remaining = trimmed;
  while (remaining.length > 0) {
    const match = sorted.find((p) => remaining.startsWith(p));
    if (!match) return null;
    result.push(match);
    remaining = remaining.slice(match.length);
  }
  return result.length > 0 ? result : null;
}

export function parseQuickConstraint(rawInput: string, knownPoints: string[]): ParseResult | null {
  const input = normalizeSymbols(rawInput);
  if (!input) return null;

  // --- 平行 AB ∥ CD ---
  {
    const m = input.match(/^(\S+)\s*∥\s*(\S+)$/);
    if (m) {
      const seg1 = splitPointSequence(m[1], knownPoints);
      const seg2 = splitPointSequence(m[2], knownPoints);
      if (seg1?.length === 2 && seg2?.length === 2) {
        return {
          constraints: [{ type: 'parallel', seg1: [seg1[0], seg1[1]], seg2: [seg2[0], seg2[1]] }],
          normalized: `${seg1.join('')} ∥ ${seg2.join('')}`,
        };
      }
    }
  }

  // --- 垂直 AB ⊥ CD ---
  {
    const m = input.match(/^(\S+)\s*⊥\s*(\S+)$/);
    if (m) {
      const seg1 = splitPointSequence(m[1], knownPoints);
      const seg2 = splitPointSequence(m[2], knownPoints);
      if (seg1?.length === 2 && seg2?.length === 2) {
        return {
          constraints: [{ type: 'perpendicular', seg1: [seg1[0], seg1[1]], seg2: [seg2[0], seg2[1]] }],
          normalized: `${seg1.join('')} ⊥ ${seg2.join('')}`,
        };
      }
    }
  }

  // --- 角度の比 ∠ABC : ∠DEF = 2 : 1 ---
  {
    const m = input.match(/^∠(\S+)\s*:\s*∠(\S+)\s*=\s*(\d+(?:\.\d+)?)\s*:\s*(\d+(?:\.\d+)?)$/);
    if (m) {
      const a1 = splitPointSequence(m[1], knownPoints);
      const a2 = splitPointSequence(m[2], knownPoints);
      if (a1?.length === 3 && a2?.length === 3) {
        return {
          constraints: [
            {
              type: 'angleRatio',
              angle1: [a1[0], a1[1], a1[2]],
              angle2: [a2[0], a2[1], a2[2]],
              ratio: [Number(m[3]), Number(m[4])],
            },
          ],
          normalized: `∠${a1.join('')} : ∠${a2.join('')} = ${m[3]} : ${m[4]}`,
        };
      }
    }
  }

  // --- 角度が等しい ∠ABC = ∠DEF ---
  {
    const m = input.match(/^∠(\S+)\s*=\s*∠(\S+)$/);
    if (m) {
      const a1 = splitPointSequence(m[1], knownPoints);
      const a2 = splitPointSequence(m[2], knownPoints);
      if (a1?.length === 3 && a2?.length === 3) {
        return {
          constraints: [
            { type: 'angleEqual', angle1: [a1[0], a1[1], a1[2]], angle2: [a2[0], a2[1], a2[2]] },
          ],
          normalized: `∠${a1.join('')} = ∠${a2.join('')}`,
        };
      }
    }
  }

  // --- 角度の値 ∠ABC = 60 ---
  {
    const m = input.match(/^∠(\S+)\s*=\s*(.+?)°?$/);
    if (m) {
      const pts = splitPointSequence(m[1], knownPoints);
      const rad = parseAngleExpressionToRadians(m[2]);
      if (pts?.length === 3 && rad !== null && rad > 0 && rad < Math.PI) {
        return {
          constraints: [{ type: 'angle', points: [pts[0], pts[1], pts[2]], value: rad }],
          normalized: `∠${pts.join('')} = ${m[2].trim()}°`,
        };
      }
    }
  }

  // --- 長さの比 AB : CD = 2 : 1 ---
  {
    const m = input.match(/^(\S+)\s*:\s*(\S+)\s*=\s*(\d+(?:\.\d+)?)\s*:\s*(\d+(?:\.\d+)?)$/);
    if (m) {
      const seg1 = splitPointSequence(m[1], knownPoints);
      const seg2 = splitPointSequence(m[2], knownPoints);
      if (seg1?.length === 2 && seg2?.length === 2) {
        return {
          constraints: [
            {
              type: 'lengthRatio',
              seg1: [seg1[0], seg1[1]],
              seg2: [seg2[0], seg2[1]],
              ratio: [Number(m[3]), Number(m[4])],
            },
          ],
          normalized: `${seg1.join('')} : ${seg2.join('')} = ${m[3]} : ${m[4]}`,
        };
      }
    }
  }

  // --- 長さが等しい（3本以上も可） AB = CD = EF ---
  if (!input.includes('∠') && !input.includes(':')) {
    const parts = input.split('=').map((s) => s.trim());
    if (parts.length >= 2) {
      const segs = parts.map((p) => splitPointSequence(p, knownPoints));
      const allAreSegments = segs.every((s) => s?.length === 2);
      const noneAreNumbers = parts.every((p) => parseNumericExpression(p) === null);
      if (allAreSegments && noneAreNumbers) {
        const validSegs = segs as string[][];
        if (validSegs.length === 2) {
          return {
            constraints: [
              {
                type: 'lengthEqual',
                seg1: [validSegs[0][0], validSegs[0][1]],
                seg2: [validSegs[1][0], validSegs[1][1]],
              },
            ],
            normalized: parts.join(' = '),
          };
        }
        if (validSegs.length >= 3) {
          return {
            constraints: [
              {
                type: 'lengthEqualGroup',
                segments: validSegs.map((s) => [s[0], s[1]] as [string, string]),
              },
            ],
            normalized: parts.join(' = '),
          };
        }
      }
    }
  }

  // --- 長さの値 AB = 5 ---
  {
    const m = input.match(/^(\S+)\s*=\s*(.+)$/);
    if (m) {
      const seg = splitPointSequence(m[1], knownPoints);
      const value = parseNumericExpression(m[2]);
      if (seg?.length === 2 && value !== null && value > 0) {
        return {
          constraints: [{ type: 'length', segment: [seg[0], seg[1]], value }],
          normalized: `${seg.join('')} = ${m[2].trim()}`,
        };
      }
    }
  }

  // --- 中点 M は BC の中点 ---
  {
    const m = input.match(/^(\S+)\s*は\s*(\S+)\s*の中点$/);
    if (m) {
      const seg = splitPointSequence(m[2], knownPoints);
      if (knownPoints.includes(m[1]) && seg?.length === 2) {
        return {
          constraints: [{ type: 'midpoint', midpoint: m[1], seg: [seg[0], seg[1]] }],
          normalized: `${m[1]} は ${seg.join('')} の中点`,
        };
      }
    }
  }

  // --- 線分上 P は AB 上 ---
  {
    const m = input.match(/^(\S+)\s*は\s*(\S+)\s*上$/);
    if (m) {
      const seg = splitPointSequence(m[2], knownPoints);
      if (knownPoints.includes(m[1]) && seg?.length === 2) {
        return {
          constraints: [{ type: 'onSegment', point: m[1], seg: [seg[0], seg[1]] }],
          normalized: `${m[1]} は ${seg.join('')} 上`,
        };
      }
    }
  }

  // --- 同一直線上 A, B, C は同一直線上 ---
  {
    const m = input.match(/^(.+)\s*は同一直線上$/);
    if (m) {
      const names = m[1].split(',').map((s) => s.trim()).filter(Boolean);
      if (names.length >= 3 && names.every((n) => knownPoints.includes(n))) {
        return {
          constraints: [{ type: 'collinear', points: names }],
          normalized: `${names.join(', ')} は同一直線上`,
        };
      }
    }
  }

  // --- 正三角形 △ABC は正三角形 ---
  {
    const m = input.match(/^△?(\S+)\s*は正三角形$/);
    if (m) {
      const pts = splitPointSequence(m[1], knownPoints);
      if (pts?.length === 3) {
        return {
          constraints: [{ type: 'equilateralTriangle', points: [pts[0], pts[1], pts[2]] }],
          normalized: `△${pts.join('')} は正三角形`,
        };
      }
    }
  }

  // --- 二等辺三角形 △ABC は二等辺三角形(A) ---
  {
    const m = input.match(/^△?(\S+)\s*は二等辺三角形\s*[\(（](\S)[\)）]$/);
    if (m) {
      const pts = splitPointSequence(m[1], knownPoints);
      if (pts?.length === 3 && pts.includes(m[2])) {
        const apex = m[2];
        const base = pts.filter((p) => p !== apex);
        return {
          constraints: [{ type: 'isoscelesTriangle', apex, base: [base[0], base[1]] }],
          normalized: `△${pts.join('')} は二等辺三角形(${apex}が頂角)`,
        };
      }
    }
  }

  // --- 直角三角形 △ABC は直角三角形(B) ---
  {
    const m = input.match(/^△?(\S+)\s*は直角三角形\s*[\(（](\S)[\)）]$/);
    if (m) {
      const pts = splitPointSequence(m[1], knownPoints);
      if (pts?.length === 3 && pts.includes(m[2])) {
        return {
          constraints: [
            { type: 'rightTriangle', rightAngleAt: m[2], points: [pts[0], pts[1], pts[2]] },
          ],
          normalized: `△${pts.join('')} は直角三角形(${m[2]}が直角)`,
        };
      }
    }
  }

  // --- 三角形の中心 G は △ABC の重心／外心／内心／垂心 ---
  {
    const m = input.match(/^(\S+)\s*は\s*△?(\S+)\s*の(重心|外心|内心|垂心)$/);
    if (m) {
      const tri = splitPointSequence(m[2], knownPoints);
      if (knownPoints.includes(m[1]) && tri?.length === 3) {
        const center = m[1];
        const triangle: [string, string, string] = [tri[0], tri[1], tri[2]];
        const normalized = `${m[1]} は △${tri.join('')} の${m[3]}`;

        if (m[3] === '重心') {
          return { constraints: [{ type: 'centroid', center, triangle }], normalized };
        }
        if (m[3] === '外心') {
          return { constraints: [{ type: 'circumcenter', center, triangle }], normalized };
        }
        if (m[3] === '内心') {
          return { constraints: [{ type: 'incenter', center, triangle }], normalized };
        }
        return { constraints: [{ type: 'orthocenter', center, triangle }], normalized };
      }
    }
  }

  // --- 四角形の特殊形 四角形ABCD は平行四辺形／長方形／正方形 ---
  {
    const m = input.match(/^四角形(\S+)\s*は(平行四辺形|長方形|正方形)$/);
    if (m) {
      const pts = splitPointSequence(m[1], knownPoints);
      if (pts?.length === 4) {
        const points: [string, string, string, string] = [pts[0], pts[1], pts[2], pts[3]];
        const normalized = `四角形${pts.join('')} は${m[2]}`;

        if (m[2] === '平行四辺形') {
          return { constraints: [{ type: 'parallelogram', points }], normalized };
        }
        if (m[2] === '長方形') {
          return { constraints: [{ type: 'rectangle', points }], normalized };
        }
        return { constraints: [{ type: 'square', points }], normalized };
      }
    }
  }

  // --- 面積 △ABC の面積 = 12 / 四角形ABCD の面積 = 20 ---
  {
    const m = input.match(/^(△|四角形)?(\S+)\s*の面積\s*=\s*(.+)$/);
    if (m) {
      const pts = splitPointSequence(m[2], knownPoints);
      const value = parseNumericExpression(m[3]);
      if (pts && pts.length >= 3 && value !== null && value > 0) {
        const prefix = pts.length === 3 ? '△' : m[1] === '四角形' ? '四角形' : '';
        return {
          constraints: [{ type: 'area', polygon: pts, value }],
          normalized: `${prefix}${pts.join('')} の面積 = ${m[3].trim()}`,
        };
      }
    }
  }

  return null;
}

// --- 「求めたいもの」の数式ライク入力パーサー ---

export type QuickQuery =
  | { type: 'length'; segment: [string, string] }
  | { type: 'angle'; points: [string, string, string] }
  | { type: 'coordinate'; point: string }
  | { type: 'area'; polygon: string[] }
  | { type: 'perimeter'; polygon: string[] }
  | { type: 'lengthRatioQuery'; seg1: [string, string]; seg2: [string, string] };

export interface QueryParseResult {
  query: QuickQuery;
  normalized: string;
}

/**
 * 「求めたいもの」を数式ライクな表記でパースする。
 * 例:
 *   "BC"            -> 長さ
 *   "∠ABC"          -> 角度
 *   "A"             -> 座標
 *   "△ABC の面積"    -> 面積
 *   "ABCD の周長"     -> 周長
 *   "AB : CD"       -> 比
 */
export function parseQuickQuery(rawInput: string, knownPoints: string[]): QueryParseResult | null {
  const input = normalizeSymbols(rawInput);
  if (!input) return null;

  // --- 比 AB : CD ---
  {
    const m = input.match(/^(\S+)\s*:\s*(\S+)$/);
    if (m) {
      const seg1 = splitPointSequence(m[1], knownPoints);
      const seg2 = splitPointSequence(m[2], knownPoints);
      if (seg1?.length === 2 && seg2?.length === 2) {
        return {
          query: { type: 'lengthRatioQuery', seg1: [seg1[0], seg1[1]], seg2: [seg2[0], seg2[1]] },
          normalized: `${seg1.join('')} : ${seg2.join('')}`,
        };
      }
    }
  }

  // --- 面積 △ABC の面積 / ABCD の面積 ---
  {
    const m = input.match(/^(△|四角形)?(\S+)\s*の面積$/);
    if (m) {
      const pts = splitPointSequence(m[2], knownPoints);
      if (pts && pts.length >= 3) {
        const prefix = pts.length === 3 ? '△' : m[1] === '四角形' ? '四角形' : '';
        return {
          query: { type: 'area', polygon: pts },
          normalized: `${prefix}${pts.join('')} の面積`,
        };
      }
    }
  }

  // --- 周長 ABCD の周長 ---
  {
    const m = input.match(/^(△|四角形)?(\S+)\s*の周長$/);
    if (m) {
      const pts = splitPointSequence(m[2], knownPoints);
      if (pts && pts.length >= 3) {
        const prefix = pts.length === 3 ? '△' : m[1] === '四角形' ? '四角形' : '';
        return {
          query: { type: 'perimeter', polygon: pts },
          normalized: `${prefix}${pts.join('')} の周長`,
        };
      }
    }
  }

  // --- 角度 ∠ABC ---
  {
    const m = input.match(/^∠(\S+)$/);
    if (m) {
      const pts = splitPointSequence(m[1], knownPoints);
      if (pts?.length === 3) {
        return {
          query: { type: 'angle', points: [pts[0], pts[1], pts[2]] },
          normalized: `∠${pts.join('')}`,
        };
      }
    }
  }

  // --- 座標 A（1文字の点そのもの） ---
  {
    if (knownPoints.includes(input)) {
      return {
        query: { type: 'coordinate', point: input },
        normalized: `${input} の座標`,
      };
    }
  }

  // --- 長さ BC（2点） ---
  {
    const seg = splitPointSequence(input, knownPoints);
    if (seg?.length === 2) {
      return {
        query: { type: 'length', segment: [seg[0], seg[1]] },
        normalized: `${seg.join('')}`,
      };
    }
  }

  return null;
}
