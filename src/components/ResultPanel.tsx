import { useAppStore } from '../core/store';

export function ResultPanel() {
  const solveStatus = useAppStore((s) => s.solveStatus);
  const queryResults = useAppStore((s) => s.queryResults);
  const runSolve = useAppStore((s) => s.runSolve);
  const points = useAppStore((s) => s.points);

  return (
    <div style={{ marginTop: 20, width: '100%', maxWidth: 620, marginInline: 'auto' }}>
      <button
        onClick={runSolve}
        disabled={points.length === 0}
        style={{
          width: '100%',
          padding: '13px',
          border: 'none',
          borderRadius: 8,
          background: points.length === 0 ? 'var(--rule)' : 'var(--ink)',
          color: 'var(--paper)',
          fontSize: 15,
          fontFamily: 'var(--font-display)',
          fontWeight: 700,
          letterSpacing: '0.04em',
          cursor: points.length === 0 ? 'not-allowed' : 'pointer',
          marginBottom: 16,
          transition: 'transform 0.1s',
        }}
        onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.99)')}
        onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
      >
        作図する
      </button>

      {solveStatus === 'underdetermined_similarOnly' && (
        <Banner tone="warn" title="形は決まるが、大きさが自由です">
          相似な図形は一通りに決まりますが、縮尺（大きさ）を決める条件が不足しています。代表として1つの大きさで表示しています。
        </Banner>
      )}
      {solveStatus === 'underdetermined_shapeVaries' && (
        <Banner tone="warn" title="条件が不足しています">
          形そのものが異なる図形も、この条件を満たし得ます。代表的な解の一つを表示しています。
        </Banner>
      )}
      {solveStatus === 'contradiction' && (
        <Banner tone="danger" title="この図形は作れません">
          条件どうしが矛盾しているため、すべてを満たす図形が存在しません。
        </Banner>
      )}

      {queryResults.length > 0 && (
        <div
          style={{
            background: 'var(--paper-raised)',
            border: '1px solid var(--rule)',
            borderRadius: 10,
            padding: '16px 20px',
          }}
        >
          <h3
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 13,
              fontWeight: 700,
              color: 'var(--ink)',
              margin: '0 0 10px',
            }}
          >
            計算結果
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {queryResults.map((r) => (
              <div
                key={r.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                  borderBottom: '1px dotted var(--rule)',
                  paddingBottom: 6,
                }}
              >
                <span style={{ color: 'var(--ink-soft)', fontFamily: 'var(--font-display)', fontSize: 14.5 }}>
                  {r.label}
                </span>
                <span
                  style={{
                    fontWeight: 700,
                    fontFamily: 'var(--font-mono)',
                    fontSize: 16,
                    color: 'var(--seal)',
                  }}
                >
                  {r.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Banner({
  tone,
  title,
  children,
}: {
  tone: 'warn' | 'danger';
  title: string;
  children: React.ReactNode;
}) {
  const bg = tone === 'danger' ? 'var(--seal-soft)' : 'var(--warn-soft)';
  const color = tone === 'danger' ? 'var(--seal)' : 'var(--warn)';
  return (
    <div
      style={{
        background: bg,
        borderRadius: 8,
        padding: '12px 16px',
        marginBottom: 16,
        borderLeft: `3px solid ${color}`,
      }}
    >
      <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13.5, color, margin: '0 0 3px' }}>
        {title}
      </p>
      <p style={{ fontSize: 13, color: 'var(--ink-soft)', margin: 0, lineHeight: 1.6 }}>{children}</p>
    </div>
  );
}
