import { useState } from 'react';
import { ListView } from './components/ListView';
import { CanvasView } from './components/CanvasView';
import { useWheelData } from './hooks/useWheelData';

type ViewMode = 'list' | 'canvas';

function App() {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const { exportData, importData } = useWheelData();

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      importData(file);
    }
    // Сброс input для возможности повторного выбора того же файла
    e.target.value = '';
  };

  return (
    <div style={{ width: '100%', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Навигационная панель */}
      <nav
        style={{
          background: '#fff',
          padding: '12px 20px',
          borderBottom: '2px solid #e0e0e0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        }}
      >
        <h2 style={{ margin: 0, fontSize: '20px', color: '#333' }}>
          Колесо жизненного баланса
        </h2>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {/* Переключение вида */}
          <div
            style={{
              display: 'flex',
              background: '#f0f0f0',
              borderRadius: '8px',
              padding: '4px',
            }}
          >
            <button
              onClick={() => setViewMode('list')}
              style={{
                padding: '8px 16px',
                border: 'none',
                borderRadius: '6px',
                background: viewMode === 'list' ? '#333' : 'transparent',
                color: viewMode === 'list' ? '#fff' : '#333',
                cursor: 'pointer',
                fontWeight: viewMode === 'list' ? 'bold' : 'normal',
                transition: 'all 0.2s',
              }}
            >
              Список
            </button>
            <button
              onClick={() => setViewMode('canvas')}
              style={{
                padding: '8px 16px',
                border: 'none',
                borderRadius: '6px',
                background: viewMode === 'canvas' ? '#333' : 'transparent',
                color: viewMode === 'canvas' ? '#fff' : '#333',
                cursor: 'pointer',
                fontWeight: viewMode === 'canvas' ? 'bold' : 'normal',
                transition: 'all 0.2s',
              }}
            >
              Канвас
            </button>
          </div>

          {/* Импорт/Экспорт */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <label
              style={{
                padding: '8px 16px',
                background: '#4CAF50',
                color: '#fff',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                display: 'inline-block',
              }}
            >
              Импорт
              <input
                type="file"
                accept=".json"
                onChange={handleFileImport}
                style={{ display: 'none' }}
              />
            </label>
            <button
              onClick={exportData}
              style={{
                padding: '8px 16px',
                background: '#2196F3',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
              }}
            >
              Экспорт
            </button>
          </div>
        </div>
      </nav>

      {/* Контент */}
      <main style={{ flex: 1, overflow: 'hidden' }}>
        {viewMode === 'list' ? <ListView /> : <CanvasView />}
      </main>
    </div>
  );
}

export default App;

