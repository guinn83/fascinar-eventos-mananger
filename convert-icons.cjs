const sharp = require('sharp');

async function convertSvgToPng() {
  try {
    console.log('Convertendo ícones SVG para PNG...');
    // Converter icon-192.svg para PNG
    await sharp('public/icon-192.svg')
      .png()
      .toFile('public/icon-192.png');
    console.log('✅ icon-192.png criado com sucesso');
    // Converter icon-512.svg para PNG
    await sharp('public/icon-512.svg')
      .png()
      .toFile('public/icon-512.png');
    console.log('✅ icon-512.png criado com sucesso');
    console.log('🎉 Conversão concluída!');
  } catch (error) {
    console.error('❌ Erro na conversão:', error.message);
    process.exit(1);
  }
}

convertSvgToPng();
