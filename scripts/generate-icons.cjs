const fs = require('fs');
const path = require('path');

// Simple SVG icon template
const createIcon = (size) => `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#8b5cf6;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${size * 0.2}" fill="url(#grad)"/>
  <path d="M${size * 0.3} ${size * 0.35} L${size * 0.7} ${size * 0.5} L${size * 0.3} ${size * 0.65} Z" fill="white"/>
</svg>
`.trim();

// Icon sizes needed
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Create icons directory if it doesn't exist
const iconsDir = path.join(__dirname, '..', 'public', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Generate icons
sizes.forEach(size => {
  const svg = createIcon(size);
  const filename = `icon-${size}x${size}.png`;
  const filepath = path.join(iconsDir, filename);
  
  // For now, create SVG files (in production, you'd convert to PNG)
  const svgFilename = `icon-${size}x${size}.svg`;
  const svgFilepath = path.join(iconsDir, svgFilename);
  fs.writeFileSync(svgFilepath, svg);
  
  console.log(`Generated ${svgFilename}`);
});

// Create shortcut icons
const shortcutIcons = ['shortcut-discover.png', 'shortcut-search.png'];
shortcutIcons.forEach(filename => {
  const svg = createIcon(96);
  const svgFilename = filename.replace('.png', '.svg');
  const filepath = path.join(iconsDir, svgFilename);
  fs.writeFileSync(filepath, svg);
  console.log(`Generated ${svgFilename}`);
});

console.log('Icon generation complete!');