import { useState } from 'react';
import { useAppStore } from '../core/store';
<<<<<<< HEAD
import type { Constraint } from '../core/constraints';
import { parseNumericExpression, parseAngleExpressionToRadians } from '../core/parseValue';
import { LENGTH_PRESETS, ANGLE_PRESETS, RATIO_PRESETS } from '../core/presets';

type Category = '線分' | '角' | '直線' | '点' | '内分点・外分点' | '円' | '三角形' | '四角形' | '高度な幾何';

const CATEGORIES: Category[] = ['線分', '角', '直線', '点', '内分点・外分点', '円', '三角形', '四角形', '高度な幾何'];

function constraintLabel(c: Constraint): string {
  switch (c.type) {
    case 'length':
      return `${c.segment.join('')} = ${c.value}`;
    case 'lengthEqual':
      return `${c.seg1.join('')} = ${c.seg2.join('')}`;
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
    case 'internalDivision':
      return `${c.point} は ${c.seg.join('')} を ${c.ratio[0]}:${c.ratio[1]} に内分`;
    case 'externalDivision':
      return `${c.point} は ${c.seg.join('')} を ${c.ratio[0]}:${c.ratio[1]} に外分`;
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
      return `△(${c.apex}が頂角) ${c.apex}${c.base.join('')} は二等辺三角形`;
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
    case 'parallelogram':
      return `四角形${c.points.join('')} は平行四辺形`;
    case 'rectangle':
      return `四角形${c.points.join('')} は長方形`;
    case 'square':
      return `四角形${c.points.join('')} は正方形`;
    case 'trapezoid':
      return `四角形${c.points.join('')} は台形(AB∥DC)`;
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
    default:
      return '';
  }
}

export function ConstraintPanel() {
  const points = useAppStore((s) => s.points);
  const constraints = useAppStore((s) => s.constraints);
  const addConstraint = useAppStore((s) => s.addConstraint);
  const removeConstraint = useAppStore((s) => s.removeConstraint);

  const [category, setCategory] = useState<Category | null>(null);
  const needsGuide = points.length > 0 && constraints.length === 0;

  return (
    <section style={{ padding: '18px 18px 22px', borderBottom: '8px solid var(--rule-soft)' }}>
      <h2
        style={{
          fontSize: 13,
          letterSpacing: '0.04em',
          color: 'var(--ink)',
          fontWeight: 800,
          margin: '0 0 12px',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        <span
          className={needsGuide ? 'attention-pulse' : undefined}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 20,
            height: 20,
            borderRadius: '50%',
            background: 'var(--accent)',
            color: 'white',
            fontSize: 11,
            flexShrink: 0,
          }}
        >
          2
        </span>
        条件
        {needsGuide && (
          <span style={{ fontSize: 11.5, fontWeight: 500, color: 'var(--accent)' }} className="attention-text-pulse">
            ← 次はこちら
          </span>
        )}
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 14 }}>
        {constraints.length === 0 && (
          <p style={{ color: 'var(--ink-soft)', fontSize: 13, margin: 0, background: 'var(--rule-soft)', padding: '10px 12px', borderRadius: 6 }}>
            条件はまだありません。下のカテゴリから追加してください。
          </p>
        )}
        {constraints.map((c) => (
          <div
            key={c.id}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'var(--panel)',
              border: '1px solid var(--rule)',
              borderRadius: 6,
              padding: '6px 10px',
              fontSize: 13,
              fontFamily: 'var(--font-mono)',
            }}
          >
            <span>{constraintLabel(c)}</span>
            <button
              onClick={() => removeConstraint(c.id)}
              style={{
                border: 'none',
                background: 'transparent',
                color: 'var(--ink-soft)',
                cursor: 'pointer',
                fontSize: 16,
                lineHeight: 1,
                padding: '2px 4px',
              }}
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <div style={{ fontSize: 11.5, color: 'var(--ink-soft)', fontWeight: 700, marginBottom: 6, letterSpacing: '0.03em' }}>
        カテゴリを選んで追加
      </div>
      <div
        className={needsGuide ? 'attention-pulse' : undefined}
        style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12, borderRadius: 10, padding: needsGuide ? 4 : 0 }}
      >
=======
import { parseNumericExpression, parseAngleExpressionToRadians } from '../core/parseValue';

type Category = '線分' | '角' | '直線' | '点' | '円' | '三角形' | '四角形' | '多角形' | '高度な幾何';

const CATEGORIES: Category[] = ['線分', '角', '直線', '点', '円', '三角形', '四角形', '多角形', '高度な幾何'];

export function ConstraintPanel() {
  const points = useAppStore((s) => s.points);
  const addConstraint = useAppStore((s) => s.addConstraint);

  const [category, setCategory] = useState<Category | null>(null);

  return (
    <div>
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 10 }}>
>>>>>>> 30dca02bd58e331c72bf234f5087adfda38e9ffb
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(category === cat ? null : cat)}
            disabled={points.length === 0}
            style={{
<<<<<<< HEAD
              padding: '6px 13px',
              borderRadius: 999,
              border: `1.5px solid ${category === cat ? 'var(--accent)' : 'var(--rule)'}`,
              background: category === cat ? 'var(--accent)' : 'var(--panel)',
              color: points.length === 0 ? 'var(--ink-soft)' : category === cat ? 'white' : 'var(--ink)',
              fontSize: 13,
              fontWeight: category === cat ? 700 : 500,
              cursor: points.length === 0 ? 'not-allowed' : 'pointer',
              transition: 'all 0.12s ease',
=======
              padding: '5px 12px',
              borderRadius: 5,
              border: `1px solid ${category === cat ? 'var(--pen)' : 'var(--rule)'}`,
              background: category === cat ? 'var(--pen-soft)' : 'var(--paper-raised)',
              color: points.length === 0 ? 'var(--ink-soft)' : 'var(--ink)',
              fontSize: 13,
              cursor: points.length === 0 ? 'not-allowed' : 'pointer',
>>>>>>> 30dca02bd58e331c72bf234f5087adfda38e9ffb
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {points.length === 0 && (
<<<<<<< HEAD
        <p style={{ color: 'var(--ink-soft)', fontSize: 12, background: 'var(--rule-soft)', padding: '8px 10px', borderRadius: 6 }}>
          先に「①点」を追加してください。
        </p>
=======
        <p style={{ color: 'var(--ink-soft)', fontSize: 12 }}>先に点を追加してください。</p>
>>>>>>> 30dca02bd58e331c72bf234f5087adfda38e9ffb
      )}

      {category === '線分' && <SegmentForm points={points.map((p) => p.name)} addConstraint={addConstraint} />}
      {category === '角' && <AngleForm points={points.map((p) => p.name)} addConstraint={addConstraint} />}
      {category === '直線' && <LineForm points={points.map((p) => p.name)} addConstraint={addConstraint} />}
      {category === '点' && <PointRelationForm points={points.map((p) => p.name)} addConstraint={addConstraint} />}
<<<<<<< HEAD
      {category === '内分点・外分点' && <DivisionForm points={points.map((p) => p.name)} addConstraint={addConstraint} />}
      {category === '円' && <CircleForm points={points.map((p) => p.name)} addConstraint={addConstraint} />}
      {category === '三角形' && <TriangleForm points={points.map((p) => p.name)} addConstraint={addConstraint} />}
      {category === '四角形' && <QuadrilateralForm points={points.map((p) => p.name)} addConstraint={addConstraint} />}
      {category === '高度な幾何' && <AdvancedForm points={points.map((p) => p.name)} addConstraint={addConstraint} />}
    </section>
=======
      {category === '円' && <CircleForm points={points.map((p) => p.name)} addConstraint={addConstraint} />}
      {category === '三角形' && <TriangleForm points={points.map((p) => p.name)} addConstraint={addConstraint} />}
      {category === '四角形' && <QuadrilateralForm points={points.map((p) => p.name)} addConstraint={addConstraint} />}
      {category === '多角形' && <PolygonForm points={points.map((p) => p.name)} addConstraint={addConstraint} />}
      {category === '高度な幾何' && <AdvancedForm points={points.map((p) => p.name)} addConstraint={addConstraint} />}
    </div>
>>>>>>> 30dca02bd58e331c72bf234f5087adfda38e9ffb
  );
}

// --- 共通UIパーツ ---

function PointSelect({
  points,
  value,
  onChange,
  label,
}: {
  points: string[];
  value: string;
  onChange: (v: string) => void;
  label: string;
}) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 2, fontSize: 12, color: 'var(--ink-soft)' }}>
      {label}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ padding: '4px 6px', border: '1px solid var(--rule)', borderRadius: 4, fontSize: 13 }}
      >
        <option value="">-</option>
        {points.map((p) => (
          <option key={p} value={p}>
            {p}
          </option>
        ))}
      </select>
    </label>
  );
}

function FormRow({ children }: { children: React.ReactNode }) {
  return <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', flexWrap: 'wrap', marginBottom: 8 }}>{children}</div>;
}

function SubmitButton({ onClick, disabled }: { onClick: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: '6px 14px',
        border: 'none',
        borderRadius: 5,
<<<<<<< HEAD
        background: disabled ? 'var(--rule)' : 'var(--accent)',
=======
        background: disabled ? 'var(--rule)' : 'var(--pen)',
>>>>>>> 30dca02bd58e331c72bf234f5087adfda38e9ffb
        color: 'white',
        fontSize: 13,
        fontWeight: 600,
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
    >
      追加
    </button>
  );
}

<<<<<<< HEAD
/**
 * 「パレットで選ぶ」と「詳しく指定する」の2つの入力方法を持つ値入力欄。
 * プリセットボタンをタップすると即座にその値が入力され（パレット入力）、
 * 下のテキスト欄で自由に数式・角度などを直接編集することもできる（詳細入力）。
 */
function PaletteValueInput({
  label,
  value,
  onChange,
  presets,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  presets: { label: string; value: string }[];
  placeholder?: string;
}) {
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ fontSize: 11, color: 'var(--ink-soft)', marginBottom: 3 }}>{label}</div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
        <span style={{ fontSize: 10, color: 'var(--ink-soft)', whiteSpace: 'nowrap' }}>パレットで選ぶ</span>
        <div style={{ height: 1, background: 'var(--rule-soft)', flex: 1 }} />
      </div>
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 6 }}>
        {presets.map((p) => (
          <button
            key={p.label}
            onClick={() => onChange(p.value)}
            style={{
              padding: '3px 9px',
              borderRadius: 4,
              border: `1px solid ${value === p.value ? 'var(--accent)' : 'var(--rule)'}`,
              background: value === p.value ? 'var(--accent-soft)' : 'var(--panel)',
              fontSize: 12,
              cursor: 'pointer',
              fontFamily: 'var(--font-mono)',
            }}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
        <span style={{ fontSize: 10, color: 'var(--ink-soft)', whiteSpace: 'nowrap' }}>詳しく指定する</span>
        <div style={{ height: 1, background: 'var(--rule-soft)', flex: 1 }} />
      </div>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{ padding: '4px 6px', border: '1px solid var(--rule)', borderRadius: 4, fontSize: 13, width: 140 }}
      />
    </div>
  );
}

/** 比（m:n）のパレット＋詳細入力 */
function PaletteRatioInput({
  ratioL,
  ratioR,
  setRatioL,
  setRatioR,
}: {
  ratioL: string;
  ratioR: string;
  setRatioL: (v: string) => void;
  setRatioR: (v: string) => void;
}) {
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ fontSize: 11, color: 'var(--ink-soft)', marginBottom: 3 }}>比</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
        <span style={{ fontSize: 10, color: 'var(--ink-soft)', whiteSpace: 'nowrap' }}>パレットで選ぶ</span>
        <div style={{ height: 1, background: 'var(--rule-soft)', flex: 1 }} />
      </div>
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 6 }}>
        {RATIO_PRESETS.map((p) => (
          <button
            key={p.label}
            onClick={() => {
              setRatioL(String(p.value[0]));
              setRatioR(String(p.value[1]));
            }}
            style={{
              padding: '3px 9px',
              borderRadius: 4,
              border: `1px solid ${ratioL === String(p.value[0]) && ratioR === String(p.value[1]) ? 'var(--accent)' : 'var(--rule)'}`,
              background: ratioL === String(p.value[0]) && ratioR === String(p.value[1]) ? 'var(--accent-soft)' : 'var(--panel)',
              fontSize: 12,
              cursor: 'pointer',
              fontFamily: 'var(--font-mono)',
            }}
          >
            {p.label}
          </button>
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
        <span style={{ fontSize: 10, color: 'var(--ink-soft)', whiteSpace: 'nowrap' }}>詳しく指定する</span>
        <div style={{ height: 1, background: 'var(--rule-soft)', flex: 1 }} />
      </div>
      <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
        <input value={ratioL} onChange={(e) => setRatioL(e.target.value)} style={{ width: 44, padding: '4px 6px', border: '1px solid var(--rule)', borderRadius: 4 }} />
        :
        <input value={ratioR} onChange={(e) => setRatioR(e.target.value)} style={{ width: 44, padding: '4px 6px', border: '1px solid var(--rule)', borderRadius: 4 }} />
      </div>
    </div>
  );
}

=======
>>>>>>> 30dca02bd58e331c72bf234f5087adfda38e9ffb
// --- 線分カテゴリ ---

function SegmentForm({ points, addConstraint }: { points: string[]; addConstraint: (c: any) => void }) {
  const [kind, setKind] = useState<'length' | 'lengthEqual' | 'lengthRatio'>('length');
  const [a1, setA1] = useState('');
  const [b1, setB1] = useState('');
<<<<<<< HEAD
  const [a2, setA2] = useState('');
  const [b2, setB2] = useState('');
  const [value, setValue] = useState('');
  const [ratioL, setRatioL] = useState('1');
  const [ratioR, setRatioR] = useState('1');
=======
  const [value, setValue] = useState('');
  const [ratioA2, setRatioA2] = useState('');
  const [ratioB2, setRatioB2] = useState('');
  const [ratioL, setRatioL] = useState('1');
  const [ratioR, setRatioR] = useState('1');
  // lengthEqual用: 複数の線分をまとめて「すべて等しい」と指定できるようにする
  const [equalSegments, setEqualSegments] = useState<[string, string][]>([['', ''], ['', '']]);
>>>>>>> 30dca02bd58e331c72bf234f5087adfda38e9ffb
  const [error, setError] = useState<string | null>(null);

  const submit = () => {
    setError(null);
    if (kind === 'length') {
      if (!a1 || !b1 || a1 === b1) return setError('2つの異なる点を選んでください');
      const v = parseNumericExpression(value);
      if (v === null || v <= 0) return setError('正しい数値を入力してください (例: 5, 3/2, √3)');
      addConstraint({ type: 'length', segment: [a1, b1], value: v });
<<<<<<< HEAD
    } else if (kind === 'lengthEqual') {
      if (!a1 || !b1 || !a2 || !b2 || a1 === b1 || a2 === b2) return setError('線分を正しく選んでください');
      addConstraint({ type: 'lengthEqual', seg1: [a1, b1], seg2: [a2, b2] });
    } else {
      if (!a1 || !b1 || !a2 || !b2 || a1 === b1 || a2 === b2) return setError('線分を正しく選んでください');
      const r1 = Number(ratioL);
      const r2 = Number(ratioR);
      if (!r1 || !r2 || r1 <= 0 || r2 <= 0) return setError('比は正の数で入力してください');
      addConstraint({ type: 'lengthRatio', seg1: [a1, b1], seg2: [a2, b2], ratio: [r1, r2] });
    }
    setA1(''); setB1(''); setA2(''); setB2(''); setValue('');
  };

  return (
    <div style={{ background: 'var(--panel)', border: '1px solid var(--rule)', borderRadius: 6, padding: 10 }}>
=======
      setA1(''); setB1(''); setValue('');
    } else if (kind === 'lengthEqual') {
      const validSegs = equalSegments.filter(([p1, p2]) => p1 && p2 && p1 !== p2);
      if (validSegs.length < 2) return setError('2つ以上の線分を指定してください');
      // 重複線分チェック（同じ線分を2回選んでいないか）
      const keys = validSegs.map(([p1, p2]) => [p1, p2].sort().join('-'));
      if (new Set(keys).size !== keys.length) return setError('同じ線分が重複しています');
      addConstraint({ type: 'lengthEqualGroup', segments: validSegs });
      setEqualSegments([['', ''], ['', '']]);
    } else {
      if (!a1 || !b1 || !ratioA2 || !ratioB2 || a1 === b1 || ratioA2 === ratioB2) {
        return setError('線分を正しく選んでください');
      }
      const r1 = Number(ratioL);
      const r2 = Number(ratioR);
      if (!r1 || !r2 || r1 <= 0 || r2 <= 0) return setError('比は正の数で入力してください');
      addConstraint({ type: 'lengthRatio', seg1: [a1, b1], seg2: [ratioA2, ratioB2], ratio: [r1, r2] });
      setA1(''); setB1(''); setRatioA2(''); setRatioB2('');
    }
  };

  return (
    <div style={{ background: 'var(--paper-raised)', border: '1px solid var(--rule)', borderRadius: 6, padding: 10 }}>
>>>>>>> 30dca02bd58e331c72bf234f5087adfda38e9ffb
      <FormRow>
        <select value={kind} onChange={(e) => setKind(e.target.value as any)} style={{ padding: '4px 6px', fontSize: 13 }}>
          <option value="length">長さ</option>
          <option value="lengthEqual">長さが等しい</option>
          <option value="lengthRatio">長さの比</option>
        </select>
      </FormRow>

<<<<<<< HEAD
      <FormRow>
        <PointSelect points={points} value={a1} onChange={setA1} label={kind === 'length' ? '線分 始点' : '線分1 始点'} />
        <PointSelect points={points} value={b1} onChange={setB1} label={kind === 'length' ? '線分 終点' : '線分1 終点'} />
      </FormRow>

      {kind === 'length' && (
        <PaletteValueInput label="長さの値" value={value} onChange={setValue} presets={LENGTH_PRESETS} placeholder="例: 6, 3/2, √3" />
      )}

      {kind !== 'length' && (
        <FormRow>
          <PointSelect points={points} value={a2} onChange={setA2} label="線分2 始点" />
          <PointSelect points={points} value={b2} onChange={setB2} label="線分2 終点" />
        </FormRow>
      )}

      {kind === 'lengthRatio' && (
        <PaletteRatioInput ratioL={ratioL} ratioR={ratioR} setRatioL={setRatioL} setRatioR={setRatioR} />
      )}

      {error && <p style={{ color: 'var(--danger)', fontSize: 12 }}>{error}</p>}
=======
      {kind === 'length' && (
        <>
          <FormRow>
            <PointSelect points={points} value={a1} onChange={setA1} label="線分 始点" />
            <PointSelect points={points} value={b1} onChange={setB1} label="線分 終点" />
          </FormRow>
          <FormRow>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 2, fontSize: 12, color: 'var(--ink-soft)' }}>
              値
              <input value={value} onChange={(e) => setValue(e.target.value)} placeholder="例: 6, 3/2, √3" style={{ padding: '4px 6px', border: '1px solid var(--rule)', borderRadius: 4, fontSize: 13, width: 100 }} />
            </label>
          </FormRow>
        </>
      )}

      {kind === 'lengthEqual' && (
        <>
          <p style={{ fontSize: 11, color: 'var(--ink-soft)', margin: '0 0 6px' }}>
            すべて同じ長さにしたい線分を追加してください（2本以上）
          </p>
          {equalSegments.map(([p1, p2], i) => (
            <FormRow key={i}>
              <PointSelect
                points={points}
                value={p1}
                onChange={(nv) => {
                  const copy = [...equalSegments];
                  copy[i] = [nv, copy[i][1]];
                  setEqualSegments(copy);
                }}
                label={`線分${i + 1} 始点`}
              />
              <PointSelect
                points={points}
                value={p2}
                onChange={(nv) => {
                  const copy = [...equalSegments];
                  copy[i] = [copy[i][0], nv];
                  setEqualSegments(copy);
                }}
                label={`線分${i + 1} 終点`}
              />
              {equalSegments.length > 2 && (
                <button
                  onClick={() => setEqualSegments(equalSegments.filter((_, idx) => idx !== i))}
                  style={{ border: 'none', background: 'transparent', color: 'var(--ink-soft)', cursor: 'pointer', fontSize: 14, alignSelf: 'flex-end', paddingBottom: 4 }}
                >
                  ×
                </button>
              )}
            </FormRow>
          ))}
          <button
            onClick={() => setEqualSegments([...equalSegments, ['', '']])}
            style={{ border: '1px dashed var(--rule)', background: 'none', borderRadius: 4, padding: '4px 8px', fontSize: 12, cursor: 'pointer', color: 'var(--ink-soft)', marginBottom: 8 }}
          >
            + 線分を追加
          </button>
        </>
      )}

      {kind === 'lengthRatio' && (
        <>
          <FormRow>
            <PointSelect points={points} value={a1} onChange={setA1} label="線分1 始点" />
            <PointSelect points={points} value={b1} onChange={setB1} label="線分1 終点" />
          </FormRow>
          <FormRow>
            <PointSelect points={points} value={ratioA2} onChange={setRatioA2} label="線分2 始点" />
            <PointSelect points={points} value={ratioB2} onChange={setRatioB2} label="線分2 終点" />
          </FormRow>
          <FormRow>
            <label style={{ fontSize: 12, color: 'var(--ink-soft)' }}>
              比
              <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                <input value={ratioL} onChange={(e) => setRatioL(e.target.value)} style={{ width: 40, padding: '4px 6px', border: '1px solid var(--rule)', borderRadius: 4 }} />
                :
                <input value={ratioR} onChange={(e) => setRatioR(e.target.value)} style={{ width: 40, padding: '4px 6px', border: '1px solid var(--rule)', borderRadius: 4 }} />
              </div>
            </label>
          </FormRow>
        </>
      )}

      {error && <p style={{ color: 'var(--seal)', fontSize: 12 }}>{error}</p>}
>>>>>>> 30dca02bd58e331c72bf234f5087adfda38e9ffb
      <SubmitButton onClick={submit} />
    </div>
  );
}

// --- 角カテゴリ ---

function AngleForm({ points, addConstraint }: { points: string[]; addConstraint: (c: any) => void }) {
  const [kind, setKind] = useState<'angle' | 'angleEqual' | 'angleRatio'>('angle');
  const [a1, setA1] = useState(''); const [b1, setB1] = useState(''); const [c1, setC1] = useState('');
  const [a2, setA2] = useState(''); const [b2, setB2] = useState(''); const [c2, setC2] = useState('');
  const [value, setValue] = useState('');
  const [ratioL, setRatioL] = useState('1');
  const [ratioR, setRatioR] = useState('1');
  const [error, setError] = useState<string | null>(null);

  const valid3 = (a: string, b: string, c: string) => a && b && c && a !== b && b !== c && a !== c;

  const submit = () => {
    setError(null);
    if (kind === 'angle') {
      if (!valid3(a1, b1, c1)) return setError('3つの異なる点を選んでください（中央が頂点）');
      const rad = parseAngleExpressionToRadians(value);
      if (rad === null || rad <= 0 || rad >= Math.PI) return setError('0°〜180°の範囲で入力してください');
      addConstraint({ type: 'angle', points: [a1, b1, c1], value: rad });
    } else if (kind === 'angleEqual') {
      if (!valid3(a1, b1, c1) || !valid3(a2, b2, c2)) return setError('角を正しく選んでください');
      addConstraint({ type: 'angleEqual', angle1: [a1, b1, c1], angle2: [a2, b2, c2] });
    } else {
      if (!valid3(a1, b1, c1) || !valid3(a2, b2, c2)) return setError('角を正しく選んでください');
      const r1 = Number(ratioL); const r2 = Number(ratioR);
      if (!r1 || !r2 || r1 <= 0 || r2 <= 0) return setError('比は正の数で入力してください');
      addConstraint({ type: 'angleRatio', angle1: [a1, b1, c1], angle2: [a2, b2, c2], ratio: [r1, r2] });
    }
    setA1(''); setB1(''); setC1(''); setA2(''); setB2(''); setC2(''); setValue('');
  };

  return (
<<<<<<< HEAD
    <div style={{ background: 'var(--panel)', border: '1px solid var(--rule)', borderRadius: 6, padding: 10 }}>
=======
    <div style={{ background: 'var(--paper-raised)', border: '1px solid var(--rule)', borderRadius: 6, padding: 10 }}>
>>>>>>> 30dca02bd58e331c72bf234f5087adfda38e9ffb
      <FormRow>
        <select value={kind} onChange={(e) => setKind(e.target.value as any)} style={{ padding: '4px 6px', fontSize: 13 }}>
          <option value="angle">角度</option>
          <option value="angleEqual">角度が等しい</option>
          <option value="angleRatio">角度の比</option>
        </select>
      </FormRow>

      <p style={{ fontSize: 11, color: 'var(--ink-soft)', margin: '0 0 4px' }}>
        {kind === 'angle' ? '角1（中央が頂点）' : '角1（中央が頂点）'}
      </p>
      <FormRow>
        <PointSelect points={points} value={a1} onChange={setA1} label="点1" />
        <PointSelect points={points} value={b1} onChange={setB1} label="頂点" />
        <PointSelect points={points} value={c1} onChange={setC1} label="点3" />
      </FormRow>

      {kind === 'angle' && (
<<<<<<< HEAD
        <PaletteValueInput label="角度の値（度）" value={value} onChange={setValue} presets={ANGLE_PRESETS} placeholder="例: 60" />
=======
        <FormRow>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 2, fontSize: 12, color: 'var(--ink-soft)' }}>
            値（度）
            <input value={value} onChange={(e) => setValue(e.target.value)} placeholder="例: 60" style={{ padding: '4px 6px', border: '1px solid var(--rule)', borderRadius: 4, fontSize: 13, width: 100 }} />
          </label>
        </FormRow>
>>>>>>> 30dca02bd58e331c72bf234f5087adfda38e9ffb
      )}

      {kind !== 'angle' && (
        <>
          <p style={{ fontSize: 11, color: 'var(--ink-soft)', margin: '0 0 4px' }}>角2（中央が頂点）</p>
          <FormRow>
            <PointSelect points={points} value={a2} onChange={setA2} label="点1" />
            <PointSelect points={points} value={b2} onChange={setB2} label="頂点" />
            <PointSelect points={points} value={c2} onChange={setC2} label="点3" />
          </FormRow>
        </>
      )}

      {kind === 'angleRatio' && (
<<<<<<< HEAD
        <PaletteRatioInput ratioL={ratioL} ratioR={ratioR} setRatioL={setRatioL} setRatioR={setRatioR} />
      )}

      {error && <p style={{ color: 'var(--danger)', fontSize: 12 }}>{error}</p>}
=======
        <FormRow>
          <label style={{ fontSize: 12, color: 'var(--ink-soft)' }}>
            比
            <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
              <input value={ratioL} onChange={(e) => setRatioL(e.target.value)} style={{ width: 40, padding: '4px 6px', border: '1px solid var(--rule)', borderRadius: 4 }} />
              :
              <input value={ratioR} onChange={(e) => setRatioR(e.target.value)} style={{ width: 40, padding: '4px 6px', border: '1px solid var(--rule)', borderRadius: 4 }} />
            </div>
          </label>
        </FormRow>
      )}

      {error && <p style={{ color: 'var(--seal)', fontSize: 12 }}>{error}</p>}
>>>>>>> 30dca02bd58e331c72bf234f5087adfda38e9ffb
      <SubmitButton onClick={submit} />
    </div>
  );
}

// --- 直線カテゴリ ---

function LineForm({ points, addConstraint }: { points: string[]; addConstraint: (c: any) => void }) {
  const [kind, setKind] = useState<'collinear' | 'parallel' | 'perpendicular'>('parallel');
  const [collinearPoints, setCollinearPoints] = useState<string[]>(['', '', '']);
  const [a1, setA1] = useState(''); const [b1, setB1] = useState('');
  const [a2, setA2] = useState(''); const [b2, setB2] = useState('');
  const [error, setError] = useState<string | null>(null);

  const submit = () => {
    setError(null);
    if (kind === 'collinear') {
      const pts = collinearPoints.filter(Boolean);
      if (pts.length < 3 || new Set(pts).size !== pts.length) return setError('3つ以上の異なる点を選んでください');
      addConstraint({ type: 'collinear', points: pts });
      setCollinearPoints(['', '', '']);
      return;
    }
    if (!a1 || !b1 || !a2 || !b2 || a1 === b1 || a2 === b2) return setError('線分を正しく選んでください');
    addConstraint({ type: kind, seg1: [a1, b1], seg2: [a2, b2] });
    setA1(''); setB1(''); setA2(''); setB2('');
  };

  return (
<<<<<<< HEAD
    <div style={{ background: 'var(--panel)', border: '1px solid var(--rule)', borderRadius: 6, padding: 10 }}>
=======
    <div style={{ background: 'var(--paper-raised)', border: '1px solid var(--rule)', borderRadius: 6, padding: 10 }}>
>>>>>>> 30dca02bd58e331c72bf234f5087adfda38e9ffb
      <FormRow>
        <select value={kind} onChange={(e) => setKind(e.target.value as any)} style={{ padding: '4px 6px', fontSize: 13 }}>
          <option value="parallel">平行</option>
          <option value="perpendicular">垂直</option>
          <option value="collinear">同一直線上</option>
        </select>
      </FormRow>

      {kind === 'collinear' ? (
        <FormRow>
          {collinearPoints.map((v, i) => (
            <PointSelect
              key={i}
              points={points}
              value={v}
              onChange={(nv) => {
                const copy = [...collinearPoints];
                copy[i] = nv;
                setCollinearPoints(copy);
              }}
              label={`点${i + 1}`}
            />
          ))}
          <button
            onClick={() => setCollinearPoints([...collinearPoints, ''])}
            style={{ border: '1px dashed var(--rule)', background: 'none', borderRadius: 4, padding: '4px 8px', fontSize: 12, cursor: 'pointer', color: 'var(--ink-soft)' }}
          >
            + 点を追加
          </button>
        </FormRow>
      ) : (
        <>
          <FormRow>
            <PointSelect points={points} value={a1} onChange={setA1} label="線分1 始点" />
            <PointSelect points={points} value={b1} onChange={setB1} label="線分1 終点" />
          </FormRow>
          <FormRow>
            <PointSelect points={points} value={a2} onChange={setA2} label="線分2 始点" />
            <PointSelect points={points} value={b2} onChange={setB2} label="線分2 終点" />
          </FormRow>
        </>
      )}

<<<<<<< HEAD
      {error && <p style={{ color: 'var(--danger)', fontSize: 12 }}>{error}</p>}
=======
      {error && <p style={{ color: 'var(--seal)', fontSize: 12 }}>{error}</p>}
>>>>>>> 30dca02bd58e331c72bf234f5087adfda38e9ffb
      <SubmitButton onClick={submit} />
    </div>
  );
}

// --- 点カテゴリ（中点・線分上・直線上） ---

function PointRelationForm({ points, addConstraint }: { points: string[]; addConstraint: (c: any) => void }) {
  const [kind, setKind] = useState<'midpoint' | 'onSegment' | 'onLine'>('midpoint');
  const [target, setTarget] = useState('');
  const [a, setA] = useState('');
  const [b, setB] = useState('');
  const [error, setError] = useState<string | null>(null);

  const submit = () => {
    setError(null);
    if (!target || !a || !b || target === a || target === b || a === b) {
      return setError('異なる3点を選んでください');
    }
    if (kind === 'midpoint') addConstraint({ type: 'midpoint', midpoint: target, seg: [a, b] });
    if (kind === 'onSegment') addConstraint({ type: 'onSegment', point: target, seg: [a, b] });
    if (kind === 'onLine') addConstraint({ type: 'onLine', point: target, line: [a, b] });
    setTarget(''); setA(''); setB('');
  };

  return (
<<<<<<< HEAD
    <div style={{ background: 'var(--panel)', border: '1px solid var(--rule)', borderRadius: 6, padding: 10 }}>
=======
    <div style={{ background: 'var(--paper-raised)', border: '1px solid var(--rule)', borderRadius: 6, padding: 10 }}>
>>>>>>> 30dca02bd58e331c72bf234f5087adfda38e9ffb
      <FormRow>
        <select value={kind} onChange={(e) => setKind(e.target.value as any)} style={{ padding: '4px 6px', fontSize: 13 }}>
          <option value="midpoint">中点</option>
          <option value="onSegment">線分上にある</option>
          <option value="onLine">直線上にある</option>
        </select>
      </FormRow>
      <FormRow>
        <PointSelect points={points} value={target} onChange={setTarget} label={kind === 'midpoint' ? '中点' : '対象の点'} />
        <PointSelect points={points} value={a} onChange={setA} label={kind === 'onLine' ? '直線上の点1' : '線分 始点'} />
        <PointSelect points={points} value={b} onChange={setB} label={kind === 'onLine' ? '直線上の点2' : '線分 終点'} />
      </FormRow>
<<<<<<< HEAD
      {error && <p style={{ color: 'var(--danger)', fontSize: 12 }}>{error}</p>}
      <SubmitButton onClick={submit} />
    </div>
  );
}

// --- 内分点・外分点カテゴリ ---

function DivisionForm({ points, addConstraint }: { points: string[]; addConstraint: (c: any) => void }) {
  const [kind, setKind] = useState<'internalDivision' | 'externalDivision'>('internalDivision');
  const [target, setTarget] = useState('');
  const [a, setA] = useState('');
  const [b, setB] = useState('');
  const [ratioL, setRatioL] = useState('1');
  const [ratioR, setRatioR] = useState('1');
  const [error, setError] = useState<string | null>(null);

  const submit = () => {
    setError(null);
    if (!target || !a || !b || target === a || target === b || a === b) {
      return setError('異なる3点を選んでください（対象の点・線分の両端）');
    }
    const m = Number(ratioL);
    const n = Number(ratioR);
    if (!m || !n || m <= 0 || n <= 0) return setError('比は正の数で入力してください');
    if (kind === 'externalDivision' && m === n) {
      return setError('外分の比は m:n で m≠n としてください（1:1では外分点が定まりません）');
    }
    addConstraint({ type: kind, point: target, seg: [a, b], ratio: [m, n] });
    setTarget(''); setA(''); setB('');
  };

  return (
    <div style={{ background: 'var(--panel)', border: '1px solid var(--rule)', borderRadius: 6, padding: 10 }}>
      <p style={{ fontSize: 11, color: 'var(--ink-soft)', margin: '0 0 6px' }}>
        線分 AB を m:n に分ける点を指定します（内分＝線分上、外分＝線分の延長上）
      </p>
      <FormRow>
        <select value={kind} onChange={(e) => setKind(e.target.value as any)} style={{ padding: '4px 6px', fontSize: 13 }}>
          <option value="internalDivision">内分点</option>
          <option value="externalDivision">外分点</option>
        </select>
      </FormRow>
      <FormRow>
        <PointSelect points={points} value={target} onChange={setTarget} label="分ける点" />
        <PointSelect points={points} value={a} onChange={setA} label="線分 始点 A" />
        <PointSelect points={points} value={b} onChange={setB} label="線分 終点 B" />
      </FormRow>
      <PaletteRatioInput ratioL={ratioL} ratioR={ratioR} setRatioL={setRatioL} setRatioR={setRatioR} />
      <p style={{ fontSize: 11, color: 'var(--ink-soft)', margin: '0 0 8px' }}>
        {kind === 'internalDivision'
          ? 'AB を m:n に内分 → AP:PB = m:n （Pは線分AB上）'
          : 'AB を m:n に外分 → AP:PB = m:n （Pは直線ABの延長上）'}
      </p>
      {error && <p style={{ color: 'var(--danger)', fontSize: 12 }}>{error}</p>}
=======
      {error && <p style={{ color: 'var(--seal)', fontSize: 12 }}>{error}</p>}
>>>>>>> 30dca02bd58e331c72bf234f5087adfda38e9ffb
      <SubmitButton onClick={submit} />
    </div>
  );
}

// --- 円カテゴリ ---

function CircleForm({ points, addConstraint }: { points: string[]; addConstraint: (c: any) => void }) {
  const [kind, setKind] = useState<'circleRadius' | 'onCircle' | 'tangentLine' | 'tangentCircles'>('circleRadius');
  const [center, setCenter] = useState('');
  const [radiusPoint, setRadiusPoint] = useState('');
  const [value, setValue] = useState('');
  const [point, setPoint] = useState('');
  const [lineA, setLineA] = useState('');
  const [lineB, setLineB] = useState('');
  const [center2, setCenter2] = useState('');
  const [radiusPoint2, setRadiusPoint2] = useState('');
  const [error, setError] = useState<string | null>(null);

  const submit = () => {
    setError(null);
    if (kind === 'circleRadius') {
      if (!center || !radiusPoint || center === radiusPoint) return setError('中心と半径点を選んでください');
      const v = parseNumericExpression(value);
      if (v === null || v <= 0) return setError('正しい数値を入力してください');
      addConstraint({ type: 'circleRadius', center, radiusPoint, value: v });
    } else if (kind === 'onCircle') {
      if (!point || !center || !radiusPoint) return setError('点・中心・半径点を選んでください');
      addConstraint({ type: 'onCircle', point, center, radius: radiusPoint });
    } else if (kind === 'tangentLine') {
      if (!center || !radiusPoint || !lineA || !lineB) return setError('円と直線を指定してください');
      addConstraint({ type: 'tangentLine', center, radiusPoint, line: [lineA, lineB] });
    } else {
      if (!center || !radiusPoint || !center2 || !radiusPoint2) return setError('2つの円を指定してください');
      addConstraint({ type: 'tangentCircles', center1: center, radiusPoint1: radiusPoint, center2, radiusPoint2 });
    }
    setCenter(''); setRadiusPoint(''); setValue(''); setPoint('');
    setLineA(''); setLineB(''); setCenter2(''); setRadiusPoint2('');
  };

  return (
<<<<<<< HEAD
    <div style={{ background: 'var(--panel)', border: '1px solid var(--rule)', borderRadius: 6, padding: 10 }}>
=======
    <div style={{ background: 'var(--paper-raised)', border: '1px solid var(--rule)', borderRadius: 6, padding: 10 }}>
>>>>>>> 30dca02bd58e331c72bf234f5087adfda38e9ffb
      <p style={{ fontSize: 11, color: 'var(--ink-soft)', margin: '0 0 6px' }}>
        円は「中心点」と「円周上の1点(半径を定義)」の組で表します
      </p>
      <FormRow>
        <select value={kind} onChange={(e) => setKind(e.target.value as any)} style={{ padding: '4px 6px', fontSize: 13 }}>
          <option value="circleRadius">半径</option>
          <option value="onCircle">円周上</option>
          <option value="tangentLine">接線</option>
          <option value="tangentCircles">円が接する</option>
        </select>
      </FormRow>

      <FormRow>
        <PointSelect points={points} value={center} onChange={setCenter} label="円の中心" />
        <PointSelect points={points} value={radiusPoint} onChange={setRadiusPoint} label="半径を定義する点" />
      </FormRow>

      {kind === 'circleRadius' && (
<<<<<<< HEAD
        <PaletteValueInput label="半径の値" value={value} onChange={setValue} presets={LENGTH_PRESETS} placeholder="例: 3" />
=======
        <FormRow>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 2, fontSize: 12, color: 'var(--ink-soft)' }}>
            半径の値
            <input value={value} onChange={(e) => setValue(e.target.value)} placeholder="例: 3" style={{ padding: '4px 6px', border: '1px solid var(--rule)', borderRadius: 4, fontSize: 13, width: 100 }} />
          </label>
        </FormRow>
>>>>>>> 30dca02bd58e331c72bf234f5087adfda38e9ffb
      )}

      {kind === 'onCircle' && (
        <FormRow>
          <PointSelect points={points} value={point} onChange={setPoint} label="円周上にある点" />
        </FormRow>
      )}

      {kind === 'tangentLine' && (
        <FormRow>
          <PointSelect points={points} value={lineA} onChange={setLineA} label="直線 点1" />
          <PointSelect points={points} value={lineB} onChange={setLineB} label="直線 点2" />
        </FormRow>
      )}

      {kind === 'tangentCircles' && (
        <>
          <p style={{ fontSize: 11, color: 'var(--ink-soft)', margin: '8px 0 4px' }}>2つ目の円</p>
          <FormRow>
            <PointSelect points={points} value={center2} onChange={setCenter2} label="中心2" />
            <PointSelect points={points} value={radiusPoint2} onChange={setRadiusPoint2} label="半径点2" />
          </FormRow>
        </>
      )}

<<<<<<< HEAD
      {error && <p style={{ color: 'var(--danger)', fontSize: 12 }}>{error}</p>}
=======
      {error && <p style={{ color: 'var(--seal)', fontSize: 12 }}>{error}</p>}
>>>>>>> 30dca02bd58e331c72bf234f5087adfda38e9ffb
      <SubmitButton onClick={submit} />
    </div>
  );
}

// --- 三角形カテゴリ ---

function TriangleForm({ points, addConstraint }: { points: string[]; addConstraint: (c: any) => void }) {
  const [kind, setKind] = useState<
    'equilateralTriangle' | 'isoscelesTriangle' | 'rightTriangle' | 'centroid' | 'circumcenter' | 'incenter' | 'orthocenter'
  >('equilateralTriangle');
  const [a, setA] = useState('');
  const [b, setB] = useState('');
  const [c, setC] = useState('');
  const [centerPoint, setCenterPoint] = useState('');
  const [error, setError] = useState<string | null>(null);

  const isCenterKind = kind === 'centroid' || kind === 'circumcenter' || kind === 'incenter' || kind === 'orthocenter';
  const valid3 = a && b && c && a !== b && b !== c && a !== c;

  const submit = () => {
    setError(null);
    if (!valid3) return setError('3つの異なる点を選んでください');
    if (isCenterKind) {
      if (!centerPoint || centerPoint === a || centerPoint === b || centerPoint === c) {
        return setError('三角形の頂点とは異なる点を「中心」として選んでください');
      }
      addConstraint({ type: kind, center: centerPoint, triangle: [a, b, c] });
      setCenterPoint('');
    } else if (kind === 'equilateralTriangle') {
      addConstraint({ type: 'equilateralTriangle', points: [a, b, c] });
    } else if (kind === 'isoscelesTriangle') {
      addConstraint({ type: 'isoscelesTriangle', apex: a, base: [b, c] });
    } else {
      addConstraint({ type: 'rightTriangle', rightAngleAt: a, points: [a, b, c] });
    }
    setA(''); setB(''); setC('');
  };

  return (
<<<<<<< HEAD
    <div style={{ background: 'var(--panel)', border: '1px solid var(--rule)', borderRadius: 6, padding: 10 }}>
=======
    <div style={{ background: 'var(--paper-raised)', border: '1px solid var(--rule)', borderRadius: 6, padding: 10 }}>
>>>>>>> 30dca02bd58e331c72bf234f5087adfda38e9ffb
      <FormRow>
        <select value={kind} onChange={(e) => setKind(e.target.value as any)} style={{ padding: '4px 6px', fontSize: 13 }}>
          <option value="equilateralTriangle">正三角形</option>
          <option value="isoscelesTriangle">二等辺三角形</option>
          <option value="rightTriangle">直角三角形</option>
          <option value="centroid">重心</option>
          <option value="circumcenter">外心</option>
          <option value="incenter">内心</option>
          <option value="orthocenter">垂心</option>
        </select>
      </FormRow>

      <p style={{ fontSize: 11, color: 'var(--ink-soft)', margin: '0 0 4px' }}>三角形の3頂点</p>
      <FormRow>
        <PointSelect
          points={points}
          value={a}
          onChange={setA}
          label={kind === 'isoscelesTriangle' ? '頂角の点' : kind === 'rightTriangle' ? '直角の頂点' : '点1'}
        />
        <PointSelect points={points} value={b} onChange={setB} label="点2" />
        <PointSelect points={points} value={c} onChange={setC} label="点3" />
      </FormRow>

      {isCenterKind && (
        <FormRow>
          <PointSelect points={points} value={centerPoint} onChange={setCenterPoint} label="中心とする点" />
        </FormRow>
      )}

<<<<<<< HEAD
      {error && <p style={{ color: 'var(--danger)', fontSize: 12 }}>{error}</p>}
=======
      {error && <p style={{ color: 'var(--seal)', fontSize: 12 }}>{error}</p>}
>>>>>>> 30dca02bd58e331c72bf234f5087adfda38e9ffb
      <SubmitButton onClick={submit} />
    </div>
  );
}

// --- 四角形カテゴリ ---

function QuadrilateralForm({ points, addConstraint }: { points: string[]; addConstraint: (c: any) => void }) {
<<<<<<< HEAD
  const [kind, setKind] = useState<'parallelogram' | 'rectangle' | 'square' | 'trapezoid'>('parallelogram');
  const [vertices, setVertices] = useState<string[]>(['', '', '', '']);
=======
  const [kind, setKind] = useState<'quadrilateral' | 'parallelogram' | 'rectangle' | 'square' | 'trapezoid'>('quadrilateral');
  const [vertices, setVertices] = useState<string[]>(['', '', '', '']);
  // 台形用: 平行にする2辺をそれぞれ端点2つで指定
  const [side1a, setSide1a] = useState('');
  const [side1b, setSide1b] = useState('');
  const [side2a, setSide2a] = useState('');
  const [side2b, setSide2b] = useState('');
>>>>>>> 30dca02bd58e331c72bf234f5087adfda38e9ffb
  const [error, setError] = useState<string | null>(null);

  const submit = () => {
    setError(null);
    if (vertices.some((v) => !v) || new Set(vertices).size !== 4) {
      return setError('4つの異なる点を、周を成す順序（A→B→C→D）で選んでください');
    }
<<<<<<< HEAD
    addConstraint({ type: kind, points: vertices });
=======
    if (kind === 'trapezoid') {
      if (!side1a || !side1b || !side2a || !side2b || side1a === side1b || side2a === side2b) {
        return setError('平行にする2辺をそれぞれ正しく選んでください');
      }
      addConstraint({
        type: 'trapezoid',
        points: vertices,
        parallelSides: [
          [side1a, side1b],
          [side2a, side2b],
        ],
      });
      setSide1a(''); setSide1b(''); setSide2a(''); setSide2b('');
    } else {
      addConstraint({ type: kind, points: vertices });
    }
>>>>>>> 30dca02bd58e331c72bf234f5087adfda38e9ffb
    setVertices(['', '', '', '']);
  };

  return (
<<<<<<< HEAD
    <div style={{ background: 'var(--panel)', border: '1px solid var(--rule)', borderRadius: 6, padding: 10 }}>
=======
    <div style={{ background: 'var(--paper-raised)', border: '1px solid var(--rule)', borderRadius: 6, padding: 10 }}>
>>>>>>> 30dca02bd58e331c72bf234f5087adfda38e9ffb
      <p style={{ fontSize: 11, color: 'var(--ink-soft)', margin: '0 0 6px' }}>
        頂点は四角形の周を回る順序（A→B→C→D）で選んでください
      </p>
      <FormRow>
        <select value={kind} onChange={(e) => setKind(e.target.value as any)} style={{ padding: '4px 6px', fontSize: 13 }}>
<<<<<<< HEAD
          <option value="parallelogram">平行四辺形</option>
          <option value="rectangle">長方形</option>
          <option value="square">正方形</option>
          <option value="trapezoid">台形 (AB∥DC)</option>
=======
          <option value="quadrilateral">四角形（形の指定なし）</option>
          <option value="parallelogram">平行四辺形</option>
          <option value="rectangle">長方形</option>
          <option value="square">正方形</option>
          <option value="trapezoid">台形</option>
>>>>>>> 30dca02bd58e331c72bf234f5087adfda38e9ffb
        </select>
      </FormRow>
      <FormRow>
        {vertices.map((v, i) => (
          <PointSelect
            key={i}
            points={points}
            value={v}
            onChange={(nv) => {
              const copy = [...vertices];
              copy[i] = nv;
              setVertices(copy);
            }}
            label={['A', 'B', 'C', 'D'][i]}
          />
        ))}
      </FormRow>
<<<<<<< HEAD
      {error && <p style={{ color: 'var(--danger)', fontSize: 12 }}>{error}</p>}
=======

      {kind === 'trapezoid' && (
        <>
          <p style={{ fontSize: 11, color: 'var(--ink-soft)', margin: '8px 0 4px' }}>平行にする辺1</p>
          <FormRow>
            <PointSelect points={points} value={side1a} onChange={setSide1a} label="端点1" />
            <PointSelect points={points} value={side1b} onChange={setSide1b} label="端点2" />
          </FormRow>
          <p style={{ fontSize: 11, color: 'var(--ink-soft)', margin: '0 0 4px' }}>平行にする辺2</p>
          <FormRow>
            <PointSelect points={points} value={side2a} onChange={setSide2a} label="端点1" />
            <PointSelect points={points} value={side2b} onChange={setSide2b} label="端点2" />
          </FormRow>
        </>
      )}

      {error && <p style={{ color: 'var(--seal)', fontSize: 12 }}>{error}</p>}
      <SubmitButton onClick={submit} />
    </div>
  );
}

// --- 多角形カテゴリ（面積を条件として指定） ---

function PolygonForm({ points, addConstraint }: { points: string[]; addConstraint: (c: any) => void }) {
  const [vertices, setVertices] = useState<string[]>(['', '', '']);
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);

  const submit = () => {
    setError(null);
    const pts = vertices.filter(Boolean);
    if (pts.length < 3 || new Set(pts).size !== pts.length) {
      return setError('3つ以上の異なる点を、多角形の周を成す順序で選んでください');
    }
    const v = parseNumericExpression(value);
    if (v === null || v <= 0) return setError('正しい数値を入力してください（例: 12, 3/2, √3）');
    addConstraint({ type: 'area', polygon: pts, value: v });
    setVertices(['', '', '']);
    setValue('');
  };

  return (
    <div style={{ background: 'var(--paper-raised)', border: '1px solid var(--rule)', borderRadius: 6, padding: 10 }}>
      <p style={{ fontSize: 11, color: 'var(--ink-soft)', margin: '0 0 6px' }}>
        頂点を多角形の周を成す順序で選んでください（面積の条件のみ指定可能）
      </p>
      <FormRow>
        {vertices.map((v, i) => (
          <PointSelect
            key={i}
            points={points}
            value={v}
            onChange={(nv) => {
              const copy = [...vertices];
              copy[i] = nv;
              setVertices(copy);
            }}
            label={`頂点${i + 1}`}
          />
        ))}
        <button
          onClick={() => setVertices([...vertices, ''])}
          style={{ border: '1px dashed var(--rule)', background: 'none', borderRadius: 4, padding: '4px 8px', fontSize: 12, cursor: 'pointer', color: 'var(--ink-soft)', alignSelf: 'flex-end' }}
        >
          + 頂点を追加
        </button>
      </FormRow>
      <FormRow>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 2, fontSize: 12, color: 'var(--ink-soft)' }}>
          面積の値
          <input value={value} onChange={(e) => setValue(e.target.value)} placeholder="例: 12, 3/2, √3" style={{ padding: '4px 6px', border: '1px solid var(--rule)', borderRadius: 4, fontSize: 13, width: 100 }} />
        </label>
      </FormRow>
      {error && <p style={{ color: 'var(--seal)', fontSize: 12 }}>{error}</p>}
>>>>>>> 30dca02bd58e331c72bf234f5087adfda38e9ffb
      <SubmitButton onClick={submit} />
    </div>
  );
}

// --- 高度な幾何カテゴリ（Version4: 相似・合同・接円・方べき・調和共役） ---

function AdvancedForm({ points, addConstraint }: { points: string[]; addConstraint: (c: any) => void }) {
  const [kind, setKind] = useState<
<<<<<<< HEAD
    'similarTriangles' | 'congruentTriangles' | 'incircleTangentPoint' | 'powerOfPoint' | 'harmonicConjugate'
=======
    | 'similarTriangles'
    | 'congruentTriangles'
    | 'incircleTangentPoint'
    | 'powerOfPoint'
    | 'harmonicConjugate'
    | 'reflection'
    | 'pointOutsidePolygon'
    | 'pointOutsideCircle'
>>>>>>> 30dca02bd58e331c72bf234f5087adfda38e9ffb
  >('similarTriangles');
  const [error, setError] = useState<string | null>(null);

  // 相似・合同用
  const [t1a, setT1a] = useState(''); const [t1b, setT1b] = useState(''); const [t1c, setT1c] = useState('');
  const [t2a, setT2a] = useState(''); const [t2b, setT2b] = useState(''); const [t2c, setT2c] = useState('');

  // 接円用
  const [tanPoint, setTanPoint] = useState('');
  const [triA, setTriA] = useState(''); const [triB, setTriB] = useState(''); const [triC, setTriC] = useState('');
  const [sideA, setSideA] = useState(''); const [sideB, setSideB] = useState('');

  // 方べき用
  const [powPoint, setPowPoint] = useState('');
  const [powCenter, setPowCenter] = useState('');
  const [powRadius, setPowRadius] = useState('');
  const [powL1, setPowL1] = useState('');
  const [powL2, setPowL2] = useState('');

  // 調和共役用
  const [hA, setHA] = useState(''); const [hB, setHB] = useState(''); const [hC, setHC] = useState(''); const [hD, setHD] = useState('');

<<<<<<< HEAD
=======
  // 線対称用
  const [reflP1, setReflP1] = useState('');
  const [reflP2, setReflP2] = useState('');
  const [reflAxisA, setReflAxisA] = useState('');
  const [reflAxisB, setReflAxisB] = useState('');

  // 図形の外にある（多角形）用
  const [outPoint, setOutPoint] = useState('');
  const [outPolygon, setOutPolygon] = useState<string[]>(['', '', '']);

  // 円の外にある用
  const [outCirclePoint, setOutCirclePoint] = useState('');
  const [outCircleCenter, setOutCircleCenter] = useState('');
  const [outCircleRadius, setOutCircleRadius] = useState('');

>>>>>>> 30dca02bd58e331c72bf234f5087adfda38e9ffb
  const resetAll = () => {
    setT1a(''); setT1b(''); setT1c(''); setT2a(''); setT2b(''); setT2c('');
    setTanPoint(''); setTriA(''); setTriB(''); setTriC(''); setSideA(''); setSideB('');
    setPowPoint(''); setPowCenter(''); setPowRadius(''); setPowL1(''); setPowL2('');
    setHA(''); setHB(''); setHC(''); setHD('');
<<<<<<< HEAD
=======
    setReflP1(''); setReflP2(''); setReflAxisA(''); setReflAxisB('');
    setOutPoint(''); setOutPolygon(['', '', '']);
    setOutCirclePoint(''); setOutCircleCenter(''); setOutCircleRadius('');
>>>>>>> 30dca02bd58e331c72bf234f5087adfda38e9ffb
  };

  const submit = () => {
    setError(null);
    if (kind === 'similarTriangles' || kind === 'congruentTriangles') {
      const tri1 = [t1a, t1b, t1c];
      const tri2 = [t2a, t2b, t2c];
      if (tri1.some((v) => !v) || tri2.some((v) => !v) || new Set(tri1).size !== 3 || new Set(tri2).size !== 3) {
        return setError('2つの三角形をそれぞれ3つの異なる点で指定してください（対応する頂点順で）');
      }
      addConstraint({ type: kind, triangle1: tri1, triangle2: tri2 });
    } else if (kind === 'incircleTangentPoint') {
      const tri = [triA, triB, triC];
      if (!tanPoint || tri.some((v) => !v) || new Set(tri).size !== 3 || !sideA || !sideB) {
        return setError('接点・三角形の3頂点・接する辺を指定してください');
      }
      addConstraint({ type: 'incircleTangentPoint', point: tanPoint, triangle: tri, side: [sideA, sideB] });
    } else if (kind === 'powerOfPoint') {
      if (!powPoint || !powCenter || !powRadius || !powL1 || !powL2) {
        return setError('点・円（中心と半径点）・直線上の2交点を指定してください');
      }
      addConstraint({
        type: 'powerOfPoint',
        point: powPoint,
        center: powCenter,
        radiusPoint: powRadius,
        linePoint1: powL1,
        linePoint2: powL2,
      });
<<<<<<< HEAD
    } else {
=======
    } else if (kind === 'harmonicConjugate') {
>>>>>>> 30dca02bd58e331c72bf234f5087adfda38e9ffb
      const pts = [hA, hB, hC, hD];
      if (pts.some((v) => !v) || new Set(pts).size !== 4) {
        return setError('4つの異なる点を指定してください（A,B;C,D の順）');
      }
      addConstraint({ type: 'harmonicConjugate', points: pts });
<<<<<<< HEAD
=======
    } else if (kind === 'reflection') {
      if (!reflP1 || !reflP2 || !reflAxisA || !reflAxisB || reflP1 === reflP2 || reflAxisA === reflAxisB) {
        return setError('対称にする2点と、対称の軸となる直線を指定してください');
      }
      addConstraint({ type: 'reflection', point1: reflP1, point2: reflP2, axis: [reflAxisA, reflAxisB] });
    } else if (kind === 'pointOutsidePolygon') {
      const poly = outPolygon.filter(Boolean);
      if (!outPoint || poly.length < 3 || new Set(poly).size !== poly.length || poly.includes(outPoint)) {
        return setError('対象の点と、3つ以上の異なる頂点からなる図形を指定してください');
      }
      addConstraint({ type: 'pointOutsidePolygon', point: outPoint, polygon: poly });
    } else {
      if (!outCirclePoint || !outCircleCenter || !outCircleRadius) {
        return setError('点・円（中心・半径点）を指定してください');
      }
      addConstraint({
        type: 'pointOutsideCircle',
        point: outCirclePoint,
        center: outCircleCenter,
        radiusPoint: outCircleRadius,
      });
>>>>>>> 30dca02bd58e331c72bf234f5087adfda38e9ffb
    }
    resetAll();
  };

  return (
<<<<<<< HEAD
    <div style={{ background: 'var(--panel)', border: '1px solid var(--rule)', borderRadius: 6, padding: 10 }}>
=======
    <div style={{ background: 'var(--paper-raised)', border: '1px solid var(--rule)', borderRadius: 6, padding: 10 }}>
>>>>>>> 30dca02bd58e331c72bf234f5087adfda38e9ffb
      <FormRow>
        <select value={kind} onChange={(e) => setKind(e.target.value as any)} style={{ padding: '4px 6px', fontSize: 13 }}>
          <option value="similarTriangles">相似</option>
          <option value="congruentTriangles">合同</option>
          <option value="incircleTangentPoint">内接円の接点</option>
          <option value="powerOfPoint">方べきの定理</option>
          <option value="harmonicConjugate">調和共役点</option>
<<<<<<< HEAD
=======
          <option value="reflection">線対称</option>
          <option value="pointOutsidePolygon">点が図形の外にある</option>
          <option value="pointOutsideCircle">点が円の外にある</option>
>>>>>>> 30dca02bd58e331c72bf234f5087adfda38e9ffb
        </select>
      </FormRow>

      {(kind === 'similarTriangles' || kind === 'congruentTriangles') && (
        <>
          <p style={{ fontSize: 11, color: 'var(--ink-soft)', margin: '0 0 4px' }}>三角形1（対応順）</p>
          <FormRow>
            <PointSelect points={points} value={t1a} onChange={setT1a} label="点1" />
            <PointSelect points={points} value={t1b} onChange={setT1b} label="点2" />
            <PointSelect points={points} value={t1c} onChange={setT1c} label="点3" />
          </FormRow>
          <p style={{ fontSize: 11, color: 'var(--ink-soft)', margin: '0 0 4px' }}>三角形2（対応順）</p>
          <FormRow>
            <PointSelect points={points} value={t2a} onChange={setT2a} label="点1" />
            <PointSelect points={points} value={t2b} onChange={setT2b} label="点2" />
            <PointSelect points={points} value={t2c} onChange={setT2c} label="点3" />
          </FormRow>
        </>
      )}

      {kind === 'incircleTangentPoint' && (
        <>
          <FormRow>
            <PointSelect points={points} value={tanPoint} onChange={setTanPoint} label="接点" />
          </FormRow>
          <p style={{ fontSize: 11, color: 'var(--ink-soft)', margin: '0 0 4px' }}>三角形の3頂点</p>
          <FormRow>
            <PointSelect points={points} value={triA} onChange={setTriA} label="点1" />
            <PointSelect points={points} value={triB} onChange={setTriB} label="点2" />
            <PointSelect points={points} value={triC} onChange={setTriC} label="点3" />
          </FormRow>
          <p style={{ fontSize: 11, color: 'var(--ink-soft)', margin: '0 0 4px' }}>接する辺</p>
          <FormRow>
            <PointSelect points={points} value={sideA} onChange={setSideA} label="辺 端点1" />
            <PointSelect points={points} value={sideB} onChange={setSideB} label="辺 端点2" />
          </FormRow>
        </>
      )}

      {kind === 'powerOfPoint' && (
        <>
          <FormRow>
            <PointSelect points={points} value={powPoint} onChange={setPowPoint} label="点" />
          </FormRow>
          <p style={{ fontSize: 11, color: 'var(--ink-soft)', margin: '0 0 4px' }}>円（中心・半径点）</p>
          <FormRow>
            <PointSelect points={points} value={powCenter} onChange={setPowCenter} label="中心" />
            <PointSelect points={points} value={powRadius} onChange={setPowRadius} label="半径点" />
          </FormRow>
          <p style={{ fontSize: 11, color: 'var(--ink-soft)', margin: '0 0 4px' }}>点から引いた直線と円の交点2つ</p>
          <FormRow>
            <PointSelect points={points} value={powL1} onChange={setPowL1} label="交点1" />
            <PointSelect points={points} value={powL2} onChange={setPowL2} label="交点2" />
          </FormRow>
        </>
      )}

      {kind === 'harmonicConjugate' && (
        <>
          <p style={{ fontSize: 11, color: 'var(--ink-soft)', margin: '0 0 4px' }}>
            (A, B; C, D) が調和共役になるよう指定
          </p>
          <FormRow>
            <PointSelect points={points} value={hA} onChange={setHA} label="A" />
            <PointSelect points={points} value={hB} onChange={setHB} label="B" />
            <PointSelect points={points} value={hC} onChange={setHC} label="C" />
            <PointSelect points={points} value={hD} onChange={setHD} label="D" />
          </FormRow>
        </>
      )}

<<<<<<< HEAD
      {error && <p style={{ color: 'var(--danger)', fontSize: 12 }}>{error}</p>}
=======
      {kind === 'reflection' && (
        <>
          <p style={{ fontSize: 11, color: 'var(--ink-soft)', margin: '0 0 4px' }}>対称にする2点</p>
          <FormRow>
            <PointSelect points={points} value={reflP1} onChange={setReflP1} label="点1" />
            <PointSelect points={points} value={reflP2} onChange={setReflP2} label="点2" />
          </FormRow>
          <p style={{ fontSize: 11, color: 'var(--ink-soft)', margin: '0 0 4px' }}>対称の軸となる直線</p>
          <FormRow>
            <PointSelect points={points} value={reflAxisA} onChange={setReflAxisA} label="軸 端点1" />
            <PointSelect points={points} value={reflAxisB} onChange={setReflAxisB} label="軸 端点2" />
          </FormRow>
        </>
      )}

      {kind === 'pointOutsidePolygon' && (
        <>
          <FormRow>
            <PointSelect points={points} value={outPoint} onChange={setOutPoint} label="外側にある点" />
          </FormRow>
          <p style={{ fontSize: 11, color: 'var(--ink-soft)', margin: '0 0 4px' }}>
            図形の頂点（周を成す順、3つ以上）
          </p>
          <FormRow>
            {outPolygon.map((v, i) => (
              <PointSelect
                key={i}
                points={points}
                value={v}
                onChange={(nv) => {
                  const copy = [...outPolygon];
                  copy[i] = nv;
                  setOutPolygon(copy);
                }}
                label={`頂点${i + 1}`}
              />
            ))}
            <button
              onClick={() => setOutPolygon([...outPolygon, ''])}
              style={{ border: '1px dashed var(--rule)', background: 'none', borderRadius: 4, padding: '4px 8px', fontSize: 12, cursor: 'pointer', color: 'var(--ink-soft)', alignSelf: 'flex-end' }}
            >
              + 頂点を追加
            </button>
          </FormRow>
        </>
      )}

      {kind === 'pointOutsideCircle' && (
        <>
          <FormRow>
            <PointSelect points={points} value={outCirclePoint} onChange={setOutCirclePoint} label="外側にある点" />
          </FormRow>
          <p style={{ fontSize: 11, color: 'var(--ink-soft)', margin: '0 0 4px' }}>円（中心・半径点）</p>
          <FormRow>
            <PointSelect points={points} value={outCircleCenter} onChange={setOutCircleCenter} label="中心" />
            <PointSelect points={points} value={outCircleRadius} onChange={setOutCircleRadius} label="半径点" />
          </FormRow>
        </>
      )}

      {error && <p style={{ color: 'var(--seal)', fontSize: 12 }}>{error}</p>}
>>>>>>> 30dca02bd58e331c72bf234f5087adfda38e9ffb
      <SubmitButton onClick={submit} />
    </div>
  );
}
