import { useState } from "react";

import ImageLightbox from "../components/ImageLightbox";

function ExplorePage({ products, loading }) {
  const [activeImage, setActiveImage] = useState("");
  return (
    <section className="stack-gap">
      <div className="card">
        <h1>Explore Products</h1>
        {loading ? (
          <p>Loading products...</p>
        ) : products.length === 0 ? (
          <p>No products available.</p>
        ) : (
          <ul className="list-grid">
            {products.map((product) => (
              <li key={product._id} className="list-card">
                <h3>{product.title}</h3>
                <p>Price: ${product.price}</p>
                <p>Shop: {product.shop?.name || "Unknown shop"}</p>
                {Array.isArray(product.imageUrls) && product.imageUrls.length > 0 && (
                  <div className="product-images-grid">
                    {product.imageUrls.map((imageUrl, index) => (
                      <img
                        key={`${product._id}-img-${index}`}
                        src={imageUrl}
                        alt={`${product.title} ${index + 1}`}
                        className="product-image-preview clickable-image"
                        onClick={() => setActiveImage(imageUrl)}
                      />
                    ))}
                  </div>
                )}
                {!product.imageUrls?.length && product.imageUrl && (
                  <div className="product-images-grid">
                    <img
                      src={product.imageUrl}
                      alt={product.title}
                      className="product-image-preview clickable-image"
                      onClick={() => setActiveImage(product.imageUrl)}
                    />
                  </div>
                )}
                {(product.imageUrls?.length > 0 || product.imageUrl) && (
                  <small>Click image to view full size</small>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      <ImageLightbox imageUrl={activeImage} altText="Product image" onClose={() => setActiveImage("")} />
    </section>
  );
}

export default ExplorePage;
