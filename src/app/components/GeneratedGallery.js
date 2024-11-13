'use client';
import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload } from '@fortawesome/free-solid-svg-icons';
import {galleryStyle, flexContainerStyle, imageContainerStyle, frameStyle, imageStyle, inputContainerStyle, inputStyle, modalStyle, modalImageStyle, iconButtonStyle} from '../utils/styles';
import ShinyButton from '@/components/ui/shiny-button';

export default function GeneratedGallery({ collections, onUpdateDescription, onUpdateCollectionName, onDeleteCollection, onDownloadCollection, titillium }) {
  const [modalImage, setModalImage] = useState(null);

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

  const formatDate = (date) => {
    return new Date(date).toLocaleString();
  };

  // Create a mapping of sorted indices to original indices
  const sortedIndices = [...(collections || [])].map((_, index) => index)
    .sort((a, b) => new Date(collections[b].date) - new Date(collections[a].date));

  // Create reverse mapping from sorted to original indices
  const originalIndices = sortedIndices.reduce((map, originalIndex, sortedIndex) => {
    map[sortedIndex] = originalIndex;
    return map;
  }, {});

  const handleCollectionNameChange = (index, e) => {
    const newValue = e.target.value;
    if (onUpdateCollectionName) {
      onUpdateCollectionName(index, newValue);
    }
  };

  return (
    <>
      <div style={galleryStyle}>
        {sortedIndices.map((originalIndex, sortedIndex) => {
          const collection = collections[originalIndex];
          return (
            <div key={collection._id || originalIndex} className="mb-8">
              <div className="flex items-center justify-start gap-4 mb-4">
                <div className="flex items-baseline gap-4">
                 
                  <input
                    type="text"
                    placeholder="Collection Name"
                    defaultValue={collection.name}
                    onInput={(e) => handleCollectionNameChange(originalIndex, e)}
                    className={`${titillium.className} px-3 py-1 rounded-md`}
                    style={{
                      border: 'none',
                      fontSize: '1.3rem',
                      outline: 'none'
                    }}
                  />
                   <span className="text-sm text-gray-500">{formatDate(collection.date)}</span>
                </div>
                <div className="flex gap-1">
                 
                  <ShinyButton
                    onClick={() => onDownloadCollection && onDownloadCollection(collection)}
                    className="border border-gray-300 "
                  >
                    download collection
                  </ShinyButton>
                  <ShinyButton
                    onClick={() => onDeleteCollection && onDeleteCollection(originalIndex)}
                      className="border border-gray-300 "
                  >
                    delete collection
                  </ShinyButton>
                </div>
              </div>
              <div style={flexContainerStyle}>
                {collection.images.map((image, imageIndex) => (
                  <div key={`${image.imageUrl}-${imageIndex}`} style={imageContainerStyle}>
                    <div style={frameStyle}>
                      <img
                        src={image.imageUrl}
                        alt={`Generated image ${imageIndex + 1}`}
                        style={imageStyle}
                        onClick={() => openModal(image.imageUrl)}
                      />
                      <button
                        style={iconButtonStyle}
                        onClick={() => downloadImage(image.imageUrl, `generated_image_${originalIndex}_${imageIndex}.png`)}
                        title="Download image"
                      >
                        <FontAwesomeIcon icon={faDownload} />
                      </button>
                      <div style={inputContainerStyle}>
                        <textarea
                          className={`${titillium.className} mb-3`}
                          placeholder="Description"
                          value={image.description || ''}
                          onChange={(e) => onUpdateDescription && onUpdateDescription(originalIndex, imageIndex, e.target.value)}
                          style={inputStyle}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      {modalImage && (
        <div style={modalStyle} onClick={closeModal}>
          <img src={modalImage} alt="Full size" style={modalImageStyle} />
        </div>
      )}
    </>
  );
}
