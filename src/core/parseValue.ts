import { evaluate } from 'mathjs';

/**
 * 「5」「3/2」「√3」「2√5」「π」「3π/4」等の文字列を数値へ変換する。
 * mathjsに渡す前に、数学記号(√, π, °)を評価可能な表記へ変換する。
 */
export function parseNumericExpression(input: string): number | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  let expr = trimmed
    .replace(/°/g, '') // 角度記号は呼び出し側でdeg->rad変換するため除去
    .replace(/π/g, 'pi')
    .replace(/(\d)(pi)/g, '$1*$2') // 3pi -> 3*pi
    .replace(/(\d)(√)/g, '$1*$2') // 2√5 -> 2*√5
    .replace(/√(\d+(\.\d+)?)/g, 'sqrt($1)') // √3 -> sqrt(3)
    .replace(/√\(([^)]+)\)/g, 'sqrt($1)'); // √(3+2) -> sqrt(3+2)

  try {
    const result = evaluate(expr);
    if (typeof result === 'number' && isFinite(result)) {
      return result;
    }
    return null;
  } catch {
    return null;
  }
}

/** 角度入力(度数法, 例: "60", "60°")をラジアンへ変換 */
export function parseAngleExpressionToRadians(input: string): number | null {
  const deg = parseNumericExpression(input);
  if (deg === null) return null;
  return (deg * Math.PI) / 180;
}
