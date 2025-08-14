const fs = require('fs');
const path = require('path');

// Simple placeholder screenshot SVG
const createScreenshot = (width, height, label) => `
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0f172a;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#1e293b;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#bg)"/>
  <text x="${width/2}" y="${height/2}" text-anchor="middle" fill="#94a3b8" font-family="Arial" font-size="24">${label}</text>
</svg>
`.trim();

const screenshotsDir = path.join(__dirname, '..', 'public', 'screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

// Generate screenshots
const screenshots = [
  { name: 'desktop-1.png', width: 1280, height: 720, label: 'SoundWave Desktop' },
  { name: 'mobile-1.png', width: 390, height: 844, label: 'SoundWave Mobile' }
];

screenshots.forEach(({ name, width, height, label }) => {
  const svg = createScreenshot(width, height, label);
  const svgName = name.replace('.png', '.svg');
  const svgPath = path.join(screenshotsDir, svgName);
  const pngPath = path.join(screenshotsDir, name);
  
  fs.writeFileSync(svgPath, svg);
  fs.copyFileSync(svgPath, pngPath);
  
  console.log(`Generated ${name}`);
});

console.log('Screenshot generation complete!');