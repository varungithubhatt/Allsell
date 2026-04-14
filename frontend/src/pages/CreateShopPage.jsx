import { useState } from "react";

import { shopsApi } from "../services/api";

function CreateShopPage({ onShopCreated }) {
  const [form, setForm] = useState({ name: "", description: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await shopsApi.create(form);
      setMessage(response.message || "Shop created successfully");
      onShopCreated?.();
      setForm({ name: "", description: "" });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="card form-card">
      <h1>Create Shop</h1>
      <form onSubmit={handleSubmit} className="form-grid">
        <label>
          Shop Name
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="My Gadget Store"
            required
          />
        </label>

        <label>
          Description
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="What do you sell?"
            rows={3}
          />
        </label>

        {message && <p className="success-text">{message}</p>}
        {error && <p className="error-text">{error}</p>}

        <button className="btn-primary" type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create Shop"}
        </button>
      </form>
    </section>
  );
}

export default CreateShopPage;
