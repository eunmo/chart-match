function replaceUrl(url, size) {
  const sizeString = `${size}`;
  return url.replace('{w}', sizeString).replace('{h}', sizeString);
}

export default function Image({ url, isNew = false, size = 50 }) {
  const imageUrl = replaceUrl(url, size);
  const srcset = [1, 2, 3]
    .map((n) => `${replaceUrl(url, size * n)} ${n}x`)
    .join(',');
  const style = {};
  if (!isNew) {
    style.borderRadius = '50%';
  }
  return (
    <div style={{ width: size, height: size }}>
      <img src={imageUrl} srcSet={srcset} alt={url} style={style} />
    </div>
  );
}
