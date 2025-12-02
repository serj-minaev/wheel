import { useState, useEffect } from 'react';
import { ListView } from './components/ListView';
import { CanvasView } from './components/CanvasView';
import { useWheelData } from './hooks/useWheelData';

type ViewMode = 'list' | 'canvas';

// Иконка импорта (стрелка вниз)
const ImportIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

// Иконка экспорта (стрелка вверх)
const ExportIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

function App() {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const { exportData, importData } = useWheelData();
  const [isMobile, setIsMobile] = useState<boolean>(false);

  // Определение мобильного устройства
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
          padding: isMobile ? '8px 12px' : '12px 20px',
          borderBottom: '2px solid #e0e0e0',
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          justifyContent: 'space-between',
          alignItems: isMobile ? 'stretch' : 'center',
          gap: isMobile ? '8px' : '0',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        }}
      >
        <h2 style={{ 
          margin: 0, 
          fontSize: isMobile ? '16px' : '20px', 
          color: '#333',
          textAlign: isMobile ? 'center' : 'left',
        }}>
          Колесо жизненного баланса
        </h2>

        <div style={{ 
          display: 'flex', 
          gap: isMobile ? '8px' : '12px', 
          alignItems: 'center',
          justifyContent: isMobile ? 'center' : 'flex-end',
          flexWrap: 'wrap',
        }}>
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
                padding: isMobile ? '6px 12px' : '8px 16px',
                border: 'none',
                borderRadius: '6px',
                background: viewMode === 'list' ? '#333' : 'transparent',
                color: viewMode === 'list' ? '#fff' : '#333',
                cursor: 'pointer',
                fontWeight: viewMode === 'list' ? 'bold' : 'normal',
                transition: 'all 0.2s',
                fontSize: isMobile ? '12px' : '14px',
              }}
            >
              Список
            </button>
            <button
              onClick={() => setViewMode('canvas')}
              style={{
                padding: isMobile ? '6px 12px' : '8px 16px',
                border: 'none',
                borderRadius: '6px',
                background: viewMode === 'canvas' ? '#333' : 'transparent',
                color: viewMode === 'canvas' ? '#fff' : '#333',
                cursor: 'pointer',
                fontWeight: viewMode === 'canvas' ? 'bold' : 'normal',
                transition: 'all 0.2s',
                fontSize: isMobile ? '12px' : '14px',
              }}
            >
              Канвас
            </button>
          </div>

          {/* Импорт/Экспорт */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <label
              style={{
                padding: isMobile ? '8px' : '8px 12px',
                background: '#4CAF50',
                color: '#fff',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: isMobile ? '44px' : 'auto',
                minHeight: '44px',
              }}
              title="Импорт"
            >
              <ImportIcon />
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
                padding: isMobile ? '8px' : '8px 12px',
                background: '#2196F3',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: isMobile ? '44px' : 'auto',
                minHeight: '44px',
              }}
              title="Экспорт"
            >
              <ExportIcon />
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

