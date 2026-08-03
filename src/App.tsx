<<<<<<< HEAD
import { useEffect, useState } from 'react';
import { PointPanel } from './components/PointPanel';
import { ConstraintPanel } from './components/ConstraintPanel';
import { QueryPanel } from './components/QueryPanel';
import { GeometryCanvas } from './components/GeometryCanvas';
import { ResultPanel } from './components/ResultPanel';
import { TemplateBar } from './components/TemplateBar';
import { MemoPanel } from './components/MemoPanel';
import { useAppStore } from './core/store';

const MOBILE_BREAKPOINT = 900;

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < MOBILE_BREAKPOINT : false
  );
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  return isMobile;
}

function ResetButton() {
  const clearAll = useAppStore((s) => s.clearAll);
  const points = useAppStore((s) => s.points);
  const [confirming, setConfirming] = useState(false);

  if (points.length === 0) return null;

  if (confirming) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ fontSize: 12, color: 'var(--danger)', fontWeight: 600 }}>本当に全部消す？</span>
        <button
          onClick={() => {
            clearAll();
            setConfirming(false);
          }}
          style={{
            border: 'none',
            background: 'var(--danger)',
            color: 'white',
            borderRadius: 6,
            padding: '5px 10px',
            fontSize: 12,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          はい、リセット
        </button>
        <button
          onClick={() => setConfirming(false)}
          style={{
            border: '1px solid var(--rule)',
            background: 'var(--panel)',
            color: 'var(--ink-soft)',
            borderRadius: 6,
            padding: '5px 10px',
            fontSize: 12,
            cursor: 'pointer',
          }}
        >
          やめる
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      title="点・条件・求めたいものをすべて削除して最初からやり直す"
      style={{
        border: '1px solid var(--rule)',
        background: 'var(--panel)',
        color: 'var(--ink-soft)',
        borderRadius: 6,
        padding: '6px 12px',
        fontSize: 12.5,
        fontWeight: 600,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        whiteSpace: 'nowrap',
      }}
    >
      ↺ リセット
    </button>
  );
}

function AppHeader() {
  return (
    <header
      style={{
        padding: '14px 20px',
        borderBottom: '1px solid var(--rule)',
        flexShrink: 0,
        background: 'var(--panel)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 10,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
        <h1 style={{ fontSize: 18, fontWeight: 800, margin: 0, letterSpacing: '-0.01em', color: 'var(--ink)' }}>
          作図ノート
        </h1>
        <p style={{ fontSize: 12.5, color: 'var(--ink-soft)', margin: 0 }}>
          条件を入力すると図形を自動生成します
        </p>
      </div>
      <ResetButton />
    </header>
  );
}

function InputColumn() {
  return (
    <>
      <MemoPanel />
      <TemplateBar />
      <PointPanel />
      <ConstraintPanel />
      <QueryPanel />
    </>
  );
}

function TabButton({
  active,
  onClick,
  label,
  pulse,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  pulse?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={pulse ? 'attention-pulse' : undefined}
      style={{
        flex: 1,
        padding: '11px 8px',
        border: 'none',
        borderBottom: active ? '3px solid var(--accent)' : '3px solid transparent',
        background: 'transparent',
        color: active ? 'var(--accent)' : 'var(--ink-soft)',
        fontSize: 13.5,
        fontWeight: active ? 700 : 500,
        cursor: 'pointer',
        borderRadius: pulse ? 8 : 0,
      }}
    >
      {label}
    </button>
  );
}

function App() {
  const isMobile = useIsMobile();
  const [mobileTab, setMobileTab] = useState<'canvas' | 'input'>('canvas');
  const points = useAppStore((s) => s.points);
  const constraints = useAppStore((s) => s.constraints);

  // 初めて使う人向けの誘導: まだ何も入力していない段階では
  // 「② 条件を入力」タブ自体に気づいてもらう必要があるため点滅させる。
  // 点も条件もある程度揃ったら（自分で操作を始めたら）点滅は消す。
  const shouldGuideToInput = points.length === 0 || (points.length > 0 && constraints.length === 0);

  if (isMobile) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', overflow: 'hidden', background: 'var(--paper)' }}>
        <AppHeader />

        {/* タブ切り替え（隠れて見えない問題を避けるため、明確な2タブ構成にする） */}
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid var(--rule)',
            flexShrink: 0,
            background: 'var(--panel)',
          }}
        >
          <TabButton active={mobileTab === 'canvas'} onClick={() => setMobileTab('canvas')} label="① 作図・結果" />
          <TabButton
            active={mobileTab === 'input'}
            onClick={() => setMobileTab('input')}
            label="② 条件を入力"
            pulse={mobileTab !== 'input' && shouldGuideToInput}
          />
        </div>

        <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
          <div
            style={{
              display: mobileTab === 'canvas' ? 'flex' : 'none',
              flexDirection: 'column',
              height: '100%',
              overflowY: 'auto',
              padding: '18px 16px 28px',
            }}
          >
            <GeometryCanvas />
            <ResultPanel />
            <button
              onClick={() => setMobileTab('input')}
              className={shouldGuideToInput ? 'attention-pulse' : undefined}
              style={{
                marginTop: 16,
                padding: '10px',
                border: '1px dashed var(--rule)',
                borderRadius: 8,
                background: 'var(--accent-soft)',
                color: 'var(--accent)',
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
                maxWidth: 600,
                width: '100%',
                marginInline: 'auto',
              }}
            >
              ＋ 条件を編集する
            </button>
          </div>

          <div
            style={{
              display: mobileTab === 'input' ? 'flex' : 'none',
              flexDirection: 'column',
              height: '100%',
              overflowY: 'auto',
            }}
          >
            <InputColumn />
          </div>
        </div>
      </div>
    );
  }

  // デスクトップ表示：常に条件パネル・作図・結果がすべて見える3カラム構成
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', background: 'var(--paper)' }}>
      <AppHeader />
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* 左：条件入力パネル（常時表示） */}
        <div
          style={{
            width: 380,
            minWidth: 380,
            borderRight: '1px solid var(--rule)',
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto',
            background: 'var(--panel)',
          }}
        >
          <InputColumn />
        </div>

        {/* 右：作図＋結果 */}
        <div
          style={{
            flex: 1,
            padding: '28px 32px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <GeometryCanvas />
          <ResultPanel />
        </div>
=======
import { PointPanel } from './components/PointPanel';
import { QuickInput } from './components/QuickInput';
import { ConstraintList } from './components/ConstraintList';
import { QueryPanel } from './components/QueryPanel';
import { GeometryCanvas } from './components/GeometryCanvas';
import { ResultPanel } from './components/ResultPanel';

function App() {
  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        width: '100vw',
        background: 'var(--paper)',
      }}
    >
      {/* 左パネル：ノート風の入力エリア */}
      <div
        style={{
          width: 380,
          minWidth: 380,
          borderRight: '1px solid var(--rule)',
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
        }}
      >
        <header
          style={{
            padding: '22px 22px 18px',
            borderBottom: '1px solid var(--rule)',
            background: 'var(--paper-raised)',
          }}
        >
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 20,
              fontWeight: 700,
              margin: 0,
              letterSpacing: '0.02em',
              color: 'var(--ink)',
            }}
          >
            作図ノート
          </h1>
          <p
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: 12.5,
              color: 'var(--ink-soft)',
              margin: '5px 0 0',
              lineHeight: 1.5,
            }}
          >
            問題文の条件をそのまま書き込めば、図形を自動で作図します。
          </p>
        </header>

        <PointPanel />
        <QuickInput />
        <ConstraintList />
        <QueryPanel />
      </div>

      {/* 右パネル：図形表示エリア */}
      <div
        style={{
          flex: 1,
          padding: '36px 32px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <GeometryCanvas />
        <ResultPanel />
>>>>>>> 30dca02bd58e331c72bf234f5087adfda38e9ffb
      </div>
    </div>
  );
}

export default App;
