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
      </div>
    </div>
  );
}

export default App;
