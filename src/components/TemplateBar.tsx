import { useAppStore } from '../core/store';
import { TEMPLATES } from '../core/templates';

export function TemplateBar() {
  const loadTemplate = useAppStore((s) => s.loadTemplate);
  const activeTemplateId = useAppStore((s) => s.activeTemplateId);

  return (
    <section style={{ padding: '18px 18px 20px', borderBottom: '8px solid var(--rule-soft)' }}>
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
        <span style={{ fontSize: 15 }}>📝</span>
        お試し問題
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {TEMPLATES.map((t) => (
          <button
            key={t.id}
            onClick={() => loadTemplate(t.id)}
            title={t.description}
            style={{
              textAlign: 'left',
              padding: '10px 12px',
              borderRadius: 8,
              border: `1.5px solid ${activeTemplateId === t.id ? 'var(--accent)' : 'var(--rule)'}`,
              background: activeTemplateId === t.id ? 'var(--accent-soft)' : 'var(--panel)',
              cursor: 'pointer',
              fontSize: 12.5,
              lineHeight: 1.4,
              boxShadow: activeTemplateId === t.id ? 'none' : '0 1px 2px rgba(0,0,0,0.04)',
            }}
          >
            <div style={{ fontWeight: 700, marginBottom: 3, color: activeTemplateId === t.id ? 'var(--accent)' : 'var(--ink)' }}>
              {activeTemplateId === t.id ? '✓ ' : ''}{t.title}
            </div>
            <div
              style={{
                color: 'var(--ink-soft)',
                fontSize: 11.5,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
              }}
            >
              {t.description}
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
