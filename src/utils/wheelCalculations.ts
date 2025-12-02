export interface SectorPath {
  path: string;
  centerX: number;
  centerY: number;
  angle: number;
}

/**
 * Создает SVG path для сектора колеса
 */
export function createSectorPath(
  centerX: number,
  centerY: number,
  radius: number,
  startAngle: number,
  endAngle: number
): string {
  const start = polarToCartesian(centerX, centerY, radius, endAngle);
  const end = polarToCartesian(centerX, centerY, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

  return [
    'M',
    centerX,
    centerY,
    'L',
    start.x,
    start.y,
    'A',
    radius,
    radius,
    0,
    largeArcFlag,
    0,
    end.x,
    end.y,
    'Z',
  ].join(' ');
}

/**
 * Конвертирует полярные координаты в декартовы
 */
function polarToCartesian(
  centerX: number,
  centerY: number,
  radius: number,
  angleInDegrees: number
): { x: number; y: number } {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;

  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
}

/**
 * Вычисляет углы для секторов колеса
 */
export function calculateSectorAngles(
  sectorIndex: number,
  totalSectors: number
): { startAngle: number; endAngle: number; centerAngle: number } {
  const anglePerSector = 360 / totalSectors;
  const startAngle = sectorIndex * anglePerSector;
  const endAngle = (sectorIndex + 1) * anglePerSector;
  const centerAngle = startAngle + anglePerSector / 2;

  return { startAngle, endAngle, centerAngle };
}

/**
 * Вычисляет позицию текста в центре сектора
 */
export function getTextPosition(
  centerX: number,
  centerY: number,
  radius: number,
  angle: number,
  textOffset: number = 0.6
): { x: number; y: number } {
  const textRadius = radius * textOffset;
  return polarToCartesian(centerX, centerY, textRadius, angle);
}

/**
 * Вычисляет цвет сектора на основе оценки (0-10)
 */
export function getSectorColor(score: number): string {
  // Градиент от красного (0) к синему (5) к зеленому (10)
  const normalizedScore = Math.max(0, Math.min(10, score)) / 10;
  
  // Красный -> Синий -> Зеленый
  let r: number, g: number, b: number;
  
  if (normalizedScore < 0.5) {
    // От красного к синему
    const t = normalizedScore * 2;
    r = Math.round(255 * (1 - t));
    g = 0;
    b = Math.round(255 * t);
  } else {
    // От синего к зеленому
    const t = (normalizedScore - 0.5) * 2;
    r = 0;
    g = Math.round(255 * t);
    b = Math.round(255 * (1 - t));
  }
  
  return `rgb(${r}, ${g}, ${b})`;
}

/**
 * Вычисляет позицию подколеса вокруг основного колеса
 */
export function getSubWheelPosition(
  mainCenterX: number,
  mainCenterY: number,
  mainRadius: number,
  subWheelIndex: number,
  totalSubWheels: number,
  distance: number
): { x: number; y: number } {
  const angle = (360 / totalSubWheels) * subWheelIndex;
  return polarToCartesian(mainCenterX, mainCenterY, mainRadius + distance, angle);
}

