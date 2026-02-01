import React, { useEffect, useState } from 'react';
import './Gallery.css';

// ==========================================
// YOUR KEYS
// ==========================================
const API_KEY = 'AIzaSyAGU_45FCNsh5M6tuc9mnUqQ8Uhf5Cdjgk'; 
const FOLDER_ID = '1SDMIBSuweTO3zHHKqZXy7nMpEMPhVOK9';
// ==========================================

const Gallery = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Helper: Fisher-Yates Shuffle Algorithm to randomize order
  const shuffleArray = (array) => {
    let currentIndex = array.length, randomIndex;
    // While there remain elements to shuffle...
    while (currentIndex !== 0) {
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }
    return array;
  };

  useEffect(() => {
    const fetchImagesFromDrive = async () => {
      try {
        const query = `'${FOLDER_ID}' in parents and trashed = false and mimeType contains 'image/'`;
        // Request metadata (width/height) to assign smart sizes
        const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name,imageMediaMetadata)&key=${API_KEY}`;

        const response = await fetch(url);
        const data = await response.json();

        if (data.error) {
          throw new Error(data.error.message);
        }

        const processedImages = data.files.map(file => {
          // Get dimensions from Drive metadata
          const width = file.imageMediaMetadata ? file.imageMediaMetadata.width : 1;
          const height = file.imageMediaMetadata ? file.imageMediaMetadata.height : 1;
          const aspectRatio = width / height;
          
          // INTELLIGENT SIZING LOGIC:
          // Assigns classes based on real image shape to create the "collage" puzzle fit
          let sizeClass = 'item-small'; // Default 1x1 block
          
          // You can tweak these ratios to change how often "big" blocks appear
          if (aspectRatio < 0.75) {
            sizeClass = 'item-tall'; // 1x2 block (Portrait)
          } else if (aspectRatio > 1.3) {
             sizeClass = 'item-wide'; // 2x1 block (Landscape)
          } else if (width > 1200 && height > 1200) {
            sizeClass = 'item-big';  // 2x2 block (Big Square)
          }

          return {
            id: file.id,
            src: `https://drive.google.com/thumbnail?id=${file.id}&sz=w1000`,
            alt: file.name,
            sizeClass: sizeClass
          };
        });

        // SHUFFLE the images before setting state so the order is random every time
        const randomizedImages = shuffleArray(processedImages);
        
        setImages(randomizedImages);
        setLoading(false);

      } catch (err) {
        console.error("Error fetching images from Drive:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchImagesFromDrive();
  }, []);

  if (error) {
    return (
      <div className="gallery-container">
        <div className="gallery-bg" />
        <div className="gallery-content">
          <h1 className="gallery-title">Gallery</h1>
          <p className="error-message">Error: {error}. Please check your API Key settings.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="gallery-container">
      <div className="gallery-bg" />
      <div className="gallery-content">
        <h1 className="gallery-title">Gallery</h1>
        
        {loading && <p>Loading memories...</p>}

        {!loading && (
          <div className="gallery-grid">
            {images.map(image => (
              <div 
                key={image.id} 
                className={`gallery-item ${image.sizeClass}`}
              >
                <img 
                  src={image.src} 
                  alt={image.alt} 
                  className="gallery-img" 
                  loading="lazy" 
                />
                <div className="gallery-overlay"></div>
              </div>
            ))}
          </div>
        )}
        
        {!loading && images.length === 0 && <p>No images found in the Drive folder.</p>}
      </div>
    </div>
  );
};

export default Gallery;