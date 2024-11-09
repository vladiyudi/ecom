'use client';
import { useState, useEffect, use } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faDownload } from '@fortawesome/free-solid-svg-icons';
import {galleryStyle, flexContainerStyle, imageContainerStyle, frameStyle, imageStyle, inputContainerStyle, inputStyle, checkboxContainerStyle, modalStyle, modalImageStyle, iconButtonStyle} from '../utils/styles';

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