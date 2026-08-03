import { useState } from 'react';
import { useAppStore } from '../core/store';

/**
 * 問題文全体を貼り付けておくためのメモ欄。
 * 計算には使われないが、入力中に問題文を見返せるようにするための場所。
 * パネルの一番上に置くことで「まずここに問題を貼る」という自然な導線にする。
 */
export function MemoPanel() {
  const memo = useAppStore((s) => s.memo);
  const setMemo = useAppStore((s) => s.setMemo);
  const [collapsed, setCollapsed] = useState(false);

  return (
    <section style={{ padding: '18px 18px 16px', borderBottom: '8px solid var(--rule-soft)', background: '#fbf7ee' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: collapsed ? 0 : 10 }}>
        <h2
          style={{
            fontSize: 13,
            letterSpacing: '0.04em',
            color: 'var(--ink)',
            fontWeight: 800,
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <span style={{ fontSize: 15 }}>📋</span>
          問題文メモ
        </h2>
        <button
          onClick={() => setCollapsed((c) => !c)}
          style={{
            border: 'none',
            background: 'transparent',
            color: 'var(--ink-soft)',
            fontSize: 12,
            cursor: 'pointer',
            padding: '2px 6px',
          }}
        >
          {collapsed ? '開く ▾' : '閉じる ▴'}
        </button>
      </div>

      {!collapsed && (
        <>
          <p style={{ fontSize: 11.5, color: 'var(--ink-soft)', margin: '0 0 8px' }}>
            問題文をそのまま貼り付けておけます。条件を入力しながら見返すのに使ってください（計算には使われません）。
          </p>
          <textarea
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="例: AB=AC, ∠BAC=20°の二等辺三角形ABCがある。辺AB上に点E、辺AC上に点Dをとり…"
            rows={5}
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid var(--rule)',
              borderRadius: 8,
              fontSize: 13,
              lineHeight: 1.6,
              fontFamily: 'var(--font-ui)',
              resize: 'vertical',
              background: 'var(--panel)',
              boxSizing: 'border-box',
            }}
          />
        </>
      )}
    </section>
  );
}
