'use client';

import { useRef, useState } from 'react';
import backgroundImage from '../images/1.png';


export default function ImageUpload({ onUpload, titillium }) {
  const [error, setError] = useState('');
  const [isHovered, setIsHovered] = useState(false);
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
      formData.append('upscale', 'true'); // Set upscale to true by default
    });

    if (validFiles.length > 0) {
      onUpload(formData);
    }
  };

  const containerStyle = {
    marginBottom: '2rem',
  };

  const dropzoneStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '200px',
    borderRadius: '0.5rem',
    cursor: 'pointer',
    backgroundColor: '#f3f4f6',
    backgroundImage: `url(${backgroundImage.src})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    transition: 'all 0.3s ease-in-out',
    boxShadow: isHovered ? '0 0 20px 5px rgba(192, 192, 192, 0.7)' : 'none',
    transform: isHovered ? 'scale(1.02)' : 'scale(1)',
  };

  const dropzoneTextStyle = {
    marginBottom: '0.5rem',
    fontSize: '0.875rem',
    color: 'white',
    textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
    transition: 'all 0.3s ease-in-out',
    opacity: isHovered ? '1' : '0.9',
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
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
      <div className='border p-3 rounded-2xl bg-black/60 flex flex-col justify-center items-center hover:bg-black/60 hover:cursor-pointer hover:scale-105'>
        <p style={dropzoneTextStyle}>
          <span style={{ fontWeight: 'bold' }} className={titillium.className}>CLICK to UPLOAD</span> 
        </p>
        <p style={dropzoneTextStyle} className={titillium.className}>Only JPEG or PNG, up to 10MB</p>
        <p style={dropzoneTextStyle} className={titillium.className}>Filenames should not contain spaces</p>
        </div>
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
