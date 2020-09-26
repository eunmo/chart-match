import React from 'react';

function replaceUrl(url, size) {
  const sizeString = `${size}`;
  return url.replace('{w}', sizeString).replace('{h}', sizeString);
}

export default ({ url, size = 50 }) => {
  const imageUrl = replaceUrl(url, size);
  const srcset = [1, 2, 3]
    .map((n) => `${replaceUrl(url, size * n)} ${n}x`)
    .join(',');
  return (
    <div style={{ width: size, height: size }}>
      <img
        src={imageUrl}
        srcSet={srcset}
        alt={url}
        style={{ borderRadius: '50%' }}
      />
    </div>
  );
};
