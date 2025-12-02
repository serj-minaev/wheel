// Простой скрипт для генерации PNG иконок из SVG
// Требует: npm install sharp
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const svgPath = path.join(__dirname, '../public/icon.svg');
const publicDir = path.join(__dirname, '../public');

// Читаем SVG
const svgBuffer = fs.readFileSync(svgPath);

// Генерируем иконки разных размеров
const sizes = [192, 512];

sizes.forEach(size => {
  sharp(svgBuffer)
    .resize(size, size)
    .png()
    .toFile(path.join(publicDir, `icon-${size}.png`))
    .then(() => {
      console.log(`✓ Создана иконка icon-${size}.png`);
    })
    .catch(err => {
      console.error(`Ошибка при создании icon-${size}.png:`, err);
    });
});

