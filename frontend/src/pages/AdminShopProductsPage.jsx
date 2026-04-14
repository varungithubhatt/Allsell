import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import ImageLightbox from "../components/ImageLightbox";
import { productsApi, shopsApi } from "../services/api";

function AdminShopProductsPage() {
  const { shopId } = useParams();
  const [shop, setShop] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingProductId, setEditingProductId] = useState("");
  const [form, setForm] = useState({ title: "", price: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [activeImage, setActiveImage] = useState("");

  const fetchShopProducts = async () => {
    setLoading(true);
    try {
      const response = await shopsApi.getById(shopId);
      setShop(response.data.shop);
      setProducts(response.data.products || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShopProducts();
  }, [shopId]);

  const clearFeedback = () => {
    setMessage("");
    setError("");
  };

  const startEdit = (product) => {
    clearFeedback();
    setEditingProductId(product._id);
    setForm({ title: product.title, price: product.price });
  };

  const cancelEdit = () => {
    setEditingProductId("");
    setForm({ title: "", price: "" });
  };

  const handleChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleUpdate = async (event) => {
    event.preventDefault();
    if (!editingProductId) return;

    clearFeedback();
    setSaving(true);

    try {
      await productsApi.update(editingProductId, {
        title: form.title,
        price: Number(form.price),
      });
      setMessage("Product updated successfully");
      cancelEdit();
      await fetchShopProducts();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (productId) => {
    clearFeedback();
    setSaving(true);

    try {
      await productsApi.remove(productId);
      setMessage("Product deleted successfully");
      if (editingProductId === productId) {
        cancelEdit();
      }
      await fetchShopProducts();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="stack-gap">
      <div className="card">
        <h1>Shop Products (Admin)</h1>
        <p>
          <Link to="/admin/shops">Back to all shops</Link>
        </p>
        {shop && (
          <>
            <p>
              <strong>{shop.name}</strong>
            </p>
            <p>{shop.description || "No description"}</p>
          </>
        )}
        {message && <p className="success-text">{message}</p>}
        {error && <p className="error-text">{error}</p>}
      </div>

      <div className="card">
        <h2>Products</h2>
        {loading ? (
          <p>Loading products...</p>
        ) : products.length === 0 ? (
          <p>No products in this shop.</p>
        ) : (
          <ul className="list-grid">
            {products.map((product) => (
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
                {(product.imageUrls?.length > 0 || product.imageUrl) && (
                  <small>Click image to view full size</small>
                )}
                <div className="row-buttons">
                  <button type="button" className="btn-secondary" onClick={() => startEdit(product)}>
                    Edit
                  </button>
                  <button
                    type="button"
                    className="btn-danger"
                    onClick={() => handleDelete(product._id)}
                    disabled={saving}
                  >
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
              <input name="title" value={form.title} onChange={handleChange} required disabled={saving} />
            </label>
            <label>
              Price
              <input
                name="price"
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={handleChange}
                required
                disabled={saving}
              />
            </label>
            <div className="row-buttons">
              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? "Saving..." : "Update Product"}
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

export default AdminShopProductsPage;
