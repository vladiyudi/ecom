'use client';
import { useState, useEffect, use } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faDownload } from '@fortawesome/free-solid-svg-icons';

export default function ImageGallery({ images, generatedImages, isUploadedGallery, onUpdateDescription, onDeleteImage, titillium}) {
  const [descriptions, setDescriptions] = useState({});
  const [modelDescriptions, setModelDescriptions] = useState({});
  const [upscaleChecked, setUpscaleChecked] = useState({});
  const [modalImage, setModalImage] = useState(null);

  useEffect(() => {
    if (isUploadedGallery && images) {
      const initialDescriptions = {};
      const initialModelDescriptions = {};
      const initialUpscaleChecked = {};
      images.forEach((image, index) => {
        initialDescriptions[index] = image.description || '';
        initialModelDescriptions[index] = image.modelDescription || '';
        initialUpscaleChecked[index] = image.upscale || false;
      });
      setDescriptions(initialDescriptions);
      setModelDescriptions(initialModelDescriptions);
      setUpscaleChecked(initialUpscaleChecked);
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

  const galleryStyle = {
    width: '100%',
    overflowX: 'auto'
  };

  const flexContainerStyle = {
    display: 'flex',
    flexWrap: 'nowrap',
    gap: '1rem',
    padding: '1rem'
  };

  const imageContainerStyle = {
    flexShrink: 0,
    width: '20%',
    minWidth: '200px',
    position: 'relative'
  };

  const frameStyle = {
    backgroundColor: 'white',
    borderRadius: '0.5rem',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    overflow: 'hidden',
    border: '2px solid #e5e7eb'
  };

  const imageStyle = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    cursor: 'pointer'
  };

  const inputContainerStyle = {
    display: 'flex',
    flexDirection: 'column',
    padding: '1rem',
    paddingInlineEnd: '2rem'
  };

  const inputStyle = {
    width: '100%',
    padding: '0.5rem',
    fontSize: '0.875rem',
    border: '1px solid #d1d5db',
    borderRadius: '0.25rem',
    outline: 'none',
    marginBottom: '0.5rem'
  };

  const checkboxContainerStyle = {
    display: 'flex',
    alignItems: 'center',
    marginTop: '0.5rem'
  };

  const iconButtonStyle = {
    position: 'absolute',
    top: '0.5rem',
    right: '0.5rem',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    border: 'none',
    borderRadius: '50%',
    width: '2rem',
    height: '2rem',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
    fontSize: '1rem',
    color: '#4a5568',
    transition: 'background-color 0.2s',
  };

  const modalStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000
  };

  const modalImageStyle = {
    maxWidth: '90%',
    maxHeight: '90%',
    objectFit: 'contain'
  };

  const displayImages = isUploadedGallery ? images : generatedImages;

  return (
    <>
      <div style={galleryStyle}>
        <div style={flexContainerStyle}>
          {displayImages && displayImages.map((image, index) => (
            <div key={index} style={imageContainerStyle}>
              <div style={frameStyle}>
                <img
                  src={isUploadedGallery ? image.url : image.generatedImage}
                  alt={`${isUploadedGallery ? 'Uploaded' : 'Generated'} image ${index + 1}`}
                  style={imageStyle}
                  onClick={() => openModal(isUploadedGallery ? image.url : image.generatedImage)}
                />
                {isUploadedGallery && (
                  <button
                    style={iconButtonStyle}
                    onClick={() => onDeleteImage(index)}
                    title="Delete image"
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
                      <textarea
                        className={titillium.className}
                        placeholder="Garment"
                        value={descriptions[index] || ''}
                        onChange={(e) => handleDescriptionChange(index, e.target.value)}
                        onBlur={() => handleDescriptionBlur(index)}
                        style={inputStyle}
                      />
                      <textarea
                        className={titillium.className}
                        placeholder="Manequene"
                        value={modelDescriptions[index] || ''}
                        onChange={(e) => handleModelDescriptionChange(index, e.target.value)}
                        onBlur={() => handleDescriptionBlur(index)}
                        style={inputStyle}
                      />
                      <div style={checkboxContainerStyle}>
                        <input
                          type="checkbox"
                          id={`upscale-${index}`}
                          checked={upscaleChecked[index] === true}
                          onChange={(e) => handleUpscaleChange(index, e.target.checked)}
                        />
                        <label htmlFor={`upscale-${index}`} style={{ marginLeft: '0.5rem' }} className={titillium.className}>Upscale</label>
                      </div>
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
