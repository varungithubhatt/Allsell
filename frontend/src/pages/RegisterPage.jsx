import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { authApi } from "../services/api";

const initialState = {
  name: "",
  email: "",
  password: "",
  role: "user",
};

function RegisterPage({ onAuthSuccess }) {
  const [form, setForm] = useState(initialState);
  const [adminExists, setAdminExists] = useState(false);
  const [statusLoading, setStatusLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const loadAdminStatus = async () => {
      try {
        const response = await authApi.getAdminStatus();
        const exists = Boolean(response?.data?.adminExists);
        setAdminExists(exists);
      } catch (_err) {
        setAdminExists(true);
      } finally {
        setStatusLoading(false);
      }
    };

    loadAdminStatus();
  }, []);

  const handleChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await authApi.register(form);
      onAuthSuccess(response.token, response.data.user);
      navigate(response.data.user.role === "admin" ? "/admin/shops" : "/add-products");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="card form-card">
      <h1>Create account</h1>
      <form onSubmit={handleSubmit} className="form-grid">
        <label>
          Name
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Jane Doe"
            required
          />
        </label>
        <label>
          Email
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="jane@example.com"
            required
          />
        </label>
        <label>
          Password
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            minLength={6}
            required
          />
        </label>

        <label>
          Register as
          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            disabled={statusLoading || loading}
          >
            <option value="user">User</option>
            <option value="admin" disabled={adminExists}>
              Admin {adminExists ? "(already exists)" : ""}
            </option>
          </select>
        </label>

        {error && <p className="error-text">{error}</p>}

        <button className="btn-primary" type="submit" disabled={loading}>
          {loading ? "Creating..." : "Register"}
        </button>
      </form>

      <p>
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </section>
  );
}

export default RegisterPage;
