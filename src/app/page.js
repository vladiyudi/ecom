'use client';

import { useState, useEffect, useRef } from 'react';
import ImageUpload from './components/ImageUpload';
import ImageGallery from './components/ImageGallery';
import GeneratedGallery from './components/GeneratedGallery';
import { downloadAllImages } from './utils/generateFunctions';
import { Titillium_Web } from '@next/font/google'
import {mainStyle, headingStyle, sectionStyle, subHeadingStyle, buttonStyle, disabledButtonStyle, deleteButtonStyle, loaderContainerStyle, loaderTextStyle} from './utils/styles';
import LinearProgress from '@mui/material/LinearProgress';

const titillium = Titillium_Web({ 
  weight: '400', subsets: ['latin'] });

export default function Home() {
  const [images, setImages] = useState([]);
  const [collections, setCollections] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const generatedGalleryRef = useRef(null);

  useEffect(() => {
    fetchImages();
    fetchCollections();
  }, []);

  useEffect(() => {
    if (collections.length > 0 && generatedGalleryRef.current) {
      generatedGalleryRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [collections]);

  const fetchCollections = async () => {
    try {
      const response = await fetch('/api/collections');
      if (response.ok) {
        const data = await response.json();
        setCollections(data);
      }
    } catch (error) {
      console.error('Error fetching collections:', error);
    }
  };

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

  const handleUpdateCollectionName = async (collectionIndex, name) => {
    try {
      const response = await fetch('/api/collections', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ collectionIndex, name }),
      });

      if (response.ok) {
        const updatedCollections = await response.json();
        setCollections(updatedCollections);
      }
    } catch (error) {
      console.error('Error updating collection name:', error);
    }
  };

  const handleDeleteCollection = async (collectionIndex) => {
    if (window.confirm('Are you sure you want to delete this collection?')) {
      try {
        const response = await fetch('/api/deleteCollection', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ collectionIndex }),
        });

        if (response.ok) {
          const updatedCollections = await response.json();
          setCollections(updatedCollections);
        }
      } catch (error) {
        console.error('Error deleting collection:', error);
      }
    }
  };

  const handleDownloadCollection = (collection) => {
    downloadAllImages(collection.images.map(img => ({
      generatedImage: img.imageUrl,
      description: img.description
    })));
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
          await fetchCollections(); // Refresh collections after each image is generated
        }
      }
    }
  };

  const handleGenerate = async () => {
    setIsLoading(true);
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
      const response = await fetch('/api/deleteImage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ itemId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete image');
      }

      setImages(prevImages => prevImages.filter(img => img._id !== itemId));
    } catch (error) {
      console.error('Error deleting image:', error);
      alert('Failed to delete image. Please try again.');
    }
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

      {collections.length > 0 && (
        <div style={sectionStyle} ref={generatedGalleryRef}>
          <h2 style={subHeadingStyle} className={titillium.className}>Generated Collections</h2>
          <GeneratedGallery 
            collections={collections}
            onUpdateDescription={(collectionIndex, imageIndex, description) => {
              setCollections(prevCollections => {
                const newCollections = [...prevCollections];
                newCollections[collectionIndex].images[imageIndex].description = description;
                return newCollections;
              });
            }}
            onUpdateCollectionName={handleUpdateCollectionName}
            onDeleteCollection={handleDeleteCollection}
            onDownloadCollection={handleDownloadCollection}
            titillium={titillium}
          />
        </div>
      )}
    </main>
  );
}
