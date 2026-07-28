import type { Constraint } from './constraints';

// 制約オブジェクトを、実際の数学の記法に近い読みやすい文字列に変換する。
// クイック入力の確認表示・条件一覧のどちらからも使う共通ロジック。
export function constraintLabel(c: Constraint): string {
  switch (c.type) {
    case 'length':
      return `${c.segment.join('')} = ${c.value}`;
    case 'lengthEqual':
      return `${c.seg1.join('')} = ${c.seg2.join('')}`;
    case 'lengthEqualGroup':
      return `${c.segments.map((s) => s.join('')).join(' = ')}`;
    case 'lengthRatio':
      return `${c.seg1.join('')} : ${c.seg2.join('')} = ${c.ratio[0]} : ${c.ratio[1]}`;
    case 'angle':
      return `∠${c.points.join('')} = ${((c.value * 180) / Math.PI).toFixed(2)}°`;
    case 'angleEqual':
      return `∠${c.angle1.join('')} = ∠${c.angle2.join('')}`;
    case 'angleRatio':
      return `∠${c.angle1.join('')} : ∠${c.angle2.join('')} = ${c.ratio[0]} : ${c.ratio[1]}`;
    case 'collinear':
      return `${c.points.join(', ')} は同一直線上`;
    case 'parallel':
      return `${c.seg1.join('')} ∥ ${c.seg2.join('')}`;
    case 'perpendicular':
      return `${c.seg1.join('')} ⊥ ${c.seg2.join('')}`;
    case 'midpoint':
      return `${c.midpoint} は ${c.seg.join('')} の中点`;
    case 'onSegment':
      return `${c.point} は 線分${c.seg.join('')} 上`;
    case 'onLine':
      return `${c.point} は 直線${c.line.join('')} 上`;
    case 'onCircle':
      return `${c.point} は 円(中心${c.center}, ${c.radius}経由)上`;
    case 'circleRadius':
      return `円(中心${c.center}, ${c.radiusPoint}経由) の半径 = ${c.value}`;
    case 'tangentLine':
      return `円(中心${c.center}) は 直線${c.line.join('')} に接する`;
    case 'tangentCircles':
      return `円(中心${c.center1}) と 円(中心${c.center2}) が外接`;
    case 'equilateralTriangle':
      return `△${c.points.join('')} は正三角形`;
    case 'isoscelesTriangle':
      return `△${c.apex}${c.base.join('')} は二等辺三角形(${c.apex}が頂角)`;
    case 'rightTriangle':
      return `△${c.points.join('')} は直角三角形(${c.rightAngleAt}が直角)`;
    case 'centroid':
      return `${c.center} は △${c.triangle.join('')} の重心`;
    case 'circumcenter':
      return `${c.center} は △${c.triangle.join('')} の外心`;
    case 'incenter':
      return `${c.center} は △${c.triangle.join('')} の内心`;
    case 'orthocenter':
      return `${c.center} は △${c.triangle.join('')} の垂心`;
    case 'quadrilateral':
      return `四角形${c.points.join('')}`;
    case 'parallelogram':
      return `四角形${c.points.join('')} は平行四辺形`;
    case 'rectangle':
      return `四角形${c.points.join('')} は長方形`;
    case 'square':
      return `四角形${c.points.join('')} は正方形`;
    case 'trapezoid':
      return `四角形${c.points.join('')} は台形(${c.parallelSides[0].join('')} ∥ ${c.parallelSides[1].join('')})`;
    case 'area':
      return `${c.polygon.join('')} の面積 = ${c.value}`;
    case 'similarTriangles':
      return `△${c.triangle1.join('')} ∽ △${c.triangle2.join('')}`;
    case 'congruentTriangles':
      return `△${c.triangle1.join('')} ≡ △${c.triangle2.join('')}`;
    case 'incircleTangentPoint':
      return `${c.point} は △${c.triangle.join('')} の内接円と辺${c.side.join('')}の接点`;
    case 'powerOfPoint':
      return `点${c.point} の円(中心${c.center})に対する方べき（直線${c.linePoint1}${c.linePoint2}）`;
    case 'harmonicConjugate':
      return `(${c.points[0]},${c.points[1]};${c.points[2]},${c.points[3]}) が調和共役`;
    case 'reflection':
      return `${c.point1} と ${c.point2} は 直線${c.axis.join('')} に関して線対称`;
    case 'pointOutsidePolygon':
      return `${c.point} は 図形${c.polygon.join('')} の外側`;
    case 'pointOutsideCircle':
      return `${c.point} は 円(中心${c.center}) の外側`;
    default:
      return '';
  }
}
