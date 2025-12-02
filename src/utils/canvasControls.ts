export interface CanvasTransform {
  scale: number;
  translateX: number;
  translateY: number;
}

export const MIN_SCALE = 0.1;
export const MAX_SCALE = 5;
export const SCALE_STEP = 0.1;

/**
 * Обработка зума колесиком мыши
 */
export function handleWheelZoom(
  e: React.WheelEvent,
  transform: CanvasTransform,
  setTransform: (transform: CanvasTransform) => void
) {
  e.preventDefault();
  
  const delta = e.deltaY > 0 ? -SCALE_STEP : SCALE_STEP;
  const newScale = Math.max(
    MIN_SCALE,
    Math.min(MAX_SCALE, transform.scale + delta)
  );

  // Масштабирование относительно позиции мыши
  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  // Преобразуем координаты мыши в координаты SVG
  const svgX = (mouseX - transform.translateX) / transform.scale;
  const svgY = (mouseY - transform.translateY) / transform.scale;

  // Вычисляем новый translate для масштабирования относительно точки мыши
  const newTranslateX = mouseX - svgX * newScale;
  const newTranslateY = mouseY - svgY * newScale;

  setTransform({
    scale: newScale,
    translateX: newTranslateX,
    translateY: newTranslateY,
  });
}

/**
 * Обработка начала перетаскивания
 */
export function handleDragStart(
  e: React.MouseEvent,
  setDragStart: (pos: { x: number; y: number } | null) => void
) {
  if (e.button === 0) {
    // Левая кнопка мыши
    setDragStart({ x: e.clientX, y: e.clientY });
  }
}

/**
 * Обработка перетаскивания
 */
export function handleDrag(
  e: React.MouseEvent,
  dragStart: { x: number; y: number } | null,
  transform: CanvasTransform,
  setTransform: (transform: CanvasTransform) => void,
  setDragStart: (pos: { x: number; y: number } | null) => void
) {
  if (dragStart) {
    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;

    setTransform({
      ...transform,
      translateX: transform.translateX + deltaX,
      translateY: transform.translateY + deltaY,
    });

    setDragStart({ x: e.clientX, y: e.clientY });
  }
}

/**
 * Обработка окончания перетаскивания
 */
export function handleDragEnd(
  setDragStart: (pos: { x: number; y: number } | null) => void
) {
  setDragStart(null);
}

/**
 * Обработка начала touch-перетаскивания
 */
export function handleTouchStart(
  e: React.TouchEvent,
  setDragStart: (pos: { x: number; y: number } | null) => void,
  setTouchDistance: (distance: number | null) => void,
  setInitialScale: (scale: number) => void,
  currentScale: number
) {
  if (e.touches.length === 1) {
    // Одно касание - начало перетаскивания
    const touch = e.touches[0];
    setDragStart({ x: touch.clientX, y: touch.clientY });
    setTouchDistance(null);
  } else if (e.touches.length === 2) {
    // Два касания - начало зума
    const touch1 = e.touches[0];
    const touch2 = e.touches[1];
    const distance = Math.hypot(
      touch2.clientX - touch1.clientX,
      touch2.clientY - touch1.clientY
    );
    setTouchDistance(distance);
    setInitialScale(currentScale);
    setDragStart(null);
  }
}

/**
 * Обработка touch-перетаскивания
 */
export function handleTouchMove(
  e: React.TouchEvent,
  dragStart: { x: number; y: number } | null,
  touchDistance: number | null,
  initialScale: number,
  transform: CanvasTransform,
  setTransform: (transform: CanvasTransform) => void,
  setDragStart: (pos: { x: number; y: number } | null) => void,
  setTouchDistance: (distance: number | null) => void,
  containerRef: React.RefObject<HTMLDivElement>
) {
  e.preventDefault(); // Предотвращаем стандартное поведение браузера

  if (e.touches.length === 1 && dragStart) {
    // Одно касание - перетаскивание
    const touch = e.touches[0];
    const deltaX = touch.clientX - dragStart.x;
    const deltaY = touch.clientY - dragStart.y;

    setTransform({
      ...transform,
      translateX: transform.translateX + deltaX,
      translateY: transform.translateY + deltaY,
    });

    setDragStart({ x: touch.clientX, y: touch.clientY });
  } else if (e.touches.length === 2 && touchDistance !== null) {
    // Два касания - зум
    const touch1 = e.touches[0];
    const touch2 = e.touches[1];
    const currentDistance = Math.hypot(
      touch2.clientX - touch1.clientX,
      touch2.clientY - touch1.clientY
    );

    const scaleChange = currentDistance / touchDistance;
    const newScale = Math.max(
      MIN_SCALE,
      Math.min(MAX_SCALE, initialScale * scaleChange)
    );

    // Центр зума - середина между двумя касаниями
    const centerX = (touch1.clientX + touch2.clientX) / 2;
    const centerY = (touch1.clientY + touch2.clientY) / 2;

    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const mouseX = centerX - rect.left;
      const mouseY = centerY - rect.top;

      // Преобразуем координаты в координаты SVG
      const svgX = (mouseX - transform.translateX) / transform.scale;
      const svgY = (mouseY - transform.translateY) / transform.scale;

      // Вычисляем новый translate для масштабирования относительно центра зума
      const newTranslateX = mouseX - svgX * newScale;
      const newTranslateY = mouseY - svgY * newScale;

      setTransform({
        scale: newScale,
        translateX: newTranslateX,
        translateY: newTranslateY,
      });
    }
  }
}

/**
 * Обработка окончания touch-событий
 */
export function handleTouchEnd(
  setDragStart: (pos: { x: number; y: number } | null) => void,
  setTouchDistance: (distance: number | null) => void
) {
  setDragStart(null);
  setTouchDistance(null);
}

/**
 * Сброс трансформации к начальному состоянию
 */
export function resetTransform(
  containerWidth: number,
  containerHeight: number,
  contentWidth: number,
  contentHeight: number
): CanvasTransform {
  // Центрируем контент
  const scale = Math.min(
    containerWidth / contentWidth,
    containerHeight / contentHeight,
    1
  ) * 0.8; // Немного уменьшаем для отступов

  return {
    scale,
    translateX: (containerWidth - contentWidth * scale) / 2,
    translateY: (containerHeight - contentHeight * scale) / 2,
  };
}

