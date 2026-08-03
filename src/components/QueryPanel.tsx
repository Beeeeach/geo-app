import { useState } from 'react';
import { useAppStore } from '../core/store';
<<<<<<< HEAD
import type { QueryType } from '../core/store';

const FREE_TEXT_PRESETS: { label: string; insert: string }[] = [
  { label: '長さ', insert: 'の長さ' },
  { label: '角度', insert: 'の角度' },
  { label: '面積', insert: 'の面積' },
  { label: '周長', insert: 'の周長' },
  { label: '比', insert: 'の比' },
  { label: '座標', insert: 'の座標' },
];
=======
import { parseQuickQuery } from '../core/quickParse';

const EXAMPLES = ['BC', '∠ABC', '△ABC の面積', 'AB : CD'];
>>>>>>> 30dca02bd58e331c72bf234f5087adfda38e9ffb

export function QueryPanel() {
  const points = useAppStore((s) => s.points);
  const queries = useAppStore((s) => s.queries);
  const addQuery = useAppStore((s) => s.addQuery);
  const removeQuery = useAppStore((s) => s.removeQuery);

<<<<<<< HEAD
  const [type, setType] = useState<QueryType>('length');
  const [a, setA] = useState('');
  const [b, setB] = useState('');
  const [c, setC] = useState('');
  const [polygon, setPolygon] = useState<string[]>(['', '', '']);
  const [ratioA1, setRatioA1] = useState('');
  const [ratioB1, setRatioB1] = useState('');
  const [ratioA2, setRatioA2] = useState('');
  const [ratioB2, setRatioB2] = useState('');
  const [error, setError] = useState<string | null>(null);

  // 詳しく指定する（自由記述メモ）欄。計算には使わないが、
  // 「何を求めたいか」を自分の言葉で書き残せるようにするための補助入力。
  const [freeText, setFreeText] = useState('');
=======
  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [exampleIndex, setExampleIndex] = useState(0);
>>>>>>> 30dca02bd58e331c72bf234f5087adfda38e9ffb

  const pointNames = points.map((p) => p.name);

  const submit = () => {
<<<<<<< HEAD
    setError(null);
    if (type === 'length') {
      if (!a || !b || a === b) return setError('2つの異なる点を選んでください');
      addQuery({ type: 'length', segment: [a, b] });
    } else if (type === 'angle') {
      if (!a || !b || !c || a === b || b === c || a === c) return setError('3つの異なる点を選んでください');
      addQuery({ type: 'angle', points: [a, b, c] });
    } else if (type === 'coordinate') {
      if (!a) return setError('点を選んでください');
      addQuery({ type: 'coordinate', point: a });
    } else if (type === 'area' || type === 'perimeter') {
      const pts = polygon.filter(Boolean);
      if (pts.length < 3 || new Set(pts).size !== pts.length) return setError('3つ以上の異なる点を選んでください');
      addQuery({ type, polygon: pts });
    } else {
      if (!ratioA1 || !ratioB1 || !ratioA2 || !ratioB2 || ratioA1 === ratioB1 || ratioA2 === ratioB2) {
        return setError('2つの線分を正しく選んでください');
      }
      addQuery({ type: 'lengthRatioQuery', seg1: [ratioA1, ratioB1], seg2: [ratioA2, ratioB2] });
    }
    setA(''); setB(''); setC('');
    setPolygon(['', '', '']);
    setRatioA1(''); setRatioB1(''); setRatioA2(''); setRatioB2('');
  };

  const label = (q: any) => {
    if (q.type === 'length') return `${q.segment.join('')} の長さ`;
=======
    if (!input.trim()) return;
    setError(null);

    if (pointNames.length === 0) {
      setError('先に点を追加してください');
      return;
    }

    const result = parseQuickQuery(input, pointNames);
    if (!result) {
      setError('うまく読み取れませんでした。例: BC / ∠ABC / △ABCの面積');
      return;
    }

    addQuery(result.query);
    setInput('');
    setExampleIndex((i) => (i + 1) % EXAMPLES.length);
  };

  const label = (q: any) => {
    if (q.type === 'length') return `${q.segment.join('')}`;
>>>>>>> 30dca02bd58e331c72bf234f5087adfda38e9ffb
    if (q.type === 'angle') return `∠${q.points.join('')}`;
    if (q.type === 'coordinate') return `${q.point} の座標`;
    if (q.type === 'area') return `${q.polygon.join('')} の面積`;
    if (q.type === 'perimeter') return `${q.polygon.join('')} の周長`;
<<<<<<< HEAD
    if (q.type === 'lengthRatioQuery') return `${q.seg1.join('')} : ${q.seg2.join('')} の比`;
=======
    if (q.type === 'lengthRatioQuery') return `${q.seg1.join('')} : ${q.seg2.join('')}`;
>>>>>>> 30dca02bd58e331c72bf234f5087adfda38e9ffb
    return '?';
  };

  return (
<<<<<<< HEAD
    <section style={{ padding: '18px 18px 24px' }}>
      <h2
        style={{
          fontSize: 13,
          letterSpacing: '0.04em',
          color: 'var(--ink)',
          fontWeight: 800,
=======
    <section
      style={{
        padding: '18px 22px',
        borderBottom: '1px solid var(--rule)',
      }}
    >
      <h2
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 13,
          fontWeight: 700,
          color: 'var(--ink)',
>>>>>>> 30dca02bd58e331c72bf234f5087adfda38e9ffb
          margin: '0 0 12px',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        <span
          style={{
<<<<<<< HEAD
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
          3
        </span>
        求めたいもの
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 12 }}>
        {queries.length === 0 && (
          <p style={{ color: 'var(--ink-soft)', fontSize: 13, margin: 0, background: 'var(--rule-soft)', padding: '10px 12px', borderRadius: 6 }}>
=======
            display: 'inline-block',
            width: 4,
            height: 14,
            background: 'var(--warn)',
            borderRadius: 2,
          }}
        />
        求めたいもの
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 12 }}>
        {queries.length === 0 && (
          <p style={{ color: 'var(--ink-faint)', fontSize: 12.5, margin: 0, fontStyle: 'italic' }}>
>>>>>>> 30dca02bd58e331c72bf234f5087adfda38e9ffb
            まだありません。
          </p>
        )}
        {queries.map((q) => (
          <div
            key={q.id}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
<<<<<<< HEAD
              background: 'var(--panel)',
              border: '1px solid var(--rule)',
              borderRadius: 5,
              padding: '5px 8px',
              fontSize: 13,
              fontFamily: 'var(--font-mono)',
            }}
          >
            <span>{label(q)}</span>
            <button
              onClick={() => removeQuery(q.id)}
              style={{ border: 'none', background: 'transparent', color: 'var(--ink-soft)', cursor: 'pointer', fontSize: 14 }}
=======
              background: 'var(--paper-raised)',
              border: '1px solid var(--rule-soft)',
              borderLeft: '3px solid var(--warn)',
              borderRadius: '2px 5px 5px 2px',
              padding: '6px 10px 6px 12px',
            }}
          >
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 14, color: 'var(--ink)' }}>
              {label(q)}
            </span>
            <button
              onClick={() => removeQuery(q.id)}
              style={{ border: 'none', background: 'transparent', color: 'var(--ink-faint)', cursor: 'pointer', fontSize: 15 }}
>>>>>>> 30dca02bd58e331c72bf234f5087adfda38e9ffb
            >
              ×
            </button>
          </div>
        ))}
      </div>

<<<<<<< HEAD
      {pointNames.length === 0 ? (
        <p style={{ color: 'var(--ink-soft)', fontSize: 12 }}>先に点を追加してください。</p>
      ) : (
        <div style={{ background: 'var(--panel)', border: '1px solid var(--rule)', borderRadius: 6, padding: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
            <span style={{ fontSize: 10, color: 'var(--ink-soft)', whiteSpace: 'nowrap' }}>パレットで選ぶ</span>
            <div style={{ height: 1, background: 'var(--rule-soft)', flex: 1 }} />
          </div>

          <div style={{ marginBottom: 8 }}>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as QueryType)}
              style={{ padding: '4px 6px', fontSize: 13 }}
            >
              <option value="length">長さ</option>
              <option value="angle">角度</option>
              <option value="coordinate">座標</option>
              <option value="area">面積</option>
              <option value="perimeter">周長</option>
              <option value="lengthRatioQuery">比</option>
            </select>
          </div>

          {(type === 'length' || type === 'angle' || type === 'coordinate') && (
            <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
              <PointSelectMini label={type === 'coordinate' ? '点' : type === 'angle' ? '点1' : '始点'} value={a} onChange={setA} points={pointNames} />
              {type !== 'coordinate' && (
                <PointSelectMini label={type === 'angle' ? '頂点' : '終点'} value={b} onChange={setB} points={pointNames} />
              )}
              {type === 'angle' && <PointSelectMini label="点3" value={c} onChange={setC} points={pointNames} />}
            </div>
          )}

          {(type === 'area' || type === 'perimeter') && (
            <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
              {polygon.map((v, i) => (
                <PointSelectMini
                  key={i}
                  label={`頂点${i + 1}`}
                  value={v}
                  onChange={(nv) => {
                    const copy = [...polygon];
                    copy[i] = nv;
                    setPolygon(copy);
                  }}
                  points={pointNames}
                />
              ))}
              <button
                onClick={() => setPolygon([...polygon, ''])}
                style={{ border: '1px dashed var(--rule)', background: 'none', borderRadius: 4, padding: '4px 8px', fontSize: 12, cursor: 'pointer', color: 'var(--ink-soft)', alignSelf: 'flex-end' }}
              >
                + 頂点を追加
              </button>
            </div>
          )}

          {type === 'lengthRatioQuery' && (
            <div style={{ marginBottom: 8 }}>
              <div style={{ display: 'flex', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                <PointSelectMini label="線分1 始点" value={ratioA1} onChange={setRatioA1} points={pointNames} />
                <PointSelectMini label="線分1 終点" value={ratioB1} onChange={setRatioB1} points={pointNames} />
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <PointSelectMini label="線分2 始点" value={ratioA2} onChange={setRatioA2} points={pointNames} />
                <PointSelectMini label="線分2 終点" value={ratioB2} onChange={setRatioB2} points={pointNames} />
              </div>
            </div>
          )}

          {error && <p style={{ color: 'var(--danger)', fontSize: 12 }}>{error}</p>}

          <button
            onClick={submit}
            style={{
              padding: '6px 14px',
              border: 'none',
              borderRadius: 5,
              background: 'var(--accent)',
              color: 'white',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              marginBottom: 12,
            }}
          >
            追加
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
            <span style={{ fontSize: 10, color: 'var(--ink-soft)', whiteSpace: 'nowrap' }}>詳しく指定する</span>
            <div style={{ height: 1, background: 'var(--rule-soft)', flex: 1 }} />
          </div>
          <p style={{ fontSize: 11, color: 'var(--ink-soft)', margin: '0 0 6px' }}>
            計算には使われませんが、求めたい内容を自分の言葉でメモできます。下のボタンを押すと定型文が挿入されます。
          </p>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 6 }}>
            {FREE_TEXT_PRESETS.map((p) => (
              <button
                key={p.label}
                onClick={() => setFreeText((prev) => (prev ? `${prev}${p.insert}` : `${p.insert}`))}
                style={{
                  padding: '3px 9px',
                  borderRadius: 4,
                  border: '1px solid var(--rule)',
                  background: 'var(--panel)',
                  fontSize: 12,
                  cursor: 'pointer',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                {p.label}
              </button>
            ))}
          </div>
          <textarea
            value={freeText}
            onChange={(e) => setFreeText(e.target.value)}
            placeholder="例: ∠BDE の角度 を求める"
            rows={2}
            style={{
              width: '100%',
              padding: '6px 8px',
              border: '1px solid var(--rule)',
              borderRadius: 4,
              fontSize: 13,
              fontFamily: 'var(--font-mono)',
              resize: 'vertical',
            }}
          />
        </div>
      )}
    </section>
  );
}

function PointSelectMini({
  label,
  value,
  onChange,
  points,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  points: string[];
}) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 2, fontSize: 12, color: 'var(--ink-soft)' }}>
      {label}
      <select value={value} onChange={(e) => onChange(e.target.value)} style={{ padding: '4px 6px', border: '1px solid var(--rule)', borderRadius: 4, fontSize: 13 }}>
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
=======
      <div style={{ display: 'flex', gap: 6 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          placeholder={EXAMPLES[exampleIndex]}
          style={{
            flex: 1,
            padding: '8px 12px',
            border: `1.5px solid ${error ? 'var(--seal)' : 'var(--rule)'}`,
            borderRadius: 6,
            fontSize: 14,
            fontFamily: 'var(--font-display)',
            background: 'var(--paper-raised)',
          }}
        />
        <button
          onClick={submit}
          style={{
            padding: '8px 16px',
            border: 'none',
            borderRadius: 5,
            background: 'var(--warn)',
            color: 'white',
            fontSize: 12.5,
            fontWeight: 500,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          尋ねる
        </button>
      </div>
      {error && <p style={{ color: 'var(--seal)', fontSize: 12, marginTop: 8 }}>{error}</p>}
    </section>
  );
}
>>>>>>> 30dca02bd58e331c72bf234f5087adfda38e9ffb
