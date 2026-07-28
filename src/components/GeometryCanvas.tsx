import { useMemo } from 'react';
import { useAppStore } from '../core/store';

const VIEW_SIZE = 600;
const PADDING = 60;

export function GeometryCanvas() {
  const solvedPoints = useAppStore((s) => s.solvedPoints);
  const constraints = useAppStore((s) => s.constraints);
  const queries = useAppStore((s) => s.queries);
  const solveStatus = useAppStore((s) => s.solveStatus);

  // 点群を正規化してビューポートに収める変換を計算
  const transform = useMemo(() => {
    if (solvedPoints.length === 0) {
      return { scale: 1, offsetX: VIEW_SIZE / 2, offsetY: VIEW_SIZE / 2 };
    }
    const xs = solvedPoints.map((p) => p.x);
    const ys = solvedPoints.map((p) => p.y);
    const minX = Math.min(...xs), maxX = Math.max(...xs);
    const minY = Math.min(...ys), maxY = Math.max(...ys);
    const width = Math.max(maxX - minX, 0.1);
    const height = Math.max(maxY - minY, 0.1);
    const scale = Math.min(
      (VIEW_SIZE - PADDING * 2) / width,
      (VIEW_SIZE - PADDING * 2) / height
    );
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;
    return {
      scale,
      offsetX: VIEW_SIZE / 2 - cx * scale,
      offsetY: VIEW_SIZE / 2 + cy * scale, // y軸反転（数学座標系→画面座標系）
    };
  }, [solvedPoints]);

  const toScreen = (x: number, y: number): [number, number] => [
    x * transform.scale + transform.offsetX,
    -y * transform.scale + transform.offsetY,
  ];

  const findPoint = (name: string) => solvedPoints.find((p) => p.name === name);

  // 制約から描画すべき線分を抽出（重複除去）
  const segments = useMemo(() => {
    const segSet = new Map<string, [string, string]>();
    const addSeg = (a: string, b: string) => {
      const key = [a, b].sort().join('-');
      if (!segSet.has(key)) segSet.set(key, [a, b]);
    };
    for (const c of constraints) {
      if (c.type === 'length' || c.type === 'lengthRatio') {
        if ('segment' in c) addSeg(...c.segment);
        if ('seg1' in c) addSeg(...c.seg1);
        if ('seg2' in c) addSeg(...c.seg2);
      }
      if (c.type === 'lengthEqualGroup') {
        for (const [p1, p2] of c.segments) addSeg(p1, p2);
      }
      if (c.type === 'parallel' || c.type === 'perpendicular') {
        addSeg(...c.seg1);
        addSeg(...c.seg2);
      }
      if (c.type === 'midpoint') addSeg(...c.seg);
      if (c.type === 'onSegment') addSeg(...c.seg);
      if (c.type === 'angle' || c.type === 'angleEqual' || c.type === 'angleRatio') {
        const addAngleSegs = (pts: [string, string, string]) => {
          addSeg(pts[0], pts[1]);
          addSeg(pts[1], pts[2]);
        };
        if ('points' in c) addAngleSegs(c.points);
        if ('angle1' in c) addAngleSegs(c.angle1);
        if ('angle2' in c) addAngleSegs(c.angle2);
      }
      if (c.type === 'equilateralTriangle' || c.type === 'rightTriangle') {
        const [p1, p2, p3] = c.points;
        addSeg(p1, p2);
        addSeg(p2, p3);
        addSeg(p3, p1);
      }
      if (c.type === 'isoscelesTriangle') {
        addSeg(c.apex, c.base[0]);
        addSeg(c.apex, c.base[1]);
        addSeg(c.base[0], c.base[1]);
      }
      if (c.type === 'tangentLine') addSeg(...c.line);
      if (
        c.type === 'quadrilateral' ||
        c.type === 'parallelogram' ||
        c.type === 'rectangle' ||
        c.type === 'square' ||
        c.type === 'trapezoid'
      ) {
        const [p1, p2, p3, p4] = c.points;
        addSeg(p1, p2);
        addSeg(p2, p3);
        addSeg(p3, p4);
        addSeg(p4, p1);
      }
      if (c.type === 'area') {
        const pts = c.polygon;
        for (let i = 0; i < pts.length; i++) {
          addSeg(pts[i], pts[(i + 1) % pts.length]);
        }
      }
      if (c.type === 'similarTriangles' || c.type === 'congruentTriangles') {
        const addTriSegs = (pts: [string, string, string]) => {
          addSeg(pts[0], pts[1]);
          addSeg(pts[1], pts[2]);
          addSeg(pts[2], pts[0]);
        };
        addTriSegs(c.triangle1);
        addTriSegs(c.triangle2);
      }
      if (c.type === 'incircleTangentPoint') {
        const [p1, p2, p3] = c.triangle;
        addSeg(p1, p2);
        addSeg(p2, p3);
        addSeg(p3, p1);
      }
      if (c.type === 'harmonicConjugate') {
        addSeg(c.points[0], c.points[1]);
      }
      if (c.type === 'reflection') {
        addSeg(...c.axis);
      }
      if (c.type === 'pointOutsidePolygon') {
        const pts = c.polygon;
        for (let i = 0; i < pts.length; i++) {
          addSeg(pts[i], pts[(i + 1) % pts.length]);
        }
      }
    }

    // 「求めたいもの」でarea/perimeterが指定された多角形も、
    // その頂点をしっかり線分で結んで描画する
    // （queriesはuseAppStoreから取得）
    for (const q of queries) {
      if ((q.type === 'area' || q.type === 'perimeter') && q.polygon) {
        const pts = q.polygon;
        for (let i = 0; i < pts.length; i++) {
          addSeg(pts[i], pts[(i + 1) % pts.length]);
        }
      }
    }

    return Array.from(segSet.values());
  }, [constraints, queries]);

  // 円の抽出（中心・半径点の組を重複なく集める）
  const circles = useMemo(() => {
    const circleSet = new Map<string, { center: string; radiusPoint: string }>();
    for (const c of constraints) {
      if (c.type === 'circleRadius') {
        circleSet.set(c.center, { center: c.center, radiusPoint: c.radiusPoint });
      }
      if (c.type === 'onCircle') {
        if (!circleSet.has(c.center)) {
          circleSet.set(c.center, { center: c.center, radiusPoint: c.radius });
        }
      }
      if (c.type === 'tangentCircles') {
        if (!circleSet.has(c.center1)) {
          circleSet.set(c.center1, { center: c.center1, radiusPoint: c.radiusPoint1 });
        }
        if (!circleSet.has(c.center2)) {
          circleSet.set(c.center2, { center: c.center2, radiusPoint: c.radiusPoint2 });
        }
      }
      if (c.type === 'pointOutsideCircle') {
        if (!circleSet.has(c.center)) {
          circleSet.set(c.center, { center: c.center, radiusPoint: c.radiusPoint });
        }
      }
    }
    return Array.from(circleSet.values());
  }, [constraints]);

  const showContent =
    solveStatus === 'ok' ||
    solveStatus === 'underdetermined_similarOnly' ||
    solveStatus === 'underdetermined_shapeVaries';

  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: VIEW_SIZE, aspectRatio: '1 / 1', margin: '0 auto' }}>
      <svg
        viewBox={`0 0 ${VIEW_SIZE} ${VIEW_SIZE}`}
        width="100%"
        height="100%"
        style={{
          background: 'var(--paper-raised)',
          border: '1px solid var(--rule)',
          borderRadius: 10,
        }}
      >
        {/* 座標用紙風の方眼背景 */}
        <defs>
          <pattern id="grid-fine" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="var(--rule-soft)" strokeWidth="0.6" />
          </pattern>
          <pattern id="grid-bold" width="100" height="100" patternUnits="userSpaceOnUse">
            <rect width="100" height="100" fill="url(#grid-fine)" />
            <path d="M 100 0 L 0 0 0 100" fill="none" stroke="var(--rule)" strokeWidth="0.9" />
          </pattern>
        </defs>
        <rect width={VIEW_SIZE} height={VIEW_SIZE} fill="url(#grid-bold)" />

        {showContent && (
          <>
            {/* 円 */}
            {circles.map((circle, i) => {
              const center = findPoint(circle.center);
              const radiusPoint = findPoint(circle.radiusPoint);
              if (!center || !radiusPoint) return null;
              const [cx, cy] = toScreen(center.x, center.y);
              const dx = radiusPoint.x - center.x;
              const dy = radiusPoint.y - center.y;
              const r = Math.sqrt(dx * dx + dy * dy) * transform.scale;
              return (
                <circle
                  key={`circle-${i}`}
                  cx={cx}
                  cy={cy}
                  r={r}
                  fill="none"
                  stroke="var(--pen)"
                  strokeWidth={1.4}
                  strokeDasharray="4 3"
                  opacity={0.75}
                />
              );
            })}

            {/* 線分 */}
            {segments.map(([a, b], i) => {
              const pa = findPoint(a);
              const pb = findPoint(b);
              if (!pa || !pb) return null;
              const [x1, y1] = toScreen(pa.x, pa.y);
              const [x2, y2] = toScreen(pb.x, pb.y);
              return (
                <line
                  key={i}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="var(--ink)"
                  strokeWidth={1.8}
                  strokeLinecap="round"
                />
              );
            })}

            {/* 点とラベル */}
            {solvedPoints.map((p) => {
              const [sx, sy] = toScreen(p.x, p.y);
              return (
                <g key={p.name}>
                  <circle cx={sx} cy={sy} r={3.5} fill="var(--paper-raised)" stroke="var(--seal)" strokeWidth={2.2} />
                  <text
                    x={sx + 10}
                    y={sy - 9}
                    fontSize={17}
                    fontFamily="var(--font-display)"
                    fill="var(--ink)"
                    fontWeight={700}
                  >
                    {p.name}
                  </text>
                </g>
              );
            })}
          </>
        )}

        {solveStatus === 'contradiction' && (
          <text
            x={VIEW_SIZE / 2}
            y={VIEW_SIZE / 2}
            textAnchor="middle"
            fontSize={14}
            fontFamily="var(--font-ui)"
            fill="var(--seal)"
          >
            この図形は作れません
          </text>
        )}

        {solveStatus === 'idle' && (
          <text
            x={VIEW_SIZE / 2}
            y={VIEW_SIZE / 2}
            textAnchor="middle"
            fontSize={13.5}
            fontFamily="var(--font-ui)"
            fill="var(--ink-faint)"
          >
            点と条件を書き込んで「作図する」を押してください
          </text>
        )}
      </svg>
    </div>
  );
}
