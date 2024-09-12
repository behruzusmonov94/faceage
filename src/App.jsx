import React, { useState } from 'react';
import { RekognitionClient, CompareFacesCommand } from "@aws-sdk/client-rekognition";
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

function App() {
  const [mainImage, setMainImage] = useState(null);  // Asosiy surat
  const [images, setImages] = useState([]);  // Qolgan suratlar
  const [sortedImages, setSortedImages] = useState([]); // Tartiblangan suratlar

  // AWS Rekognition mijozini yaratish
  const client = new RekognitionClient({
    region: 'eu-north-1', // Mintaqani qo'ying
    credentials: {
      accessKeyId: 'AKIA5CBGTC3OJLVC6OVA',  // AWS Access Key ID
      secretAccessKey: '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'  // AWS Secret Access Key
    }
  });

  // Asosiy rasm yuklash
  const handleMainImageUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    
    reader.onload = (e) => {
      setMainImage(e.target.result);  // Asosiy rasmni holatga saqlash
    };
    
    reader.readAsDataURL(file);
  };

  // Boshqa suratlarni yuklash
  const handleImagesUpload = (event) => {
    const files = event.target.files;
    const uploadedImages = [];

    for (let i = 0; i < files.length; i++) {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        uploadedImages.push(e.target.result);
        if (uploadedImages.length === files.length) {
          setImages(uploadedImages);  // Barcha suratlarni holatga saqlash
        }
      };
      
      reader.readAsDataURL(files[i]);
    }
  };

  // Yuzni tahlil qilib, yoshi bo'yicha tartiblash funksiyasi
  
const sortImagesByAge = async () => {
  if (!mainImage || images.length === 0) {
    alert("Iltimos, asosiy rasm va boshqa suratlarni yuklang.");
    return;
  }

  const imageAnalysis = [];


  
  // Asosiy va boshqa suratlarni Uint8Array formatiga o'tkazamiz
  const mainImageBytes = await fetch(mainImage)
    .then(res => res.arrayBuffer())
    .then(buffer => new Uint8Array(buffer));

  // Har bir suratni tahlil qilish
  for (let i = 0; i < images.length; i++) {
    const currentImageBytes = await fetch(images[i])
      .then(res => res.arrayBuffer())
      .then(buffer => new Uint8Array(buffer));

    const command = new CompareFacesCommand({
      SourceImage: { Bytes: mainImageBytes },
      TargetImage: { Bytes: currentImageBytes }
    });

    try {
      const response = await client.send(command);
      if (response.FaceMatches.length > 0) {
        const ageRange = response.FaceMatches[0].Face.AgeRange;
        imageAnalysis.push({ image: images[i], age: ageRange });
      }
    } catch (error) {
      console.error("Tahlil xatosi:", error);
    }
  }

  // Yosh bo'yicha tartiblash
  const sorted = imageAnalysis.sort((a, b) => a.age.Low - b.age.Low);
  setSortedImages(sorted.map(item => item.image));  // Tartiblangan suratlarni holatga saqlash
};


  // ZIP fayl yaratish va yuklab olish
  const downloadAsZip = async () => {
    const zip = new JSZip();

    // Har bir tartiblangan suratni ZIP faylga qo'shish
    sortedImages.forEach((image, index) => {
      zip.file(`image_${index + 1}.jpg`, image.split(',')[1], { base64: true });
    });

    // ZIP faylni yuklab olish
    zip.generateAsync({ type: 'blob' }).then((content) => {
      saveAs(content, 'sorted_images.zip');
    });
  };

  return (
    <div className="App">
      <h1>Yuzni yoshi bo'yicha tartiblash</h1>

      <div>
        <h2>Asosiy rasmni yuklang:</h2>
        <input type="file" accept="image/*" onChange={handleMainImageUpload} />
      </div>

      <div>
        <h2>Boshqa suratlarni yuklang:</h2>
        <input type="file" accept="image/*" multiple onChange={handleImagesUpload} />
      </div>

      <button onClick={sortImagesByAge}>Yosh bo'yicha tartiblash</button>

      {sortedImages.length > 0 && (
        <div>
          <h2>Tartiblangan suratlar:</h2>
          <button onClick={downloadAsZip}>Tartiblangan suratlarni yuklab olish (ZIP)</button>
        </div>
      )}
    </div>
  );
}

export default App;



// // AWS Rekognition'ni sozlash
// AWS.config.update({
//   region: 'eu-north-1', // Masalan, 'us-west-2'
//   accessKeyId: 'AKIA5CBGTC3OJLVC6OVA',
//   secretAccessKey: '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'
// });


