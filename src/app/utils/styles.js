export const mainStyle = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '2rem 1rem'
  };

  export const headingStyle = {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    marginBottom: '2rem',
    textAlign: 'center',
    color: '#1f2937'
  };

  export const sectionStyle = {
    marginBottom: '2rem'
  };

  export const subHeadingStyle = {
    fontSize: '1.5rem',
    fontWeight: '600',
    marginBottom: '1rem',
    color: '#374151'
  };

  export const buttonStyle = {
    backgroundColor: '#3b82f6',
    color: 'white',
    fontWeight: 'bold',
    padding: '0.75rem 1.5rem',
    borderRadius: '0.375rem',
    border: 'none',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
    marginRight: '0.5rem'
  };

  export const disabledButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#9ca3af',
    cursor: 'not-allowed'
  };

  export const deleteButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#ef4444'
  };

  export const loaderContainerStyle = {
    textAlign: 'center',
    marginTop: '1rem'
  };

  export const loaderTextStyle = {
    fontSize: '1.125rem',
    color: '#4b5563',
    marginBottom: '0.5rem'
  };


  // Image Galery 

  export const galleryStyle = {
    width: '100%',
    overflowX: 'auto'
  };

  export const flexContainerStyle = {
    display: 'flex',
    flexWrap: 'nowrap',
    gap: '1rem',
    padding: '1rem'
  };

  export const imageContainerStyle = {
    flexShrink: 0,
    width: '20%',
    minWidth: '200px',
    position: 'relative'
  };

  export const frameStyle = {
    backgroundColor: 'white',
    borderRadius: '0.5rem',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    overflow: 'hidden',
    border: '2px solid #e5e7eb'
  };

  export const imageStyle = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    cursor: 'pointer'
  };

  export const inputContainerStyle = {
    display: 'flex',
    flexDirection: 'column',
    // padding: '1rem',
    // paddingInlineEnd: '2rem'
  };

  export const inputStyle = {
    width: '100%',
    padding: '0.5rem',
    fontSize: '0.875rem',
    border: '1px solid #d1d5db',
    borderRadius: '0.25rem',
    outline: 'none',
    // marginBottom: '0.5rem',
    // marginRight: '0.5rem',
    // marginLeft: '0.5rem',
    // margin: '0.5rem',
    border: 'none',
    textAlign: 'center'
  };

  export const modelPromptStyle = {
    width: '100%',
    padding: '0 0.5rem',
    fontSize: '0.875rem',
    border: '1px solid #d1d5db',
    borderRadius: '0.25rem',
    outline: 'none',
    height: '110px',
    // marginBottom: '0.5rem',
    // marginRight: '0.5rem',
    // marginLeft: '0.5rem',
    // margin: '0.5rem',
    border: 'none',
    textAlign: 'center'
  };

  export const checkboxContainerStyle = {
    display: 'flex',
    alignItems: 'center',
    marginTop: '0.5rem',
    // border: '1px solid #d1d5db',
    justifyContent: 'center',
    marginBottom: '0.5rem',
  };

  export const iconButtonStyle = {
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

  export const modalStyle = {
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

  export const modalImageStyle = {
    maxWidth: '90%',
    maxHeight: '90%',
    objectFit: 'contain'
  };