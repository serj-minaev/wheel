import { useState, useEffect } from 'react';
import { useWheelData } from '../hooks/useWheelData';
import type { Metric } from '../types/wheel';
import { getSectorColor } from '../utils/wheelCalculations';

interface MetricItemProps {
  metric: Metric;
  level: number;
  path: string[];
  onScoreChange: (path: string[], score: number) => void;
}

function MetricItem({ metric, level, path, onScoreChange }: MetricItemProps) {
  const [isExpanded, setIsExpanded] = useState(level === 0);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(metric.score.toString());
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

  const hasSubWheel = !!metric.subWheel && metric.subWheel.metrics.length > 0;
  const color = getSectorColor(metric.score);

  const handleScoreChange = (newScore: number) => {
    if (newScore >= 0 && newScore <= 10) {
      onScoreChange(path, newScore);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      const score = parseFloat(editValue);
      if (!isNaN(score)) {
        handleScoreChange(score);
      }
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditValue(metric.score.toString());
    }
  };

  return (
    <div
      style={{
        marginLeft: `${level * 24}px`,
        marginBottom: '4px',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: isMobile ? 'stretch' : 'center',
          padding: isMobile ? '8px 12px 11px 12px' : '8px 12px',
          background: level === 0 ? '#fff' : '#f9f9f9',
          borderRadius: '6px',
          border: '1px solid #e0e0e0',
          borderBottom: '1px solid rgb(224, 224, 224)',
          transition: 'all 0.2s',
          position: 'relative',
        }}
      >
        {/* Верхняя строка: кнопка, название, оценка */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            width: '100%',
          }}
        >
          {/* Кнопка раскрытия/сворачивания */}
          {hasSubWheel && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              style={{
                width: '24px',
                height: '24px',
                marginRight: '8px',
                border: 'none',
                background: '#e0e0e0',
                borderRadius: '4px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                flexShrink: 0,
              }}
            >
              {isExpanded ? '−' : '+'}
            </button>
          )}
          {!hasSubWheel && !isMobile && <div style={{ width: '32px' }} />}

          {/* Название метрики */}
          <div
            style={{
              flex: 1,
              fontWeight: level === 0 ? 'bold' : 'normal',
              fontSize: level === 0 ? '16px' : '14px',
            }}
          >
            {metric.name}
          </div>

          {/* На десктопе: индикатор оценки */}
          {!isMobile && (
            <div
              style={{
                width: '100px',
                height: '8px',
                background: '#e0e0e0',
                borderRadius: '4px',
                marginRight: '12px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${(metric.score / 10) * 100}%`,
                  height: '100%',
                  background: color,
                  transition: 'all 0.3s',
                }}
              />
            </div>
          )}

          {/* Оценка */}
          {!isEditing ? (
            <div
              style={{
                minWidth: isMobile ? '50px' : '60px',
                textAlign: 'center',
                fontSize: isMobile ? '14px' : '16px',
                fontWeight: 'bold',
                color: '#333',
                cursor: 'pointer',
                padding: isMobile ? '2px 4px' : '4px 8px',
                borderRadius: '4px',
                background: isMobile ? 'transparent' : '#f0f0f0',
              }}
              onClick={() => {
                setIsEditing(true);
                setEditValue(metric.score.toString());
              }}
            >
              {metric.score.toFixed(1)}
            </div>
          ) : (
            <input
              type="number"
              min="0"
              max="10"
              step="0.1"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={() => {
                const score = parseFloat(editValue);
                if (!isNaN(score)) {
                  handleScoreChange(score);
                }
              }}
              autoFocus
              style={{
                width: isMobile ? '50px' : '60px',
                padding: isMobile ? '2px 4px' : '4px 8px',
                textAlign: 'center',
                fontSize: isMobile ? '14px' : '16px',
                border: '2px solid #333',
                borderRadius: '4px',
              }}
            />
          )}
        </div>

        {/* На мобильных: прогресс-бар внизу как border-bottom */}
        {isMobile && (
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '3px',
              background: color,
              borderRadius: '0 0 6px 6px',
              width: `${(metric.score / 10) * 100}%`,
              transition: 'all 0.3s',
            }}
          />
        )}
      </div>

      {/* Подметрики */}
      {hasSubWheel && isExpanded && (
        <div style={{ marginTop: '4px' }}>
          {metric.subWheel!.metrics.map((subMetric) => (
            <MetricItem
              key={subMetric.id}
              metric={subMetric}
              level={level + 1}
              path={[...path, subMetric.id]}
              onScoreChange={onScoreChange}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function ListView() {
  const { data, updateMetricScore } = useWheelData();

  const handleScoreChange = (path: string[], score: number) => {
    updateMetricScore(path, score);
  };

  return (
    <div
      style={{
        padding: '20px',
        maxWidth: '1200px',
        margin: '0 auto',
        background: '#f5f5f5',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          background: 'white',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          flex: 1,
          overflowY: 'auto',
        }}
      >
        {data.mainWheel.metrics.map((metric) => (
          <MetricItem
            key={metric.id}
            metric={metric}
            level={0}
            path={[metric.id]}
            onScoreChange={handleScoreChange}
          />
        ))}
      </div>
    </div>
  );
}

