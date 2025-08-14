const fs = require('fs');
const path = require('path');

const iconsDir = path.join(__dirname, '..', 'public', 'icons');
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Copy SVG files to PNG files (for development)
sizes.forEach(size => {
  const svgFile = path.join(iconsDir, `icon-${size}x${size}.svg`);
  const pngFile = path.join(iconsDir, `icon-${size}x${size}.png`);
  
  if (fs.existsSync(svgFile)) {
    fs.copyFileSync(svgFile, pngFile);
    console.log(`Copied icon-${size}x${size}.png`);
  }
});

// Copy shortcut icons
const shortcuts = ['shortcut-discover', 'shortcut-search'];
shortcuts.forEach(name => {
  const svgFile = path.join(iconsDir, `${name}.svg`);
  const pngFile = path.join(iconsDir, `${name}.png`);
  
  if (fs.existsSync(svgFile)) {
    fs.copyFileSync(svgFile, pngFile);
    console.log(`Copied ${name}.png`);
  }
});

console.log('Icon copying complete!');