import { useState } from 'react';
import { useAppStore } from '../core/store';
import { parseQuickQuery } from '../core/quickParse';

const EXAMPLES = ['BC', '∠ABC', '△ABC の面積', 'AB : CD'];

export function QueryPanel() {
  const points = useAppStore((s) => s.points);
  const queries = useAppStore((s) => s.queries);
  const addQuery = useAppStore((s) => s.addQuery);
  const removeQuery = useAppStore((s) => s.removeQuery);

  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [exampleIndex, setExampleIndex] = useState(0);

  const pointNames = points.map((p) => p.name);

  const submit = () => {
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
    if (q.type === 'angle') return `∠${q.points.join('')}`;
    if (q.type === 'coordinate') return `${q.point} の座標`;
    if (q.type === 'area') return `${q.polygon.join('')} の面積`;
    if (q.type === 'perimeter') return `${q.polygon.join('')} の周長`;
    if (q.type === 'lengthRatioQuery') return `${q.seg1.join('')} : ${q.seg2.join('')}`;
    return '?';
  };

  return (
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
          margin: '0 0 12px',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        <span
          style={{
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
            >
              ×
            </button>
          </div>
        ))}
      </div>

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
