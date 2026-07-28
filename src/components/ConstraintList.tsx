import { useState } from 'react';
import { useAppStore } from '../core/store';
import { constraintLabel } from '../core/constraintLabel';
import { ConstraintPanel } from './ConstraintPanel';

export function ConstraintList() {
  const constraints = useAppStore((s) => s.constraints);
  const removeConstraint = useAppStore((s) => s.removeConstraint);
  const [showAdvanced, setShowAdvanced] = useState(false);

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
            background: 'var(--ok)',
            borderRadius: 2,
          }}
        />
        条件
        <span style={{ fontFamily: 'var(--font-ui)', fontWeight: 400, color: 'var(--ink-faint)', fontSize: 12 }}>
          ({constraints.length})
        </span>
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 10 }}>
        {constraints.length === 0 && (
          <p style={{ color: 'var(--ink-faint)', fontSize: 12.5, margin: 0, fontStyle: 'italic' }}>
            条件はまだありません。
          </p>
        )}
        {constraints.map((c, i) => (
          <div
            key={c.id}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'var(--paper-raised)',
              border: '1px solid var(--rule-soft)',
              borderLeft: '3px solid var(--ok)',
              borderRadius: '2px 5px 5px 2px',
              padding: '6px 10px 6px 12px',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 14,
                color: 'var(--ink)',
              }}
            >
              <span style={{ color: 'var(--ink-faint)', fontFamily: 'var(--font-mono)', fontSize: 11, marginRight: 8 }}>
                {i + 1}
              </span>
              {constraintLabel(c)}
            </span>
            <button
              onClick={() => removeConstraint(c.id)}
              style={{
                border: 'none',
                background: 'transparent',
                color: 'var(--ink-faint)',
                cursor: 'pointer',
                fontSize: 15,
                flexShrink: 0,
                marginLeft: 8,
              }}
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={() => setShowAdvanced((v) => !v)}
        style={{
          border: 'none',
          background: 'none',
          color: 'var(--pen)',
          fontSize: 12.5,
          fontWeight: 500,
          cursor: 'pointer',
          padding: '4px 0',
          display: 'flex',
          alignItems: 'center',
          gap: 4,
        }}
      >
        {showAdvanced ? '▾' : '▸'} 詳しく指定する（カテゴリから選ぶ）
      </button>

      {showAdvanced && (
        <div style={{ marginTop: 10 }}>
          <ConstraintPanel />
        </div>
      )}
    </section>
  );
}
