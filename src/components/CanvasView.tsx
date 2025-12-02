import { useState, useEffect, useRef } from 'react';
import { Wheel } from './Wheel';
import { useWheelData } from '../hooks/useWheelData';
import {
  getSubWheelPosition,
  calculateSectorAngles,
} from '../utils/wheelCalculations';
import {
  handleWheelZoom,
  handleDragStart,
  handleDrag,
  handleDragEnd,
  resetTransform,
  type CanvasTransform,
} from '../utils/canvasControls';

const MAIN_WHEEL_RADIUS = 200;
const SUB_WHEEL_RADIUS = 100;
const SUB_WHEEL_DISTANCE = 350;
const CANVAS_WIDTH = 2000;
const CANVAS_HEIGHT = 2000;
const MAIN_CENTER_X = CANVAS_WIDTH / 2;
const MAIN_CENTER_Y = CANVAS_HEIGHT / 2;

export function CanvasView() {
  const { data, updateMetricScore } = useWheelData();
  const containerRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState<CanvasTransform>({
    scale: 1,
    translateX: 0,
    translateY: 0,
  });
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(
    null
  );

  // Инициализация трансформации при монтировании
  useEffect(() => {
    if (containerRef.current) {
      const container = containerRef.current;
      const initialTransform = resetTransform(
        container.clientWidth,
        container.clientHeight,
        CANVAS_WIDTH,
        CANVAS_HEIGHT
      );
      setTransform(initialTransform);
    }
  }, []);

  const handleMainMetricScoreChange = (metricId: string, score: number) => {
    updateMetricScore([metricId], score);
  };

  const handleSubMetricScoreChange = (
    mainMetricId: string,
    subMetricId: string,
    score: number
  ) => {
    updateMetricScore([mainMetricId, subMetricId], score);
  };

  const handleWheel = (e: React.WheelEvent) => {
    handleWheelZoom(e, transform, setTransform);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    handleDragStart(e, setDragStart);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    handleDrag(e, dragStart, transform, setTransform, setDragStart);
  };

  const handleMouseUp = () => {
    handleDragEnd(setDragStart);
  };

  const handleMouseLeave = () => {
    handleDragEnd(setDragStart);
  };

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100vh',
        overflow: 'hidden',
        position: 'relative',
        background: '#f5f5f5',
        cursor: dragStart ? 'grabbing' : 'grab',
      }}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
    >
      <svg
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        style={{
          transform: `translate(${transform.translateX}px, ${transform.translateY}px) scale(${transform.scale})`,
          transformOrigin: '0 0',
        }}
      >
        {/* Основное колесо в центре */}
        <Wheel
          metrics={data.mainWheel.metrics}
          centerX={MAIN_CENTER_X}
          centerY={MAIN_CENTER_Y}
          radius={MAIN_WHEEL_RADIUS}
          onScoreChange={handleMainMetricScoreChange}
          showLabels={true}
          isSubWheel={false}
        />

        {/* Подколеса вокруг основного */}
        {data.mainWheel.metrics.map((mainMetric, index) => {
          if (!mainMetric.subWheel) return null;

          const subWheelPos = getSubWheelPosition(
            MAIN_CENTER_X,
            MAIN_CENTER_Y,
            MAIN_WHEEL_RADIUS,
            index,
            data.mainWheel.metrics.length,
            SUB_WHEEL_DISTANCE
          );

          // Линия от основного колеса к подколесу
          const { centerAngle } = calculateSectorAngles(
            index,
            data.mainWheel.metrics.length
          );
          const angleRad = ((centerAngle - 90) * Math.PI) / 180;
          const lineStartX =
            MAIN_CENTER_X + MAIN_WHEEL_RADIUS * Math.cos(angleRad);
          const lineStartY =
            MAIN_CENTER_Y + MAIN_WHEEL_RADIUS * Math.sin(angleRad);
          const lineEndX =
            subWheelPos.x - SUB_WHEEL_RADIUS * Math.cos(angleRad);
          const lineEndY =
            subWheelPos.y - SUB_WHEEL_RADIUS * Math.sin(angleRad);

          return (
            <g key={mainMetric.id}>
              {/* Линия связи */}
              <line
                x1={lineStartX}
                y1={lineStartY}
                x2={lineEndX}
                y2={lineEndY}
                stroke="#999"
                strokeWidth="2"
                strokeDasharray="5,5"
                opacity={0.5}
              />
              {/* Подколесо */}
              <Wheel
                metrics={mainMetric.subWheel.metrics}
                centerX={subWheelPos.x}
                centerY={subWheelPos.y}
                radius={SUB_WHEEL_RADIUS}
                onScoreChange={(subMetricId, score) =>
                  handleSubMetricScoreChange(mainMetric.id, subMetricId, score)
                }
                showLabels={true}
                isSubWheel={true}
              />
              {/* Название основного сектора рядом с подколесом */}
              <text
                x={subWheelPos.x}
                y={subWheelPos.y - SUB_WHEEL_RADIUS - 40}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="20"
                fill="#333"
                fontWeight="bold"
              >
                {mainMetric.name}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Панель управления */}
      <div
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          background: 'white',
          padding: '10px',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          zIndex: 10,
        }}
      >
        <div style={{ marginBottom: '8px', fontSize: '12px', color: '#666' }}>
          Масштаб: {(transform.scale * 100).toFixed(0)}%
        </div>
        <button
          onClick={() => {
            if (containerRef.current) {
              const container = containerRef.current;
              const reset = resetTransform(
                container.clientWidth,
                container.clientHeight,
                CANVAS_WIDTH,
                CANVAS_HEIGHT
              );
              setTransform(reset);
            }
          }}
          style={{
            padding: '6px 12px',
            fontSize: '12px',
            cursor: 'pointer',
            border: '1px solid #ccc',
            borderRadius: '4px',
            background: '#fff',
          }}
        >
          Сбросить вид
        </button>
        <div style={{ marginTop: '8px', fontSize: '11px', color: '#999' }}>
          Колесико мыши - зум
          <br />
          Перетаскивание - перемещение
        </div>
      </div>
    </div>
  );
}

