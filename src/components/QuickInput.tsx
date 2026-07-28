import { useState, useMemo } from 'react';
import { useAppStore } from '../core/store';
import { parseQuickConstraint } from '../core/quickParse';
import { InputHelp } from './InputHelp';

// 入力途中の点名から、それらしいテンプレート候補を提示する
function buildTemplates(points: string[]): { label: string; template: string }[] {
  if (points.length < 2) return [];
  const [a, b] = points;
  const c = points[2];
  const templates: { label: string; template: string }[] = [
    { label: '長さ', template: `${a}${b} = ` },
    { label: '長さが等しい', template: `${a}${b} = ` },
    { label: '長さの比', template: `${a}${b} : ` },
  ];
  if (c) {
    templates.push({ label: '角度', template: `∠${a}${b}${c} = ` });
  }
  templates.push(
    { label: '平行', template: `${a}${b} ∥ ` },
    { label: '垂直', template: `${a}${b} ⊥ ` }
  );
  return templates;
}

const EXAMPLES = [
  'AB = 5',
  'AB = AC',
  '∠ABC = 60',
  'AB ∥ CD',
  'M は BC の中点',
  '△ABC は正三角形',
  'G は △ABC の重心',
];

export function QuickInput() {
  const points = useAppStore((s) => s.points);
  const addConstraint = useAppStore((s) => s.addConstraint);

  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [lastAdded, setLastAdded] = useState<string | null>(null);
  const [exampleIndex, setExampleIndex] = useState(0);

  const pointNames = useMemo(() => points.map((p) => p.name), [points]);
  const templates = useMemo(() => buildTemplates(pointNames), [pointNames]);

  const applyTemplate = (template: string) => {
    setInput(template);
    setError(null);
  };

  const submit = () => {
    if (!input.trim()) return;
    setError(null);

    if (pointNames.length === 0) {
      setError('先に点を追加してください');
      return;
    }

    const result = parseQuickConstraint(input, pointNames);
    if (!result) {
      setError('うまく読み取れませんでした。下の入力例を参考にしてください。');
      return;
    }

    for (const c of result.constraints) {
      addConstraint(c);
    }
    setLastAdded(result.normalized);
    setInput('');
    setExampleIndex((i) => (i + 1) % EXAMPLES.length);
    window.setTimeout(() => setLastAdded(null), 2200);
  };

  return (
    <section
      style={{
        padding: '18px 22px',
        borderBottom: '1px solid var(--rule)',
        background: 'var(--paper-raised)',
      }}
    >
      <h2
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 13,
          fontWeight: 700,
          color: 'var(--ink)',
          margin: '0 0 10px',
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
            background: 'var(--pen)',
            borderRadius: 2,
          }}
        />
        条件を書き込む
      </h2>

      <div style={{ position: 'relative' }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          placeholder={EXAMPLES[exampleIndex]}
          style={{
            width: '100%',
            padding: '10px 14px',
            border: `1.5px solid ${error ? 'var(--seal)' : 'var(--pen)'}`,
            borderRadius: 6,
            fontSize: 15,
            fontFamily: 'var(--font-display)',
            background: 'var(--paper)',
            outline: 'none',
          }}
        />
      </div>

      {templates.length > 0 && (
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginTop: 8 }}>
          {templates.map((t) => (
            <button
              key={t.label}
              onClick={() => applyTemplate(t.template)}
              style={{
                padding: '3px 9px',
                border: '1px solid var(--rule)',
                borderRadius: 4,
                background: 'var(--paper)',
                color: 'var(--ink-soft)',
                fontSize: 11.5,
                cursor: 'pointer',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
        <p style={{ fontSize: 11.5, color: 'var(--ink-faint)', margin: 0 }}>
          例: {EXAMPLES.slice(0, 3).join(' / ')}
        </p>
        <button
          onClick={submit}
          style={{
            padding: '6px 14px',
            border: 'none',
            borderRadius: 5,
            background: 'var(--pen)',
            color: 'white',
            fontSize: 12.5,
            fontWeight: 500,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          書き込む
        </button>
      </div>

      {error && (
        <p style={{ color: 'var(--seal)', fontSize: 12, marginTop: 8 }}>{error}</p>
      )}
      {lastAdded && (
        <p
          style={{
            color: 'var(--ok)',
            fontSize: 12.5,
            marginTop: 8,
            fontFamily: 'var(--font-display)',
          }}
        >
          ✓ {lastAdded} を追加しました
        </p>
      )}

      <InputHelp />
    </section>
  );
}
