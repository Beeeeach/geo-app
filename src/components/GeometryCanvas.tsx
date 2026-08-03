<<<<<<< HEAD
import { useMemo, useRef, useState } from 'react';
=======
import { useMemo } from 'react';
>>>>>>> 30dca02bd58e331c72bf234f5087adfda38e9ffb
import { useAppStore } from '../core/store';

const VIEW_SIZE = 600;
const PADDING = 60;

<<<<<<< HEAD
// 単位グリッドとして提示する「キリのいい」候補値
const UNIT_CANDIDATES = [0.1, 0.2, 0.5, 1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000, 10000];

/**
 * 現在の表示スケール（1数学単位が何ピクセルに対応するか）から、
 * 画面上でだいたい50〜120px程度になるような「キリのいい」単位長さを選ぶ。
 * 図形が大きい/小さいときに常に「1」を表示すると見づらくなるための対策。
 */
function pickUnitLength(scale: number): number {
  const targetPixels = 80;
  let best = UNIT_CANDIDATES[0];
  let bestDiff = Infinity;
  for (const candidate of UNIT_CANDIDATES) {
    const pixels = candidate * scale;
    const diff = Math.abs(pixels - targetPixels);
    if (diff < bestDiff) {
      bestDiff = diff;
      best = candidate;
    }
  }
  return best;
}

function formatUnitLabel(v: number): string {
  if (v >= 1) return v.toString();
  // 0.1, 0.2, 0.5 など
  return v.toString();
}

export function GeometryCanvas() {
  const solvedPoints = useAppStore((s) => s.solvedPoints);
  const constraints = useAppStore((s) => s.constraints);
  const solveStatus = useAppStore((s) => s.solveStatus);

  const [zoom, setZoom] = useState(1);
  const svgRef = useRef<SVGSVGElement>(null);
  const [shareMessage, setShareMessage] = useState<string | null>(null);

  // 点群を正規化してビューポートに収める変換を計算
  const baseTransform = useMemo(() => {
    if (solvedPoints.length === 0) {
      return { scale: 60, offsetX: VIEW_SIZE / 2, offsetY: VIEW_SIZE / 2 };
    }
    if (solvedPoints.length === 1) {
      return { scale: 60, offsetX: VIEW_SIZE / 2 - solvedPoints[0].x * 60, offsetY: VIEW_SIZE / 2 + solvedPoints[0].y * 60 };
=======
export function GeometryCanvas() {
  const solvedPoints = useAppStore((s) => s.solvedPoints);
  const constraints = useAppStore((s) => s.constraints);
  const queries = useAppStore((s) => s.queries);
  const solveStatus = useAppStore((s) => s.solveStatus);

  // 点群を正規化してビューポートに収める変換を計算
  const transform = useMemo(() => {
    if (solvedPoints.length === 0) {
      return { scale: 1, offsetX: VIEW_SIZE / 2, offsetY: VIEW_SIZE / 2 };
>>>>>>> 30dca02bd58e331c72bf234f5087adfda38e9ffb
    }
    const xs = solvedPoints.map((p) => p.x);
    const ys = solvedPoints.map((p) => p.y);
    const minX = Math.min(...xs), maxX = Math.max(...xs);
    const minY = Math.min(...ys), maxY = Math.max(...ys);
<<<<<<< HEAD
    // 図形が一直線上に並ぶなどwidth/heightが0に近い場合でも、
    // 極端な拡大が起きないよう「実際の広がり」と「最小限のマージン」を分けて考える。
    const rawWidth = maxX - minX;
    const rawHeight = maxY - minY;
    // 有効な広がりの下限を、図形全体のスケール感（対角長）から決める。
    // これにより「1点だけ離れていて他は密集」というケースでも極端倍率を避けられる。
    const diag = Math.sqrt(rawWidth * rawWidth + rawHeight * rawHeight) || 1;
    const minSpan = Math.max(diag * 0.15, 1e-6);
    const width = Math.max(rawWidth, minSpan);
    const height = Math.max(rawHeight, minSpan);
=======
    const width = Math.max(maxX - minX, 0.1);
    const height = Math.max(maxY - minY, 0.1);
>>>>>>> 30dca02bd58e331c72bf234f5087adfda38e9ffb
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

<<<<<<< HEAD
  // ズーム適用後の変換（キャンバス中心を基準に拡大縮小）
  const transform = useMemo(() => {
    const scale = baseTransform.scale * zoom;
    // 中心(VIEW_SIZE/2, VIEW_SIZE/2)を基準にズームする
    const cxScreen = VIEW_SIZE / 2;
    const cyScreen = VIEW_SIZE / 2;
    const offsetX = cxScreen + (baseTransform.offsetX - cxScreen) * zoom;
    const offsetY = cyScreen + (baseTransform.offsetY - cyScreen) * zoom;
    return { scale, offsetX, offsetY };
  }, [baseTransform, zoom]);

=======
>>>>>>> 30dca02bd58e331c72bf234f5087adfda38e9ffb
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
<<<<<<< HEAD
      if (c.type === 'length' || c.type === 'lengthEqual' || c.type === 'lengthRatio') {
=======
      if (c.type === 'length' || c.type === 'lengthRatio') {
>>>>>>> 30dca02bd58e331c72bf234f5087adfda38e9ffb
        if ('segment' in c) addSeg(...c.segment);
        if ('seg1' in c) addSeg(...c.seg1);
        if ('seg2' in c) addSeg(...c.seg2);
      }
<<<<<<< HEAD
=======
      if (c.type === 'lengthEqualGroup') {
        for (const [p1, p2] of c.segments) addSeg(p1, p2);
      }
>>>>>>> 30dca02bd58e331c72bf234f5087adfda38e9ffb
      if (c.type === 'parallel' || c.type === 'perpendicular') {
        addSeg(...c.seg1);
        addSeg(...c.seg2);
      }
      if (c.type === 'midpoint') addSeg(...c.seg);
      if (c.type === 'onSegment') addSeg(...c.seg);
<<<<<<< HEAD
      if (c.type === 'internalDivision' || c.type === 'externalDivision') addSeg(...c.seg);
=======
>>>>>>> 30dca02bd58e331c72bf234f5087adfda38e9ffb
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
<<<<<<< HEAD
      if (c.type === 'parallelogram' || c.type === 'rectangle' || c.type === 'square' || c.type === 'trapezoid') {
=======
      if (
        c.type === 'quadrilateral' ||
        c.type === 'parallelogram' ||
        c.type === 'rectangle' ||
        c.type === 'square' ||
        c.type === 'trapezoid'
      ) {
>>>>>>> 30dca02bd58e331c72bf234f5087adfda38e9ffb
        const [p1, p2, p3, p4] = c.points;
        addSeg(p1, p2);
        addSeg(p2, p3);
        addSeg(p3, p4);
        addSeg(p4, p1);
      }
<<<<<<< HEAD
=======
      if (c.type === 'area') {
        const pts = c.polygon;
        for (let i = 0; i < pts.length; i++) {
          addSeg(pts[i], pts[(i + 1) % pts.length]);
        }
      }
>>>>>>> 30dca02bd58e331c72bf234f5087adfda38e9ffb
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
<<<<<<< HEAD
    }
    return Array.from(segSet.values());
  }, [constraints]);
=======
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
>>>>>>> 30dca02bd58e331c72bf234f5087adfda38e9ffb

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
<<<<<<< HEAD
=======
      if (c.type === 'pointOutsideCircle') {
        if (!circleSet.has(c.center)) {
          circleSet.set(c.center, { center: c.center, radiusPoint: c.radiusPoint });
        }
      }
>>>>>>> 30dca02bd58e331c72bf234f5087adfda38e9ffb
    }
    return Array.from(circleSet.values());
  }, [constraints]);

<<<<<<< HEAD
  const showContent = solveStatus === 'ok' || solveStatus === 'underdetermined';

  const unitLength = pickUnitLength(transform.scale);
  const unitPixelLength = unitLength * transform.scale;

  const zoomIn = () => setZoom((z) => Math.min(z * 1.3, 20));
  const zoomOut = () => setZoom((z) => Math.max(z / 1.3, 0.05));
  const zoomReset = () => setZoom(1);

  const buildStandaloneSvgString = (): string => {
    const svgEl = svgRef.current;
    if (!svgEl) return '';
    const clone = svgEl.cloneNode(true) as SVGSVGElement;
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    // CSS変数を解決した実色に置き換える（外部ファイルとして開かれてもスタイルが効くように）
    const styleVars: Record<string, string> = {
      '--panel': '#ffffff',
      '--rule': '#d8d3c4',
      '--rule-soft': '#e8e4d8',
      '--ink': '#1a1a1a',
      '--accent': '#2b5d8c',
      '--danger': '#b3402a',
    };
    let svgString = new XMLSerializer().serializeToString(clone);
    for (const [key, value] of Object.entries(styleVars)) {
      svgString = svgString.split(`var(${key})`).join(value);
    }
    return svgString;
  };

  const handleSaveImage = async () => {
    setShareMessage(null);
    const svgString = buildStandaloneSvgString();
    if (!svgString) return;

    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    const img = new Image();
    img.onload = () => {
      const exportScale = 2; // 高解像度で書き出す
      const canvas = document.createElement('canvas');
      canvas.width = VIEW_SIZE * exportScale;
      canvas.height = VIEW_SIZE * exportScale;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);

      canvas.toBlob(async (blob) => {
        if (!blob) return;
        const filename = `作図ノート_${Date.now()}.png`;

        // Web Share APIが使える環境（主にスマホ）では共有シートを優先
        const file = new File([blob], filename, { type: 'image/png' });
        if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({ files: [file], title: '作図ノート' });
            setShareMessage('共有しました');
            return;
          } catch {
            // ユーザーがキャンセルした場合等はダウンロードにフォールバック
          }
        }

        const downloadUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(downloadUrl);
        setShareMessage('画像を保存しました');
      }, 'image/png');
    };
    img.src = url;
  };
=======
  const showContent =
    solveStatus === 'ok' ||
    solveStatus === 'underdetermined_similarOnly' ||
    solveStatus === 'underdetermined_shapeVaries';
>>>>>>> 30dca02bd58e331c72bf234f5087adfda38e9ffb

  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: VIEW_SIZE, aspectRatio: '1 / 1', margin: '0 auto' }}>
      <svg
<<<<<<< HEAD
        ref={svgRef}
        viewBox={`0 0 ${VIEW_SIZE} ${VIEW_SIZE}`}
        width="100%"
        height="100%"
        style={{ background: 'var(--panel)', border: '1px solid var(--rule)', borderRadius: 10, display: 'block', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}
      >
        {/* 方眼罫背景 */}
        <defs>
          <pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse">
            <path d="M 24 0 L 0 0 0 24" fill="none" stroke="var(--rule-soft)" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width={VIEW_SIZE} height={VIEW_SIZE} fill="url(#grid)" />
=======
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
>>>>>>> 30dca02bd58e331c72bf234f5087adfda38e9ffb

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
<<<<<<< HEAD
                  stroke="var(--accent)"
                  strokeWidth={1.2}
                  strokeDasharray="3 2"
=======
                  stroke="var(--pen)"
                  strokeWidth={1.4}
                  strokeDasharray="4 3"
                  opacity={0.75}
>>>>>>> 30dca02bd58e331c72bf234f5087adfda38e9ffb
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
<<<<<<< HEAD
                  strokeWidth={1.5}
=======
                  strokeWidth={1.8}
                  strokeLinecap="round"
>>>>>>> 30dca02bd58e331c72bf234f5087adfda38e9ffb
                />
              );
            })}

            {/* 点とラベル */}
            {solvedPoints.map((p) => {
              const [sx, sy] = toScreen(p.x, p.y);
              return (
                <g key={p.name}>
<<<<<<< HEAD
                  <circle cx={sx} cy={sy} r={4} fill="var(--accent)" />
                  <text
                    x={sx + 8}
                    y={sy - 8}
                    fontSize={15}
                    fontFamily="var(--font-mono)"
                    fill="var(--ink)"
                    fontWeight={600}
=======
                  <circle cx={sx} cy={sy} r={3.5} fill="var(--paper-raised)" stroke="var(--seal)" strokeWidth={2.2} />
                  <text
                    x={sx + 10}
                    y={sy - 9}
                    fontSize={17}
                    fontFamily="var(--font-display)"
                    fill="var(--ink)"
                    fontWeight={700}
>>>>>>> 30dca02bd58e331c72bf234f5087adfda38e9ffb
                  >
                    {p.name}
                  </text>
                </g>
              );
            })}
          </>
        )}

        {solveStatus === 'contradiction' && (
<<<<<<< HEAD
          <text x={VIEW_SIZE / 2} y={VIEW_SIZE / 2} textAnchor="middle" fontSize={14} fill="var(--danger)">
            図形を生成できません
=======
          <text
            x={VIEW_SIZE / 2}
            y={VIEW_SIZE / 2}
            textAnchor="middle"
            fontSize={14}
            fontFamily="var(--font-ui)"
            fill="var(--seal)"
          >
            この図形は作れません
>>>>>>> 30dca02bd58e331c72bf234f5087adfda38e9ffb
          </text>
        )}

        {solveStatus === 'idle' && (
<<<<<<< HEAD
          <text x={VIEW_SIZE / 2} y={VIEW_SIZE / 2} textAnchor="middle" fontSize={13} fill="var(--ink-soft)">
            点と条件を追加して「作図」を押してください
          </text>
        )}

        {/* 単位長さ表示（左下） */}
        {showContent && (
          <g>
            <line
              x1={16}
              y1={VIEW_SIZE - 20}
              x2={16 + unitPixelLength}
              y2={VIEW_SIZE - 20}
              stroke="var(--ink)"
              strokeWidth={2}
            />
            <line x1={16} y1={VIEW_SIZE - 25} x2={16} y2={VIEW_SIZE - 15} stroke="var(--ink)" strokeWidth={2} />
            <line
              x1={16 + unitPixelLength}
              y1={VIEW_SIZE - 25}
              x2={16 + unitPixelLength}
              y2={VIEW_SIZE - 15}
              stroke="var(--ink)"
              strokeWidth={2}
            />
            <text
              x={16 + unitPixelLength / 2}
              y={VIEW_SIZE - 30}
              textAnchor="middle"
              fontSize={12}
              fontFamily="var(--font-mono)"
              fill="var(--ink-soft)"
            >
              {formatUnitLabel(unitLength)}
            </text>
          </g>
        )}
      </svg>

      {/* 拡大縮小ボタン（右下） */}
      <div
        style={{
          position: 'absolute',
          right: 10,
          bottom: 10,
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
        }}
      >
        <ZoomButton onClick={zoomIn} label="+" title="拡大" />
        <ZoomButton onClick={zoomOut} label="−" title="縮小" />
        <ZoomButton onClick={zoomReset} label="⟲" title="リセット" small />
      </div>

      {/* 画像保存ボタン（右上） */}
      <div style={{ position: 'absolute', right: 10, top: 10, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
        <button
          onClick={handleSaveImage}
          disabled={!showContent}
          title="画像として保存・共有"
          style={{
            padding: '6px 12px',
            borderRadius: 6,
            border: '1px solid var(--rule)',
            background: showContent ? 'var(--panel)' : 'var(--rule-soft)',
            color: showContent ? 'var(--ink)' : 'var(--ink-soft)',
            fontSize: 12,
            cursor: showContent ? 'pointer' : 'not-allowed',
            boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
          }}
        >
          画像を保存・共有
        </button>
        {shareMessage && (
          <span style={{ fontSize: 11, color: 'var(--ok)', background: 'var(--ok-soft)', padding: '2px 6px', borderRadius: 4 }}>
            {shareMessage}
          </span>
        )}
      </div>
    </div>
  );
}

function ZoomButton({
  onClick,
  label,
  title,
  small,
}: {
  onClick: () => void;
  label: string;
  title: string;
  small?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        width: small ? 30 : 36,
        height: small ? 30 : 36,
        borderRadius: '50%',
        border: '1px solid var(--rule)',
        background: 'var(--panel)',
        color: 'var(--ink)',
        fontSize: small ? 14 : 18,
        fontWeight: 700,
        cursor: 'pointer',
        boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        lineHeight: 1,
      }}
    >
      {label}
    </button>
  );
}
=======
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
>>>>>>> 30dca02bd58e331c72bf234f5087adfda38e9ffb
