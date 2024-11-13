'use client';
import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faDownload, faArrowDown, faTrash } from '@fortawesome/free-solid-svg-icons';
import {galleryStyle, flexContainerStyle, imageContainerStyle, frameStyle, imageStyle, inputContainerStyle, inputStyle, checkboxContainerStyle, modalStyle, modalImageStyle, iconButtonStyle, modelPromptStyle} from '../utils/styles';
import { Switch } from "@/components/ui/switch"
import ShinyButton from "@/components/ui/shiny-button";
import HyperText from "@/components/ui/hyper-text";

export default function ImageGallery({ images: initialImages, generatedImages, isUploadedGallery, onUpdateDescription, onDeleteImage, onRefreshImages, titillium}) {
  const [modalImage, setModalImage] = useState(null);
  const [uploadingStates, setUploadingStates] = useState({});
  const [isDeleting, setIsDeleting] = useState(false);

  const displayImages = isUploadedGallery ? initialImages : generatedImages;

  const handleDeleteImage = async (itemId) => {
    if (isDeleting || !itemId) return;
    
    try {
      setIsDeleting(true);
      if (onDeleteImage) {
        await onDeleteImage(itemId);
      }
    } catch (error) {
      console.error('Error deleting image:', error);
      alert('Failed to delete image. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteAll = async () => {
    if (isDeleting) return;
    
    try {
      setIsDeleting(true);
      const response = await fetch('/api/deleteImage', {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete all images');
      }
      
      if (onRefreshImages) {
        await onRefreshImages();
      }
    } catch (error) {
      console.error('Error deleting all images:', error);
      alert('Failed to delete all images. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleBottomImageUpload = async (event, itemId) => {
    const files = event.target.files;
    if (!files || !itemId) return;

    try {
      setUploadingStates(prev => ({ ...prev, [itemId]: true }));

      for (let i = 0; i < files.length; i++) {
        const formData = new FormData();
        formData.append('image', files[i]);
        formData.append('description', '');
        formData.append('itemId', itemId);

        const response = await fetch('/api/uploadBottom', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Failed to upload bottom image');
        }
      }

      if (onRefreshImages) {
        await onRefreshImages();
      }

    } catch (error) {
      console.error('Error uploading bottom image:', error);
      alert('Failed to upload bottom image. Please try again.');
    } finally {
      setUploadingStates(prev => ({ ...prev, [itemId]: false }));
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

  const hiddenInputStyle = {
    display: 'none'
  };

  const addBottomIconStyle = {
    border: "solid 1px #e5e7eb",
    padding: '8px 16px',
    borderRadius: '4px',
    cursor: 'pointer',
    opacity: 1,
    marginTop: '5px'
  };

  const deleteAllButtonStyle = {
    ...addBottomIconStyle,
    backgroundColor: '#ef4444',
    color: 'white',
    marginBottom: '20px',
    cursor: isDeleting ? 'not-allowed' : 'pointer',
    opacity: isDeleting ? 0.7 : 1,
  };

  return (
    <>
      {isUploadedGallery && displayImages && displayImages.length > 0 && (
        <button
          style={deleteAllButtonStyle}
          onClick={handleDeleteAll}
          disabled={isDeleting}
          className={titillium.className}
        >
          <FontAwesomeIcon icon={faTrash} /> Delete All
        </button>
      )}
      <div style={galleryStyle}>
        <div style={flexContainerStyle}>
          {displayImages && displayImages.map((image, index) => (
            <div key={image._id || `${image.url}-${index}`} style={imageContainerStyle}>
              <div style={frameStyle}>
                <img
                  src={isUploadedGallery ? image.url : image.generatedImage}
                  alt={`${isUploadedGallery ? 'Uploaded' : 'Generated'} image ${index + 1}`}
                  style={imageStyle}
                  onClick={() => openModal(isUploadedGallery ? image.url : image.generatedImage)}
                />
                {isUploadedGallery && image._id && (
                  <button
                    style={iconButtonStyle}
                    onClick={() => handleDeleteImage(image._id)}
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
                      <textarea
                        className={`${titillium.className} mb-3`}
                        placeholder="Garment"
                        value={image.description || ''}
                        onChange={(e) => onUpdateDescription(index, e.target.value, image.modelDescription, image.upscale, image.bottom)}
                        style={inputStyle}
                      />
                      
                      {image.bottom && (
                        <>
                          <img 
                            src={image.bottom.url} 
                            alt="Bottom garment" 
                            style={imageStyle}
                            onClick={() => openModal(image.bottom.url)}
                          />
                          <textarea
                            className={titillium.className}
                            placeholder="Description of pants"
                            value={image.bottom.description || ''}
                            onChange={(e) => {
                              const updatedBottom = {
                                ...image.bottom,
                                description: e.target.value
                              };
                              onUpdateDescription(index, image.description, image.modelDescription, image.upscale, updatedBottom);
                            }}
                            style={inputStyle}
                          />
                        </>
                      )}
                      <div className='flex flex-col items-center'>
                        <HyperText text={"Prompt"} />
                        <textarea
                          className={titillium.className}
                          placeholder="Manequene"
                          value={image.modelDescription || ''}
                          onChange={(e) => onUpdateDescription(index, image.description, e.target.value, image.upscale, image.bottom)}
                          style={modelPromptStyle}
                        />
                      </div>
                      <div style={checkboxContainerStyle}>
                        <label htmlFor={`upscale-${index}`} style={{ marginLeft: '0.5rem', marginRight: '0.5rem' }} className={titillium.className}>Speed</label>
                        <Switch id={`upscale-${index}`}
                         className="data-[state=checked]:bg-green-700 data-[state=unchecked]:bg-gray-400"
                          checked={image.upscale === true}
                          onCheckedChange={(e) => {
                            onUpdateDescription(index, image.description, image.modelDescription, e, image.bottom)}} />
                        <label htmlFor={`upscale-${index}`} style={{ marginLeft: '0.5rem' }} className={titillium.className}>Quality</label>
                      </div>

                      {!image.bottom && image._id && (
                        <>
                          <input
                            type="file"
                            id={`bottomImageInput-${image._id}`}
                            onChange={(e) => handleBottomImageUpload(e, image._id)}
                            accept="image/*"
                            style={hiddenInputStyle}
                            multiple
                            disabled={uploadingStates[image._id]}
                          />
                          <ShinyButton 
                            className={titillium.className}
                            style={{
                              ...addBottomIconStyle,
                              cursor: uploadingStates[image._id] ? 'not-allowed' : 'pointer',
                              opacity: uploadingStates[image._id] ? 0.7 : 1,
                            }}
                            onClick={() => document.getElementById(`bottomImageInput-${image._id}`).click()}
                            title="Add bottom garment"
                            disabled={uploadingStates[image._id]}
                          >
                            {uploadingStates[image._id] ? 'Uploading...' : 'Add Bottom'}
                          </ShinyButton>
                        </>
                      )}
                    </>
                  ) : (
                    <>
                      <textarea
                        className={`${titillium.className} mb-3`}
                        placeholder="Top Description"
                        value={image.description || ''}
                        onChange={(e) => onUpdateDescription && onUpdateDescription(index, e.target.value, image.modelDescription, image.upscale)}
                        style={inputStyle}
                      />
                      <textarea
                        className={`${titillium.className} mb-3`}
                        placeholder="Bottom Description"
                        value={image.bottomDescription || ''}
                        onChange={(e) => onUpdateDescription && onUpdateDescription(index, image.description, image.modelDescription, image.upscale, { description: e.target.value })}
                        style={inputStyle}
                      />
                    </>
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
