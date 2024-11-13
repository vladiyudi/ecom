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
    try {
      const response = await fetch('/api/images');
      if (response.ok) {
        const data = await response.json();
        setImages(data);
      }
    } catch (error) {
      console.error('Error fetching images:', error);
    }
  };

  const handleUpload = async (formData) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        await fetchImages();
      } else {
        console.error('Failed to upload images');
      }
    } catch (error) {
      console.error('Error uploading images:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateDescription = (index, description, modelDescription, upscale, bottom) => {
    setImages(prevImages => {
      const newImages = [...prevImages];
      newImages[index] = { ...newImages[index], description, modelDescription, upscale, bottom };
      return newImages;
    });
  };

  const handleUpdateGeneratedDescription = (index, description, modelDescription, upscale, bottom) => {
    setGeneratedImages(prevImages => {
      const newImages = [...prevImages];
      newImages[index] = { 
        ...newImages[index], 
        description,
        modelDescription,
        upscale,
        bottomDescription: bottom?.description || newImages[index].bottomDescription
      };
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

  const handleDeleteImage = async (itemId) => {
    try {
      console.log('Sending delete request for item:', itemId); // Debug log
      const response = await fetch('/api/deleteImage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ itemId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Delete response error:', errorData); // Debug log
        throw new Error(errorData.error || 'Failed to delete image');
      }

      // Update local state immediately
      setImages(prevImages => prevImages.filter(img => img._id !== itemId));
    } catch (error) {
      console.error('Error deleting image:', error);
      alert('Failed to delete image. Please try again.');
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
        
        </div>
        <ImageGallery 
          images={images} 
          isUploadedGallery={true}
          onUpdateDescription={handleUpdateDescription}
          onDeleteImage={handleDeleteImage}
          onRefreshImages={fetchImages}
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
            onUpdateDescription={handleUpdateGeneratedDescription}
            titillium={titillium}
          />
        </div>
      )}
    </main>
  );
}
