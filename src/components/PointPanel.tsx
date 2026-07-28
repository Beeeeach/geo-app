import { useState } from 'react';
import { useAppStore } from '../core/store';

export function PointPanel() {
  const points = useAppStore((s) => s.points);
  const addPoint = useAppStore((s) => s.addPoint);
  const removePoint = useAppStore((s) => s.removePoint);
  const renamePoint = useAppStore((s) => s.renamePoint);

  const [newName, setNewName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [editingName, setEditingName] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const handleAdd = () => {
    const result = addPoint(newName);
    if (!result.ok) {
      setError(result.error ?? '追加に失敗しました');
      return;
    }
    setNewName('');
    setError(null);
  };

  const startEdit = (name: string) => {
    setEditingName(name);
    setEditValue(name);
    setError(null);
  };

  const commitEdit = () => {
    if (editingName === null) return;
    if (editValue === editingName) {
      setEditingName(null);
      return;
    }
    const result = renamePoint(editingName, editValue);
    if (!result.ok) {
      setError(result.error ?? '変更に失敗しました');
      return;
    }
    setEditingName(null);
    setError(null);
  };

  // よく使う点名を、既に使われていないものだけ候補として出す
  const suggestions = ['A', 'B', 'C', 'D', 'E', 'F', 'M', 'N', 'O', 'P'].filter(
    (n) => !points.some((p) => p.name === n)
  );

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
            background: 'var(--seal)',
            borderRadius: 2,
          }}
        />
        点
      </h2>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginBottom: 12 }}>
        {points.length === 0 && (
          <p style={{ color: 'var(--ink-faint)', fontSize: 12.5, margin: 0, fontStyle: 'italic' }}>
            点を追加して作図を始めましょう。
          </p>
        )}
        {points.map((p) => (
          <div
            key={p.name}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              background: 'var(--paper-raised)',
              border: '1px solid var(--rule)',
              borderRadius: 5,
              padding: '4px 4px 4px 12px',
            }}
          >
            {editingName === p.name ? (
              <input
                autoFocus
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={commitEdit}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') commitEdit();
                  if (e.key === 'Escape') setEditingName(null);
                }}
                style={{
                  width: 56,
                  fontSize: 15,
                  fontFamily: 'var(--font-display)',
                  border: '1px solid var(--pen)',
                  borderRadius: 3,
                  padding: '1px 4px',
                }}
              />
            ) : (
              <span
                onDoubleClick={() => startEdit(p.name)}
                title="ダブルクリックで名前を変更"
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 15.5,
                  fontWeight: 700,
                  cursor: 'text',
                  color: 'var(--ink)',
                }}
              >
                {p.name}
              </span>
            )}
            <button
              onClick={() => removePoint(p.name)}
              title={`${p.name} を削除`}
              style={{
                border: 'none',
                background: 'transparent',
                color: 'var(--ink-faint)',
                cursor: 'pointer',
                fontSize: 15,
                lineHeight: 1,
                padding: '3px 5px',
              }}
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 6 }}>
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          placeholder="点の名前 (例: A)"
          list="point-suggestions"
          style={{
            flex: 1,
            padding: '7px 10px',
            border: '1px solid var(--rule)',
            borderRadius: 5,
            fontSize: 13.5,
            fontFamily: 'var(--font-display)',
            background: 'var(--paper-raised)',
          }}
        />
        <datalist id="point-suggestions">
          {suggestions.map((s) => (
            <option key={s} value={s} />
          ))}
        </datalist>
        <button
          onClick={handleAdd}
          style={{
            padding: '7px 16px',
            border: 'none',
            borderRadius: 5,
            background: 'var(--ink)',
            color: 'var(--paper)',
            fontSize: 13,
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          追加
        </button>
      </div>
      {error && (
        <p style={{ color: 'var(--seal)', fontSize: 12, marginTop: 7 }}>{error}</p>
      )}
    </section>
  );
}
