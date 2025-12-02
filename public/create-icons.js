// Простой скрипт для создания PNG иконок
// Запустите в Node.js: node public/create-icons.js
// Требует: npm install pngjs

const fs = require('fs');
const { PNG } = require('pngjs');

function createIcon(size) {
  const png = new PNG({ width: size, height: size });
  
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (size * y + x) << 2;
      
      // Фон #333333
      png.data[idx] = 51;     // R
      png.data[idx + 1] = 51;  // G
      png.data[idx + 2] = 51; // B
      png.data[idx + 3] = 255; // A
      
      const center = size / 2;
      const dx = x - center;
      const dy = y - center;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const radius = size * 0.4;
      
      // Рисуем белые круги
      if (Math.abs(dist - radius) < size * 0.02 || 
          Math.abs(dist - radius * 0.75) < size * 0.02 ||
          Math.abs(dist - radius * 0.5) < size * 0.02) {
        png.data[idx] = 255;
        png.data[idx + 1] = 255;
        png.data[idx + 2] = 255;
      }
      
      // Рисуем линии секторов
      if (dist > radius * 0.5 && dist < radius) {
        const angle = Math.atan2(dy, dx);
        const sectorAngle = (Math.PI * 2) / 8;
        const sector = Math.floor((angle + Math.PI) / sectorAngle);
        const sectorCenter = sector * sectorAngle - Math.PI;
        if (Math.abs(angle - sectorCenter) < 0.05) {
          png.data[idx] = 255;
          png.data[idx + 1] = 255;
          png.data[idx + 2] = 255;
        }
      }
    }
  }
  
  return png;
}

// Создаем иконки
[192, 512].forEach(size => {
  const png = createIcon(size);
  const stream = fs.createWriteStream(`icon-${size}.png`);
  png.pack().pipe(stream);
  console.log(`✓ Создана иконка icon-${size}.png`);
});

