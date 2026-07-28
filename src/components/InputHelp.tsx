import { useState } from 'react';

interface HelpSection {
  title: string;
  rows: { input: string; meaning: string }[];
}

const CONSTRAINT_SECTIONS: HelpSection[] = [
  {
    title: '長さ',
    rows: [
      { input: 'AB = 5', meaning: '線分ABの長さを5にする' },
      { input: 'AB = AC', meaning: '線分ABとACの長さを等しくする' },
      { input: 'AB = BC = CD', meaning: '3本以上の線分をまとめて等しくする' },
      { input: 'AB : CD = 2 : 1', meaning: '線分ABとCDの長さの比を2:1にする' },
    ],
  },
  {
    title: '角度',
    rows: [
      { input: '∠ABC = 60', meaning: '角ABC（Bが頂点）を60°にする' },
      { input: '∠ABC = ∠DEF', meaning: '2つの角を等しくする' },
      { input: '∠ABC : ∠DEF = 2 : 1', meaning: '2つの角の比を指定する' },
    ],
  },
  {
    title: '直線・位置関係',
    rows: [
      { input: 'AB ∥ CD', meaning: '線分ABとCDを平行にする（∥は「へいこう」で変換候補に出ます）' },
      { input: 'AB ⊥ CD', meaning: '線分ABとCDを垂直にする（⊥は「すいちょく」で変換候補に出ます）' },
      { input: 'A, B, C は同一直線上', meaning: '3点以上が一直線に並ぶようにする' },
      { input: 'M は BC の中点', meaning: 'Mを線分BCの中点にする' },
      { input: 'D は AB 上', meaning: 'Dを線分AB上（延長線上ではなく内側）に置く' },
    ],
  },
  {
    title: '三角形',
    rows: [
      { input: '△ABC は正三角形', meaning: '3辺すべてが等しい三角形にする' },
      { input: '△ABC は二等辺三角形(A)', meaning: 'Aを頂角とする二等辺三角形にする' },
      { input: '△ABC は直角三角形(B)', meaning: 'Bを直角の頂点にする' },
      { input: 'G は △ABC の重心', meaning: '重心・外心・内心・垂心のいずれも指定可' },
    ],
  },
  {
    title: '四角形・面積',
    rows: [
      { input: '四角形ABCD は平行四辺形', meaning: '長方形・正方形も同様に指定可' },
      { input: '△ABC の面積 = 12', meaning: '三角形や四角形の面積を条件にする' },
    ],
  },
];

const NUMBER_ROWS = [
  { input: '5', meaning: '整数' },
  { input: '3/2', meaning: '分数（1.5として扱われる）' },
  { input: '√3', meaning: 'ルート3（√の後に数字を続けて書く）' },
  { input: '2√5', meaning: '2×√5（数字とルートを続けて書くと掛け算になる）' },
  { input: 'π', meaning: '円周率（角度の入力では自動で度数法に変換）' },
  { input: '3π/4', meaning: '3×π÷4' },
  { input: '√(3+2)', meaning: 'かっこの中身をまとめてルートに入れる' },
];

function CopyableRow({ input, meaning }: { input: string; meaning: string }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'baseline',
        gap: 10,
        padding: '5px 0',
        borderBottom: '1px dotted var(--rule)',
      }}
    >
      <code
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 12.5,
          color: 'var(--pen)',
          background: 'var(--pen-soft)',
          padding: '1px 6px',
          borderRadius: 4,
          whiteSpace: 'nowrap',
          flexShrink: 0,
        }}
      >
        {input}
      </code>
      <span style={{ fontSize: 12, color: 'var(--ink-soft)', lineHeight: 1.5 }}>{meaning}</span>
    </div>
  );
}

export function InputHelp() {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ marginTop: 10 }}>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          border: 'none',
          background: 'none',
          color: 'var(--ink-soft)',
          fontSize: 12,
          cursor: 'pointer',
          padding: '2px 0',
          display: 'flex',
          alignItems: 'center',
          gap: 4,
        }}
      >
        {open ? '▾' : '▸'} 入力方法の詳細
      </button>

      {open && (
        <div
          style={{
            marginTop: 10,
            padding: '14px 16px',
            background: 'var(--paper)',
            border: '1px solid var(--rule)',
            borderRadius: 8,
            maxHeight: 420,
            overflowY: 'auto',
          }}
        >
          <h3
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 13,
              fontWeight: 700,
              margin: '0 0 4px',
              color: 'var(--ink)',
            }}
          >
            数値の書き方
          </h3>
          <p style={{ fontSize: 11.5, color: 'var(--ink-faint)', margin: '0 0 6px' }}>
            長さや角度の値には、整数のほか次の書き方が使えます。
          </p>
          <div style={{ marginBottom: 16 }}>
            {NUMBER_ROWS.map((r) => (
              <CopyableRow key={r.input} {...r} />
            ))}
          </div>

          <h3
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 13,
              fontWeight: 700,
              margin: '0 0 8px',
              color: 'var(--ink)',
            }}
          >
            条件の書き方
          </h3>
          {CONSTRAINT_SECTIONS.map((section) => (
            <div key={section.title} style={{ marginBottom: 14 }}>
              <p
                style={{
                  fontSize: 11.5,
                  fontWeight: 700,
                  color: 'var(--pen)',
                  margin: '0 0 2px',
                }}
              >
                {section.title}
              </p>
              {section.rows.map((r) => (
                <CopyableRow key={r.input} {...r} />
              ))}
            </div>
          ))}

          <p style={{ fontSize: 11, color: 'var(--ink-faint)', margin: '10px 0 0', lineHeight: 1.6 }}>
            ここに載っていない書き方は、下の「詳しく指定する」からカテゴリを選んで入力することもできます。
          </p>
        </div>
      )}
    </div>
  );
}
