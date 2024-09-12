const express = require('express');
const { RekognitionClient, CompareFacesCommand } = require('@aws-sdk/client-rekognition');
const app = express();

app.use(express.json({ limit: '50mb' })); // Suratlarni katta hajmda olish uchun

const client = new RekognitionClient({
  region: 'eu-north-1',
  credentials: {
    accessKeyId: 'AKIA5CBGTC3OJLVC6OVA',
    secretAccessKey: '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'
  }
});

app.post('/compare-faces', async (req, res) => {
  const { sourceImage, targetImage } = req.body;

  try {
    const command = new CompareFacesCommand({
      SourceImage: { Bytes: Buffer.from(sourceImage, 'base64') },
      TargetImage: { Bytes: Buffer.from(targetImage, 'base64') }
    });

    const response = await client.send(command);
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3001, () => {
  console.log('Server is running on port 3001');
});
