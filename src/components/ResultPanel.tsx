import { useAppStore } from '../core/store';

export function ResultPanel() {
  const solveStatus = useAppStore((s) => s.solveStatus);
  const queryResults = useAppStore((s) => s.queryResults);
  const runSolve = useAppStore((s) => s.runSolve);
  const points = useAppStore((s) => s.points);

  return (
<<<<<<< HEAD
    <div style={{ marginTop: 18, width: '100%', maxWidth: 600, marginInline: 'auto' }}>
=======
    <div style={{ marginTop: 20, width: '100%', maxWidth: 620, marginInline: 'auto' }}>
>>>>>>> 30dca02bd58e331c72bf234f5087adfda38e9ffb
      <button
        onClick={runSolve}
        disabled={points.length === 0}
        style={{
          width: '100%',
          padding: '13px',
          border: 'none',
          borderRadius: 8,
<<<<<<< HEAD
          background: points.length === 0 ? 'var(--rule)' : 'var(--accent)',
          color: 'white',
          fontSize: 15,
          fontWeight: 700,
          letterSpacing: '0.02em',
          cursor: points.length === 0 ? 'not-allowed' : 'pointer',
          marginBottom: 14,
          boxShadow: points.length === 0 ? 'none' : '0 2px 8px rgba(43,93,140,0.25)',
        }}
      >
        ✏️ 作図する
      </button>

      {solveStatus === 'underdetermined' && (
        <Banner tone="warn">
          条件が不足しています。代表解を表示しています。
        </Banner>
      )}
      {solveStatus === 'contradiction' && (
        <Banner tone="danger">
          条件が矛盾しているため図形を生成できません。数値や点の位置関係を見直してください。
=======
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
>>>>>>> 30dca02bd58e331c72bf234f5087adfda38e9ffb
        </Banner>
      )}

      {queryResults.length > 0 && (
        <div
          style={{
<<<<<<< HEAD
            background: 'var(--panel)',
            border: '1px solid var(--rule)',
            borderRadius: 10,
            padding: '14px 18px',
            boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
=======
            background: 'var(--paper-raised)',
            border: '1px solid var(--rule)',
            borderRadius: 10,
            padding: '16px 20px',
>>>>>>> 30dca02bd58e331c72bf234f5087adfda38e9ffb
          }}
        >
          <h3
            style={{
<<<<<<< HEAD
              fontSize: 12,
              letterSpacing: '0.04em',
              color: 'var(--ink)',
              fontWeight: 800,
=======
              fontFamily: 'var(--font-display)',
              fontSize: 13,
              fontWeight: 700,
              color: 'var(--ink)',
>>>>>>> 30dca02bd58e331c72bf234f5087adfda38e9ffb
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
<<<<<<< HEAD
                  alignItems: 'center',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 14,
                  padding: '6px 10px',
                  background: 'var(--accent-soft)',
                  borderRadius: 6,
                }}
              >
                <span style={{ color: 'var(--ink-soft)' }}>{r.label}</span>
                <span style={{ fontWeight: 700, color: 'var(--accent)', fontSize: 15 }}>{r.value}</span>
=======
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
>>>>>>> 30dca02bd58e331c72bf234f5087adfda38e9ffb
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

<<<<<<< HEAD
function Banner({ tone, children }: { tone: 'warn' | 'danger'; children: React.ReactNode }) {
  const bg = tone === 'danger' ? 'var(--danger-soft)' : '#f6efe1';
  const color = tone === 'danger' ? 'var(--danger)' : '#8a6a1f';
=======
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
>>>>>>> 30dca02bd58e331c72bf234f5087adfda38e9ffb
  return (
    <div
      style={{
        background: bg,
<<<<<<< HEAD
        color,
        border: `1px solid ${color}33`,
        borderRadius: 8,
        padding: '11px 15px',
        fontSize: 13,
        marginBottom: 14,
        fontWeight: 500,
      }}
    >
      {children}
=======
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
>>>>>>> 30dca02bd58e331c72bf234f5087adfda38e9ffb
    </div>
  );
}
