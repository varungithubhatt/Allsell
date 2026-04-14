import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { authApi } from "../services/api";

const initialState = {
  email: "",
  password: "",
  role: "user",
};

function LoginPage({ onAuthSuccess }) {
  const [form, setForm] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  const handleChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await authApi.login(form);
      onAuthSuccess(response.token, response.data.user);
      const redirectTo = location.state?.redirectTo;
      if (redirectTo) {
        navigate(redirectTo);
      } else {
        navigate(response.data.user.role === "admin" ? "/admin/shops" : "/add-products");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="card form-card">
      <h1>Login</h1>
      {location.state?.message && <p className="success-text">{location.state.message}</p>}
      <form onSubmit={handleSubmit} className="form-grid">
        <label>
          Email
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
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
          Login as
          <select name="role" value={form.role} onChange={handleChange} disabled={loading}>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </label>

        {error && <p className="error-text">{error}</p>}

        <button className="btn-primary" type="submit" disabled={loading}>
          {loading ? "Signing in..." : "Login"}
        </button>
      </form>

      <p>
        New user? <Link to="/register">Create an account</Link>
      </p>
    </section>
  );
}

export default LoginPage;
