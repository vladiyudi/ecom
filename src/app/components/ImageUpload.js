'use client';

import { useRef, useState } from 'react';

export default function ImageUpload({ onUpload, titillium }) {
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const formData = new FormData();
    
    const validFiles = files.filter(file => {
      const fileType = file.type.toLowerCase();
      const fileName = file.name.toLowerCase();
      if (!(fileType === 'image/jpeg' || fileType === 'image/png')) {
        setError('Only JPEG and PNG files are allowed.');
        return false;
      }
      if (fileName.includes(' ')) {
        setError('Filenames should not contain spaces.');
        return false;
      }
      return true;
    });

    if (validFiles.length !== files.length) {
      setError('Some files were not added. Please check the file types and names.');
    } else {
      setError('');
    }

    validFiles.forEach((file, index) => {
      formData.append('images', file);
      formData.append('descriptions', ''); // Empty description for now
      formData.append('modelDescriptions', ''); // Empty model description
      formData.append('upscale', 'false'); // Default upscale flag
    });

    if (validFiles.length > 0) {
      onUpload(formData);
    }
  };

  const containerStyle = {
    marginBottom: '2rem'
  };

  const dropzoneStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '200px',
    border: '2px dashed #d1d5db',
    borderRadius: '0.5rem',
    cursor: 'pointer',
    backgroundColor: '#f3f4f6'
  };

  const dropzoneTextStyle = {
    marginBottom: '0.5rem',
    fontSize: '0.875rem',
    color: '#4b5563'
  };

  const errorStyle = {
    color: 'red',
    marginTop: '0.5rem',
    fontSize: '0.875rem'
  };

  return (
    <div style={containerStyle}>
      <div
        style={dropzoneStyle}
        onClick={() => fileInputRef.current.click()}
      >
        <p style={dropzoneTextStyle}>
          <span style={{ fontWeight: 'bold' }} className={titillium.className}>Click to upload</span> or drag and drop
        </p>
        <p style={dropzoneTextStyle} className={titillium.className}>Only JPEG or PNG, up to 10MB</p>
        <p style={dropzoneTextStyle} className={titillium.className}>Filenames should not contain spaces</p>
      </div>
      <input
        type="file"
        accept="image/jpeg,image/png"
        multiple
        onChange={handleFileChange}
        ref={fileInputRef}
        style={{ display: 'none' }}
      />
      
      {error && <p style={errorStyle}>{error}</p>}
    </div>
  );
}