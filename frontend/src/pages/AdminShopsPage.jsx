import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { shopsApi } from "../services/api";

function AdminShopsPage({ shops, loading, onRefresh }) {
  const [editingShopId, setEditingShopId] = useState("");
  const [form, setForm] = useState({ name: "", description: "" });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const sortedShops = useMemo(
    () => [...shops].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    [shops]
  );

  const clearFeedback = () => {
    setMessage("");
    setError("");
  };

  const startEdit = (shop) => {
    clearFeedback();
    setEditingShopId(shop._id);
    setForm({ name: shop.name, description: shop.description || "" });
  };

  const cancelEdit = () => {
    setEditingShopId("");
    setForm({ name: "", description: "" });
  };

  const handleChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleUpdate = async (event) => {
    event.preventDefault();
    if (!editingShopId) return;

    clearFeedback();
    setSaving(true);

    try {
      await shopsApi.update(editingShopId, form);
      setMessage("Shop updated successfully");
      cancelEdit();
      await onRefresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (shopId) => {
    clearFeedback();
    setSaving(true);

    try {
      await shopsApi.remove(shopId);
      setMessage("Shop deleted successfully");
      if (editingShopId === shopId) {
        cancelEdit();
      }
      await onRefresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="stack-gap">
      <div className="card">
        <h1>Admin Shops</h1>
        <p>You are managing all shops as admin.</p>
        {message && <p className="success-text">{message}</p>}
        {error && <p className="error-text">{error}</p>}
      </div>

      <div className="card">
        <h2>All Shops</h2>
        {loading ? (
          <p>Loading shops...</p>
        ) : sortedShops.length === 0 ? (
          <p>No shops found.</p>
        ) : (
          <ul className="list-grid">
            {sortedShops.map((shop) => (
              <li key={shop._id} className="list-card">
                <h3>{shop.name}</h3>
                <p>{shop.description || "No description"}</p>
                <p>Owner: {shop.owner?.name || "Unknown"}</p>
                <div className="row-buttons">
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => navigate(`/admin/shops/${shop._id}/products`)}
                  >
                    View Products
                  </button>
                  <button type="button" className="btn-secondary" onClick={() => startEdit(shop)}>
                    Edit Shop
                  </button>
                  <button
                    type="button"
                    className="btn-danger"
                    onClick={() => handleDelete(shop._id)}
                    disabled={saving}
                  >
                    Delete Shop
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {editingShopId && (
        <div className="card">
          <h2>Edit Shop</h2>
          <form className="form-grid" onSubmit={handleUpdate}>
            <label>
              Shop Name
              <input name="name" value={form.name} onChange={handleChange} required disabled={saving} />
            </label>
            <label>
              Description
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={3}
                disabled={saving}
              />
            </label>
            <div className="row-buttons">
              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? "Saving..." : "Update Shop"}
              </button>
              <button type="button" className="btn-secondary" onClick={cancelEdit} disabled={saving}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}

export default AdminShopsPage;
