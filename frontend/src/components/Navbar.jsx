import { Link, NavLink } from "react-router-dom";

function Navbar({ token, user, onLogout }) {
  const isAdmin = user?.role === "admin";

  return (
    <header className="top-nav">
      <div className="container nav-wrap">
        <Link to="/" className="brand">
          ALLsell
          <span className="brand-accent">prime</span>
        </Link>

        <nav className="links">
          <NavLink to="/explore">Explore</NavLink>
          {!isAdmin && <NavLink to="/add-products">Add Products</NavLink>}
          {!isAdmin && <NavLink to="/my-products">My Products</NavLink>}
          {token && isAdmin && <NavLink to="/admin/shops">Admin Shops</NavLink>}
        </nav>

        <div className="auth-box">
          {token ? (
            <>
              {isAdmin && <span className="admin-pill">ADMIN</span>}
              <span className="user-pill">{user?.name || "User"}</span>
              <button type="button" className="btn-secondary" onClick={onLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login">Login</NavLink>
              <NavLink to="/register">Register</NavLink>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;
