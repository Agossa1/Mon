import React from 'react';

const PlaceholderImage = ({ width, height, text }) => {
  return (
    <div
      style={{
        width: width,
        height: height,
        backgroundColor: '#e0e0e0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#333',
        fontSize: '1rem',
        textAlign: 'center',
        border: '1px solid #ccc',
        borderRadius: '4px',
      }}
    >
      {text}
    </div>
  );
};

export default PlaceholderImage;