const fs = require('fs');
import('path').then((path) => {
  const assetsDir = path.resolve(__dirname, '../mobile/assets');
  if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
  }

  // Valid 1x1 PNG buffer hex string
  const basePngHex =
    '89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c4890000000d4944415478da63601805030000020001e221bc330000000049454e44ae426082';
  const pngBuffer = Buffer.from(basePngHex, 'hex');

  const files = ['icon.png', 'splash.png', 'adaptive-icon.png', 'notification-icon.png', 'favicon.png'];

  files.forEach((file) => {
    const filePath = path.join(assetsDir, file);
    fs.writeFileSync(filePath, pngBuffer);
    console.log(`Generated Expo asset: ${file}`);
  });
});
