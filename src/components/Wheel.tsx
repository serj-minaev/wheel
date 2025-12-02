import { useState } from 'react';
import type { Metric } from '../types/wheel';
import {
  createSectorPath,
  calculateSectorAngles,
  getTextPosition,
  getSectorColor,
} from '../utils/wheelCalculations';

interface WheelProps {
  metrics: Metric[];
  centerX: number;
  centerY: number;
  radius: number;
  onScoreChange?: (metricId: string, score: number) => void;
  showLabels?: boolean;
  isSubWheel?: boolean;
}

export function Wheel({
  metrics,
  centerX,
  centerY,
  radius,
  onScoreChange,
  showLabels = true,
  isSubWheel = false,
}: WheelProps) {
  const [editingMetric, setEditingMetric] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');

  const handleSectorClick = (metric: Metric) => {
    if (onScoreChange) {
      setEditingMetric(metric.id);
      setEditValue(metric.score.toString());
    }
  };

  const handleScoreSubmit = (metricId: string) => {
    if (onScoreChange) {
      const score = parseFloat(editValue);
      if (!isNaN(score) && score >= 0 && score <= 10) {
        onScoreChange(metricId, score);
      }
    }
    setEditingMetric(null);
  };

  const handleScoreCancel = () => {
    setEditingMetric(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent, metricId: string) => {
    if (e.key === 'Enter') {
      handleScoreSubmit(metricId);
    } else if (e.key === 'Escape') {
      handleScoreCancel();
    }
  };

  return (
    <g>
      {/* Отрисовка секторов */}
      {metrics.map((metric, index) => {
        const { startAngle, endAngle, centerAngle } = calculateSectorAngles(
          index,
          metrics.length
        );
        const path = createSectorPath(
          centerX,
          centerY,
          radius,
          startAngle,
          endAngle
        );
        const color = getSectorColor(metric.score);
        // Позиция для названия метрики (за пределами колеса)
        const labelPos = getTextPosition(centerX, centerY, radius, centerAngle, 1.25);
        // Позиция для оценки (внутри колеса, ближе к центру)
        const scorePos = getTextPosition(centerX, centerY, radius, centerAngle, 0.4);

        // Вычисляем радиус закрашивания на основе оценки
        const scoreRatio = Math.max(0, Math.min(10, metric.score)) / 10;
        const filledRadius = radius * scoreRatio;
        const filledPath = createSectorPath(
          centerX,
          centerY,
          filledRadius,
          startAngle,
          endAngle
        );

        return (
          <g key={metric.id}>
            {/* Фоновый сектор (полный) - кликабельный */}
            <path
              d={path}
              fill="#e0e0e0"
              stroke="#fff"
              strokeWidth="2"
              opacity={0.3}
              style={{ 
                cursor: onScoreChange ? 'pointer' : 'default',
                pointerEvents: onScoreChange ? 'auto' : 'none'
              }}
              onClick={() => handleSectorClick(metric)}
            />
            {/* Закрашенный сектор (пропорционально оценке) */}
            <path
              d={filledPath}
              fill={color}
              stroke="#fff"
              strokeWidth="2"
              opacity={0.5}
              style={{ 
                cursor: onScoreChange ? 'pointer' : 'default',
                pointerEvents: 'none' // Клик обрабатывается на фоновом секторе
              }}
            />
            {/* Текст метрики (за пределами колеса) */}
            {showLabels && !editingMetric && (
              <>
                {/* Фон для текста для лучшей читаемости */}
                <circle
                  cx={labelPos.x}
                  cy={labelPos.y}
                  r={isSubWheel ? 25 : 22}
                  fill="white"
                  opacity={0.9}
                  stroke="#ddd"
                  strokeWidth="1"
                  style={{ pointerEvents: 'none' }}
                />
                {isSubWheel ? (
                  // Для подколес используем foreignObject для переноса текста
                  <foreignObject
                    x={labelPos.x - 30}
                    y={labelPos.y - 15}
                    width="60"
                    height="30"
                  >
                    <div
                      style={{
                        fontSize: '11px',
                        color: '#333',
                        fontWeight: '600',
                        textAlign: 'center',
                        lineHeight: '1.2',
                        wordWrap: 'break-word',
                        overflowWrap: 'break-word',
                        pointerEvents: 'none',
                        userSelect: 'none',
                      }}
                    >
                      {metric.name}
                    </div>
                  </foreignObject>
                ) : (
                  // Для основных колес используем обычный text
                  <text
                    x={labelPos.x}
                    y={labelPos.y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="18"
                    fill="#333"
                    fontWeight="600"
                    style={{ pointerEvents: 'none', userSelect: 'none' }}
                  >
                    {metric.name}
                  </text>
                )}
              </>
            )}
            {/* Оценка (внутри колеса) */}
            {!editingMetric && (
              <text
                x={scorePos.x}
                y={scorePos.y}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={isSubWheel ? 18 : 24}
                fill="#000"
                fontWeight="bold"
                style={{ pointerEvents: 'none', userSelect: 'none' }}
              >
                {metric.score.toFixed(1)}
              </text>
            )}
            {/* Инлайн редактирование */}
            {editingMetric === metric.id && (
              <foreignObject
                x={scorePos.x - 40}
                y={scorePos.y - 10}
                width="80"
                height="40"
              >
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <input
                    type="number"
                    min="0"
                    max="10"
                    step="0.1"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, metric.id)}
                    onBlur={() => handleScoreSubmit(metric.id)}
                    autoFocus
                    style={{
                      width: '60px',
                      padding: '4px',
                      textAlign: 'center',
                      fontSize: '14px',
                      border: '2px solid #333',
                      borderRadius: '4px',
                    }}
                  />
                  <div style={{ fontSize: '10px', color: '#666' }}>
                    Enter - сохранить, Esc - отмена
                  </div>
                </div>
              </foreignObject>
            )}
          </g>
        );
      })}
      {/* Центральный круг (опционально) */}
      {!isSubWheel && (
        <circle
          cx={centerX}
          cy={centerY}
          r={radius * 0.15}
          fill="#fff"
          stroke="#333"
          strokeWidth="2"
        />
      )}
    </g>
  );
}

