'use client';
import { useState, useEffect, use } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faDownload, faArrowDown } from '@fortawesome/free-solid-svg-icons';
import {galleryStyle, flexContainerStyle, imageContainerStyle, frameStyle, imageStyle, inputContainerStyle, inputStyle, checkboxContainerStyle, modalStyle, modalImageStyle, iconButtonStyle} from '../utils/styles';

export default function ImageGallery({ images, generatedImages, isUploadedGallery, onUpdateDescription, onDeleteImage, titillium}) {
  const [descriptions, setDescriptions] = useState({});
  const [modelDescriptions, setModelDescriptions] = useState({});
  const [upscaleChecked, setUpscaleChecked] = useState({});
  const [modalImage, setModalImage] = useState(null);
  const [bottomImages, setBottomImages] = useState({});
  const [bottomDescriptions, setBottomDescriptions] = useState({});
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (isUploadedGallery && images) {
      const initialDescriptions = {};
      const initialModelDescriptions = {};
      const initialUpscaleChecked = {};
      const initialBottomImages = {};
      const initialBottomDescriptions = {};
      
      images.forEach((image, index) => {
        initialDescriptions[index] = image.description || '';
        initialModelDescriptions[index] = image.modelDescription || '';
        initialUpscaleChecked[index] = image.upscale || false;
        
        // Handle bottom garment data from API
        if (image.bottom) {
          initialBottomImages[index] = image.bottom.url;
          initialBottomDescriptions[index] = image.bottom.description || '';
        }
      });
      
      setDescriptions(initialDescriptions);
      setModelDescriptions(initialModelDescriptions);
      setUpscaleChecked(initialUpscaleChecked);
      setBottomImages(initialBottomImages);
      setBottomDescriptions(initialBottomDescriptions);
    }
  }, [isUploadedGallery, images]);

  const handleDescriptionChange = (index, value) => {
    setDescriptions(prev => ({ ...prev, [index]: value }));
  };

  const handleModelDescriptionChange = (index, value) => {
    setModelDescriptions(prev => ({ ...prev, [index]: value }));
  };

  const handleUpscaleChange = (index, checked) => {
    setUpscaleChecked(prev => {
      const newState = { ...prev, [index]: checked };
      console.log('Upscale state updated:', newState);
      handleDescriptionBlur(index, newState[index]);
      return newState;
    });
  };

  const handleDescriptionBlur = (index, upscaleValue = null) => {
    if (onUpdateDescription) {
      const upscaleCheckedValue = upscaleValue !== null ? upscaleValue : upscaleChecked[index];
      onUpdateDescription(index, descriptions[index] || '', modelDescriptions[index] || '', upscaleCheckedValue);
    }
  };

  const handleDeleteImage = async (index) => {
    if (isDeleting) return;
    
    try {
      setIsDeleting(true);
      
      const response = await fetch('/api/deleteImage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ index }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete image');
      }

      // Call the parent component's delete handler
      if (onDeleteImage) {
        onDeleteImage(index);
      }
    } catch (error) {
      console.error('Error deleting image:', error);
      alert('Failed to delete image. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const openModal = (imageUrl) => {
    setModalImage(imageUrl);
  };

  const closeModal = () => {
    setModalImage(null);
  };

  const downloadImage = async (imageUrl, filename) => {
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const handleBottomImageUpload = async (event, index) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      setIsUploading(true);

      // Create FormData
      const formData = new FormData();
      formData.append('image', file);
      formData.append('description', bottomDescriptions[index] || '');
      formData.append('index', index);

      // Upload to server
      const response = await fetch('/api/uploadBottom', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to upload bottom image');
      }

      const data = await response.json();

      // Update local state with the uploaded image URL
      setBottomImages(prev => ({ ...prev, [index]: data.bottom.imageUrl }));
      setBottomDescriptions(prev => ({ ...prev, [index]: data.bottom.description }));

    } catch (error) {
      console.error('Error uploading bottom image:', error);
      alert('Failed to upload bottom image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleBottomDescriptionChange = (index, value) => {
    setBottomDescriptions(prev => ({ ...prev, [index]: value }));
  };

  const displayImages = isUploadedGallery ? images : generatedImages;

  const hiddenInputStyle = {
    display: 'none'
  };

  const addBottomIconStyle = {
    border: "solid 1px #e5e7eb",
    padding: '8px 16px',
    borderRadius: '4px',
    cursor: isUploading ? 'not-allowed' : 'pointer',
    opacity: isUploading ? 0.7 : 1,
  };

  return (
    <>
      <div style={galleryStyle}>
        <div style={flexContainerStyle}>
          {displayImages && displayImages.map((image, index) => (
            <div key={index} style={imageContainerStyle}>
              <div style={frameStyle}>
                {/* Top garment image */}
                <img
                  src={isUploadedGallery ? image.url : image.generatedImage}
                  alt={`${isUploadedGallery ? 'Uploaded' : 'Generated'} image ${index + 1}`}
                  style={imageStyle}
                  onClick={() => openModal(isUploadedGallery ? image.url : image.generatedImage)}
                />
                {isUploadedGallery && (
                  <button
                    style={iconButtonStyle}
                    onClick={() => handleDeleteImage(index)}
                    title="Delete image"
                    disabled={isDeleting}
                  >
                    <FontAwesomeIcon icon={faTimes} />
                  </button>
                )}
                {!isUploadedGallery && (
                  <button
                    style={iconButtonStyle}
                    onClick={() => downloadImage(image.generatedImage, `generated_image_${index + 1}.png`)}
                    title="Download image"
                  >
                    <FontAwesomeIcon icon={faDownload} />
                  </button>
                )}
                <div style={inputContainerStyle}>
                  {isUploadedGallery ? (
                    <>
                      {/* Top garment description */}
                      <textarea
                        className={titillium.className}
                        placeholder="Garment"
                        value={descriptions[index] || ''}
                        onChange={(e) => handleDescriptionChange(index, e.target.value)}
                        onBlur={() => handleDescriptionBlur(index)}
                        style={inputStyle}
                      />
                      
                      {/* Bottom garment section */}
                      {(bottomImages[index] || (image.bottom && image.bottom.url)) && (
                        <>
                          <img 
                            src={bottomImages[index] || image.bottom.url} 
                            alt="Bottom garment" 
                            style={imageStyle}
                            onClick={() => openModal(bottomImages[index] || image.bottom.url)}
                          />
                          <textarea
                            className={titillium.className}
                            placeholder="Description of pants"
                            value={bottomDescriptions[index] || (image.bottom && image.bottom.description) || ''}
                            onChange={(e) => handleBottomDescriptionChange(index, e.target.value)}
                            style={inputStyle}
                          />
                        </>
                      )}

                      {/* Model description */}
                      <p className={titillium.className}>Human Prompt:</p>
                      <textarea
                        className={titillium.className}
                        placeholder="Manequene"
                        value={modelDescriptions[index] || ''}
                        onChange={(e) => handleModelDescriptionChange(index, e.target.value)}
                        onBlur={() => handleDescriptionBlur(index)}
                        style={inputStyle}
                      />
                      
                      {/* Upscale checkbox */}
                      <div style={checkboxContainerStyle}>
                        <input
                          type="checkbox"
                          id={`upscale-${index}`}
                          checked={upscaleChecked[index] === true}
                          onChange={(e) => handleUpscaleChange(index, e.target.checked)}
                        />
                        <label htmlFor={`upscale-${index}`} style={{ marginLeft: '0.5rem' }} className={titillium.className}>Upscale</label>
                      </div>

                      {/* Bottom upload section */}
                      {!bottomImages[index] && !image.bottom && (
                        <>
                          <input
                            type="file"
                            id={`bottomImageInput-${index}`}
                            onChange={(e) => handleBottomImageUpload(e, index)}
                            accept="image/*"
                            style={hiddenInputStyle}
                            disabled={isUploading}
                          />
                          <button 
                            style={addBottomIconStyle}
                            onClick={() => document.getElementById(`bottomImageInput-${index}`).click()}
                            title="Add bottom garment"
                            disabled={isUploading}
                          >
                            {isUploading ? 'Uploading...' : 'Bottom'}
                          </button>
                        </>
                      )}
                    </>
                  ) : (
                    <p className={titillium.className}>{image.description}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {modalImage && (
        <div style={modalStyle} onClick={closeModal}>
          <img src={modalImage} alt="Full size" style={modalImageStyle} />
        </div>
      )}
    </>
  );
}
