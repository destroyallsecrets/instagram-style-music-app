interface ColorPalette {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
}

interface RGB {
  r: number;
  g: number;
  b: number;
}

export function extractColorsFromImage(imageUrl: string): Promise<ColorPalette> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          throw new Error('Canvas context not available');
        }

        // Resize image for faster processing
        const size = 100;
        canvas.width = size;
        canvas.height = size;
        
        ctx.drawImage(img, 0, 0, size, size);
        const imageData = ctx.getImageData(0, 0, size, size);
        
        const colors = extractDominantColors(imageData.data);
        const palette = createColorPalette(colors);
        
        resolve(palette);
      } catch (error) {
        reject(error instanceof Error ? error : new Error(String(error)));
      }
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };
    
    img.src = imageUrl;
  });
}

function extractDominantColors(imageData: Uint8ClampedArray): RGB[] {
  const colorMap = new Map<string, { color: RGB; count: number }>();
  
  // Sample every 4th pixel for performance
  for (let i = 0; i < imageData.length; i += 16) {
    const r = imageData[i];
    const g = imageData[i + 1];
    const b = imageData[i + 2];
    const alpha = imageData[i + 3];
    
    // Skip transparent pixels
    if (alpha < 128) continue;
    
    // Quantize colors to reduce noise
    const quantizedR = Math.floor(r / 32) * 32;
    const quantizedG = Math.floor(g / 32) * 32;
    const quantizedB = Math.floor(b / 32) * 32;
    
    const key = `${quantizedR},${quantizedG},${quantizedB}`;
    
    if (colorMap.has(key)) {
      colorMap.get(key)!.count++;
    } else {
      colorMap.set(key, {
        color: { r: quantizedR, g: quantizedG, b: quantizedB },
        count: 1,
      });
    }
  }
  
  // Sort by frequency and return top colors
  return Array.from(colorMap.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
    .map(item => item.color);
}

function createColorPalette(colors: RGB[]): ColorPalette {
  if (colors.length === 0) {
    // Fallback palette
    return {
      primary: '#3b82f6',
      secondary: '#8b5cf6',
      accent: '#06b6d4',
      background: '#1e293b',
    };
  }
  
  // Find the most vibrant color for primary
  const primary = colors.reduce((most, color) => {
    const vibrance = getVibrance(color);
    const mostVibrance = getVibrance(most);
    return vibrance > mostVibrance ? color : most;
  });
  
  // Find complementary colors
  const secondary = findComplementaryColor(primary, colors);
  const accent = findAccentColor(primary, secondary, colors);
  const background = findBackgroundColor(colors);
  
  return {
    primary: rgbToHex(primary),
    secondary: rgbToHex(secondary),
    accent: rgbToHex(accent),
    background: rgbToHex(background),
  };
}

function getVibrance(color: RGB): number {
  const max = Math.max(color.r, color.g, color.b);
  const min = Math.min(color.r, color.g, color.b);
  return max - min;
}

function findComplementaryColor(primary: RGB, colors: RGB[]): RGB {
  // Find color with good contrast to primary
  let bestColor = colors[1] || primary;
  let bestContrast = 0;
  
  for (const color of colors) {
    const contrast = getContrast(primary, color);
    if (contrast > bestContrast) {
      bestContrast = contrast;
      bestColor = color;
    }
  }
  
  return bestColor;
}

function findAccentColor(primary: RGB, secondary: RGB, colors: RGB[]): RGB {
  // Find a color that's different from both primary and secondary
  for (const color of colors) {
    const primaryDistance = getColorDistance(primary, color);
    const secondaryDistance = getColorDistance(secondary, color);
    
    if (primaryDistance > 50 && secondaryDistance > 50) {
      return color;
    }
  }
  
  // Fallback: create a synthetic accent color
  return {
    r: Math.min(255, primary.r + 50),
    g: Math.min(255, primary.g + 30),
    b: Math.min(255, primary.b + 70),
  };
}

function findBackgroundColor(colors: RGB[]): RGB {
  // Find the darkest color for background
  return colors.reduce((darkest, color) => {
    const brightness = getBrightness(color);
    const darkestBrightness = getBrightness(darkest);
    return brightness < darkestBrightness ? color : darkest;
  });
}

function getContrast(color1: RGB, color2: RGB): number {
  const l1 = getLuminance(color1);
  const l2 = getLuminance(color2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function getLuminance(color: RGB): number {
  const { r, g, b } = color;
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function getBrightness(color: RGB): number {
  return (color.r * 299 + color.g * 587 + color.b * 114) / 1000;
}

function getColorDistance(color1: RGB, color2: RGB): number {
  const dr = color1.r - color2.r;
  const dg = color1.g - color2.g;
  const db = color1.b - color2.b;
  return Math.sqrt(dr * dr + dg * dg + db * db);
}

function rgbToHex(color: RGB): string {
  const toHex = (n: number) => {
    const hex = Math.round(n).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  
  return `#${toHex(color.r)}${toHex(color.g)}${toHex(color.b)}`;
}

export function applyColorPalette(palette: ColorPalette, element: HTMLElement) {
  element.style.setProperty('--extracted-primary', palette.primary);
  element.style.setProperty('--extracted-secondary', palette.secondary);
  element.style.setProperty('--extracted-accent', palette.accent);
  element.style.setProperty('--extracted-background', palette.background);
}