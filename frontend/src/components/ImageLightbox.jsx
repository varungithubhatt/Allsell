function ImageLightbox({ imageUrl, altText, onClose }) {
  if (!imageUrl) {
    return null;
  }

  return (
    <div className="lightbox-backdrop" onClick={onClose} role="button" tabIndex={0}>
      <div className="lightbox-content" onClick={(event) => event.stopPropagation()}>
        <button type="button" className="lightbox-close" onClick={onClose} aria-label="Close image preview">
          x
        </button>
        <img src={imageUrl} alt={altText || "Preview image"} className="lightbox-image" />
      </div>
    </div>
  );
}

export default ImageLightbox;
