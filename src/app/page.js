'use client';

import { useState, useEffect, useRef } from 'react';
import ImageUpload from './components/ImageUpload';
import ImageGallery from './components/ImageGallery';
import { downloadAllImages } from './utils/generateFunctions';
import { Titillium_Web } from '@next/font/google'
import {mainStyle, headingStyle, sectionStyle, subHeadingStyle, buttonStyle, disabledButtonStyle, deleteButtonStyle, loaderContainerStyle, loaderTextStyle} from './utils/styles';
import LinearProgress from '@mui/material/LinearProgress';

const titillium = Titillium_Web({ 
  weight: '400', subsets: ['latin'] });

export default function Home() {
  const [images, setImages] = useState([]);
  const [generatedImages, setGeneratedImages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const generatedGalleryRef = useRef(null);

  useEffect(() => {
    fetchImages();
  }, []);

  useEffect(() => {
    if (generatedImages.length > 0 && generatedGalleryRef.current) {
      generatedGalleryRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [generatedImages]);

  const fetchImages = async () => {
    const response = await fetch('/api/images');
    const data = await response.json();
    setImages(data);
  };

  const handleUpload = async (formData) => {
    setIsLoading(true);
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (response.ok) {
      const result = await response.json();
      setImages(prevImages => [...prevImages, ...result.images]);
    } else {
      console.error('Failed to upload images');
    }

    setIsLoading(false);
  };

  const handleUpdateDescription = (index, description, modelDescription, upscale) => {
    setImages(prevImages => {
      const newImages = [...prevImages];
      newImages[index] = { ...newImages[index], description, modelDescription, upscale };
      return newImages;
    });
  };

  const handleStreamingResponse = async (response) => {
    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n').filter(Boolean);

      for (const line of lines) {
        const data = JSON.parse(line);
        if (data.type === 'outfit') {
          setGeneratedImages(prev => [...prev, data]);
        }
      }
    }
  };

  const handleGenerate = async () => {
    setIsLoading(true);
    setGeneratedImages([]);
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ images }),
      });

      if (response.ok) {
        await handleStreamingResponse(response);
      } else {
        console.error('Failed to generate images');
      }
    } catch (error) {
      console.error('Error generating images:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteImage = async (index) => {
    const imageToDelete = images[index];
    try {
      const response = await fetch('/api/deleteImage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageUrl: imageToDelete.url }),
      });

      if (response.ok) {
        setImages(prevImages => prevImages.filter((_, i) => i !== index));
      } else {
        console.error('Failed to delete image');
      }
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  };

  const handleDeleteAllImages = async () => {
    for (let i = 0; i < images.length; i++) {
      await handleDeleteImage(0);  // Always delete the first image
    }
  };

  const handleDownloadAllImages = (imageSet) => {
    downloadAllImages(imageSet);
  };

  return (
    <main style={mainStyle}>
      <h1 style={headingStyle} className={titillium.className}>Click Fashion</h1>
      
      <div style={sectionStyle}>
        <h2 style={subHeadingStyle} className={titillium.className}>Upload Images</h2>
        <ImageUpload onUpload={handleUpload} titillium={titillium}/>
        {isLoading && <LinearProgress style={{ marginTop: '1rem' }} color="primary" />}
      </div>
  
      <div style={sectionStyle}>
        <h2 style={subHeadingStyle} className={titillium.className}>Uploaded Images</h2>
        <div style={{ marginBottom: '1rem' }}>
          <button 
            className={titillium.className}
            onClick={handleDeleteAllImages}
            style={images.length === 0 ? disabledButtonStyle : deleteButtonStyle}
            disabled={images.length === 0}
          >
            Delete All
          </button>
        </div>
        <ImageGallery 
          images={images} 
          isUploadedGallery={true}
          onUpdateDescription={handleUpdateDescription}
          onDeleteImage={handleDeleteImage}
          titillium={titillium}
        />
      </div>
      
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <button 
          className={titillium.className}
          onClick={handleGenerate}
          style={isLoading || images.length === 0 ? disabledButtonStyle : buttonStyle}
          disabled={isLoading || images.length === 0}
        >
          Generate Clothes
        </button>
      </div>

      {isLoading && (
        <div style={loaderContainerStyle}>
          <p style={loaderTextStyle} className={titillium.className}>Generating images... This may take a while.</p>
          <div className="loader"></div>
        </div>
      )}

      {generatedImages.length > 0 && (
        <div style={sectionStyle} ref={generatedGalleryRef}>
          <h2 style={subHeadingStyle} className={titillium.className}>Generated Images</h2>
          <div style={{ marginBottom: '1rem' }}>
            <button 
              onClick={() => handleDownloadAllImages(generatedImages)}
              style={buttonStyle}
              className={titillium.className}
            >
              Download All
            </button>
          </div>
          <ImageGallery 
            generatedImages={generatedImages}
            isUploadedGallery={false}
            titillium={titillium}
          />
        </div>
      )}
    </main>
  );
}
