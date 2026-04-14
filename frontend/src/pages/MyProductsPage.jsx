import { useMemo, useState } from "react";

import ImageLightbox from "../components/ImageLightbox";
import { productsApi } from "../services/api";

function MyProductsPage({ user, shops, products, onProductsRefresh, loading }) {
  const [editingProductId, setEditingProductId] = useState("");
  const [editForm, setEditForm] = useState({ title: "", price: "", imageFiles: [] });
  const [selectedImages, setSelectedImages] = useState([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [activeImage, setActiveImage] = useState("");

  const myShop = useMemo(
    () => shops.find((shop) => shop.owner?._id === user?.id),
    [shops, user?.id]
  );

  const myProducts = useMemo(
    () => products.filter((product) => product.shop?._id === myShop?._id),
    [products, myShop?._id]
  );

  const clearFeedback = () => {
    setMessage("");
    setError("");
  };

  const cleanupSelectedImages = () => {
    selectedImages.forEach((item) => URL.revokeObjectURL(item.previewUrl));
  };

  const startEdit = (product) => {
    clearFeedback();
    cleanupSelectedImages();
    setSelectedImages([]);
    setEditingProductId(product._id);
    setEditForm({
      title: product.title,
      price: product.price,
      imageFiles: [],
    });
  };

  const cancelEdit = () => {
    cleanupSelectedImages();
    setSelectedImages([]);
    setEditingProductId("");
    setEditForm({ title: "", price: "", imageFiles: [] });
  };

  const handleFormChange = (event) => {
    setEditForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleImageChange = (event) => {
    clearFeedback();
    const incomingFiles = Array.from(event.target.files || []);
    if (incomingFiles.length === 0) {
      return;
    }

    const currentCount = selectedImages.length;
    const remainingSlots = 3 - currentCount;

    if (remainingSlots <= 0) {
      setError("You can upload at most 3 images");
      event.target.value = "";
      return;
    }

    const acceptedFiles = incomingFiles.slice(0, remainingSlots);
    if (incomingFiles.length > remainingSlots) {
      setError("Only first 3 images are kept");
    }

    const previews = acceptedFiles.map((file) => ({
      id: `${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2, 8)}`,
      file,
      previewUrl: URL.createObjectURL(file),
    }));

    setSelectedImages((prev) => [...prev, ...previews]);
    setEditForm((prev) => ({
      ...prev,
      imageFiles: [...prev.imageFiles, ...acceptedFiles],
    }));

    event.target.value = "";
  };

  const handleRemoveSelectedImage = (previewId) => {
    clearFeedback();
    const previewToRemove = selectedImages.find((item) => item.id === previewId);
    if (!previewToRemove) {
      return;
    }

    URL.revokeObjectURL(previewToRemove.previewUrl);

    setSelectedImages((prev) => prev.filter((item) => item.id !== previewId));
    setEditForm((prev) => ({
      ...prev,
      imageFiles: prev.imageFiles.filter((file) => file !== previewToRemove.file),
    }));
  };

  const handleUpdate = async (event) => {
    event.preventDefault();
    if (!editingProductId) {
      return;
    }

    clearFeedback();
    setSaving(true);

    try {
      await productsApi.update(editingProductId, {
        title: editForm.title,
        price: Number(editForm.price),
        imageFiles: editForm.imageFiles,
      });

      setMessage("Product updated successfully");
      cancelEdit();
      await onProductsRefresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (productId) => {
    clearFeedback();

    try {
      await productsApi.remove(productId);
      setMessage("Product deleted successfully");
      if (editingProductId === productId) {
        cancelEdit();
      }
      await onProductsRefresh();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <section className="stack-gap">
      <div className="card">
        <h1>My Products</h1>
        {!myShop && <p className="error-text">Create a shop first before managing products.</p>}
        {message && <p className="success-text">{message}</p>}
        {error && <p className="error-text">{error}</p>}
      </div>

      <div className="card">
        <h2>Products List</h2>
        {loading ? (
          <p>Loading products...</p>
        ) : myProducts.length === 0 ? (
          <p>No products yet.</p>
        ) : (
          <ul className="list-grid">
            {myProducts.map((product) => (
              <li key={product._id} className="list-card">
                <h3>{product.title}</h3>
                <p>${product.price}</p>
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
                {Array.isArray(product.imageUrls) && product.imageUrls.length > 0 && (
                  <p>{product.imageUrls.length} image(s) uploaded</p>
                )}
                {!product.imageUrls?.length && product.imageUrl && <p>1 image uploaded</p>}
                {(product.imageUrls?.length > 0 || product.imageUrl) && (
                  <small>Click image to view full size</small>
                )}
                <div className="row-buttons">
                  <button className="btn-secondary" type="button" onClick={() => startEdit(product)}>
                    Edit
                  </button>
                  <button className="btn-danger" type="button" onClick={() => handleDelete(product._id)}>
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {editingProductId && (
        <div className="card">
          <h2>Edit Product</h2>
          <form className="form-grid" onSubmit={handleUpdate}>
            <label>
              Title
              <input
                name="title"
                value={editForm.title}
                onChange={handleFormChange}
                required
                disabled={saving}
              />
            </label>

            <label>
              Price
              <input
                name="price"
                type="number"
                min="0"
                step="0.01"
                value={editForm.price}
                onChange={handleFormChange}
                required
                disabled={saving}
              />
            </label>

            <label>
              Replace Images (optional, max 3)
              <input
                name="images"
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                disabled={saving}
              />
            </label>

            {selectedImages.length > 0 && (
              <div className="selected-images-grid">
                {selectedImages.map((item) => (
                  <div key={item.id} className="selected-image-item">
                    <button
                      type="button"
                      className="remove-image-btn"
                      onClick={() => handleRemoveSelectedImage(item.id)}
                      aria-label="Remove image"
                      disabled={saving}
                    >
                      x
                    </button>
                    <img src={item.previewUrl} alt={item.file.name} className="selected-image-preview" />
                  </div>
                ))}
              </div>
            )}

            <div className="row-buttons">
              <button className="btn-primary" type="submit" disabled={saving}>
                {saving ? "Updating..." : "Update Product"}
              </button>
              <button type="button" className="btn-secondary" onClick={cancelEdit} disabled={saving}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <ImageLightbox imageUrl={activeImage} altText="Product image" onClose={() => setActiveImage("")} />
    </section>
  );
}

export default MyProductsPage;
