import { useMemo, useState } from "react";

import { productsApi, shopsApi } from "../services/api";

const emptyProduct = { title: "", price: "", imageFiles: [] };

function DashboardPage({ user, shops, onProductsRefresh, loading }) {
  const [shopForm, setShopForm] = useState({ name: "", description: "" });
  const [editingShop, setEditingShop] = useState(false);
  const [productForm, setProductForm] = useState(emptyProduct);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [selectedImages, setSelectedImages] = useState([]);

  const myShop = useMemo(
    () => shops.find((shop) => shop.owner?._id === user?.id),
    [shops, user?.id]
  );

  const clearFeedback = () => {
    setMessage("");
    setError("");
  };

  const handleFormChange = (event) => {
    setProductForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleShopFormChange = (event) => {
    setShopForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
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
    setProductForm((prev) => ({
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
    setProductForm((prev) => ({
      ...prev,
      imageFiles: prev.imageFiles.filter((file) => file !== previewToRemove.file),
    }));
  };

  const resetForm = () => {
    selectedImages.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    setProductForm(emptyProduct);
    setSelectedImages([]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    clearFeedback();
    setSaving(true);

    const payload = {
      title: productForm.title,
      price: Number(productForm.price),
      imageFiles: productForm.imageFiles,
    };

    try {
      await productsApi.create(payload);
      setMessage("Product created successfully");

      resetForm();
      await onProductsRefresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCreateShop = async (event) => {
    event.preventDefault();
    clearFeedback();
    setSaving(true);

    try {
      await shopsApi.create(shopForm);
      setMessage("Shop created successfully");
      setShopForm({ name: "", description: "" });
      await onProductsRefresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleStartEditShop = () => {
    if (!myShop) {
      return;
    }
    clearFeedback();
    setEditingShop(true);
    setShopForm({
      name: myShop.name,
      description: myShop.description || "",
    });
  };

  const handleUpdateShop = async (event) => {
    event.preventDefault();
    if (!myShop) {
      return;
    }

    clearFeedback();
    setSaving(true);

    try {
      await shopsApi.update(myShop._id, shopForm);
      setMessage("Shop updated successfully");
      setEditingShop(false);
      await onProductsRefresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteShop = async () => {
    if (!myShop) {
      return;
    }

    clearFeedback();
    setSaving(true);

    try {
      await shopsApi.remove(myShop._id);
      setMessage("Shop deleted successfully");
      setEditingShop(false);
      setShopForm({ name: "", description: "" });
      await onProductsRefresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="stack-gap">
      <div className="card">
        <h1>Add Products</h1>
        <p>
          Welcome, <strong>{user?.name}</strong> ({user?.email})
        </p>
        <p>Role: {user?.role}</p>
      </div>

      <div className="card">
        <h2>My Shop</h2>
        {loading ? (
          <p>Loading shop data...</p>
        ) : myShop ? (
          <>
            {!editingShop ? (
              <>
                <p>
                  <strong>{myShop.name}</strong>
                </p>
                <p>{myShop.description || "No description"}</p>
                <div className="row-buttons">
                  <button type="button" className="btn-secondary" onClick={handleStartEditShop}>
                    Edit Shop
                  </button>
                  <button type="button" className="btn-danger" onClick={handleDeleteShop} disabled={saving}>
                    Delete Shop
                  </button>
                </div>
              </>
            ) : (
              <form className="form-grid" onSubmit={handleUpdateShop}>
                <label>
                  Shop Name
                  <input
                    name="name"
                    value={shopForm.name}
                    onChange={handleShopFormChange}
                    required
                    disabled={saving}
                  />
                </label>
                <label>
                  Description
                  <textarea
                    name="description"
                    value={shopForm.description}
                    onChange={handleShopFormChange}
                    rows={3}
                    disabled={saving}
                  />
                </label>
                <div className="row-buttons">
                  <button type="submit" className="btn-primary" disabled={saving}>
                    {saving ? "Saving..." : "Update Shop"}
                  </button>
                  <button type="button" className="btn-secondary" onClick={() => setEditingShop(false)}>
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </>
        ) : (
          <>
            <p>Create your shop first. Once created, Add Products will be unlocked.</p>
            <form className="form-grid" onSubmit={handleCreateShop}>
              <label>
                Shop Name
                <input
                  name="name"
                  value={shopForm.name}
                  onChange={handleShopFormChange}
                  placeholder="My Gadget Store"
                  required
                  disabled={saving}
                />
              </label>
              <label>
                Description
                <textarea
                  name="description"
                  value={shopForm.description}
                  onChange={handleShopFormChange}
                  placeholder="What do you sell?"
                  rows={3}
                  disabled={saving}
                />
              </label>
              <div className="row-buttons">
                <button className="btn-primary" type="submit" disabled={saving}>
                  {saving ? "Creating..." : "Create Shop"}
                </button>
              </div>
            </form>
          </>
        )}
      </div>

      <div className="card">
        <h2>Create Product</h2>
        {!myShop && <p className="error-text">Create a shop first before adding products.</p>}

        <form className="form-grid" onSubmit={handleSubmit}>
          <label>
            Title
            <input
              name="title"
              value={productForm.title}
              onChange={handleFormChange}
              required
              disabled={!myShop || saving}
            />
          </label>

          <label>
            Price
            <input
              name="price"
              type="number"
              min="0"
              step="0.01"
              value={productForm.price}
              onChange={handleFormChange}
              required
              disabled={!myShop || saving}
            />
          </label>

          <label>
            Upload Images (optional, max 3)
            <input
              name="images"
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              disabled={!myShop || saving}
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
            <button className="btn-primary" type="submit" disabled={!myShop || saving}>
              {saving ? "Saving..." : "Add Product"}
            </button>
          </div>
        </form>

        {message && <p className="success-text">{message}</p>}
        {error && <p className="error-text">{error}</p>}
      </div>
    </section>
  );
}

export default DashboardPage;
