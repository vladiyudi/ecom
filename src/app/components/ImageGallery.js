'use client';
import UploadedGallery from './UploadedGallery';
import GeneratedGallery from './GeneratedGallery';

export default function ImageGallery({ images, generatedImages, isUploadedGallery, onUpdateDescription, onDeleteImage, onRefreshImages, titillium }) {
  if (isUploadedGallery) {
    return (
      <UploadedGallery
        images={images}
        onUpdateDescription={onUpdateDescription}
        onDeleteImage={onDeleteImage}
        onRefreshImages={onRefreshImages}
        titillium={titillium}
      />
    );
  }

  return (
    <GeneratedGallery
      images={generatedImages}
      onUpdateDescription={onUpdateDescription}
      titillium={titillium}
    />
  );
}
