import { useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardPage from "./pages/DashboardPage";
import AdminShopProductsPage from "./pages/AdminShopProductsPage";
import AdminShopsPage from "./pages/AdminShopsPage";
import ExplorePage from "./pages/ExplorePage";
import LoginPage from "./pages/LoginPage";
import MyProductsPage from "./pages/MyProductsPage";
import RegisterPage from "./pages/RegisterPage";
import { productsApi, shopsApi } from "./services/api";

function App() {
  const [token, setToken] = useState(localStorage.getItem("allsell_token") || "");
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("allsell_user");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [shops, setShops] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const isAdmin = user?.role === "admin";

  const saveAuth = (nextToken, nextUser) => {
    setToken(nextToken);
    setUser(nextUser);
    localStorage.setItem("allsell_token", nextToken);
    localStorage.setItem("allsell_user", JSON.stringify(nextUser));
  };

  const logout = () => {
    setToken("");
    setUser(null);
    localStorage.removeItem("allsell_token");
    localStorage.removeItem("allsell_user");
  };

  const fetchPublicData = async () => {
    setLoading(true);
    try {
      const [shopsResponse, productsResponse] = await Promise.all([
        shopsApi.getAll(),
        productsApi.getAll({ page: 1, limit: 50 }),
      ]);

      setShops(shopsResponse.data.shops || []);
      setProducts(productsResponse.data.products || []);
    } catch (error) {
      console.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPublicData();
  }, []);

  return (
    <div className="page-shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <Navbar token={token} user={user} onLogout={logout} />
      <main className="container main-content">
        <Routes>
          <Route path="/" element={<Navigate to="/explore" replace />} />
          <Route path="/register" element={<RegisterPage onAuthSuccess={saveAuth} />} />
          <Route path="/login" element={<LoginPage onAuthSuccess={saveAuth} />} />
          <Route
            path="/add-products"
            element={
              <ProtectedRoute token={token}>
                {isAdmin ? (
                  <Navigate to="/admin/shops" replace />
                ) : (
                  <DashboardPage
                    user={user}
                    shops={shops}
                    onProductsRefresh={fetchPublicData}
                    loading={loading}
                  />
                )}
              </ProtectedRoute>
            }
          />
          <Route path="/dashboard" element={<Navigate to="/add-products" replace />} />
          <Route path="/create-shop" element={<Navigate to="/add-products" replace />} />
          <Route
            path="/my-products"
            element={
              <ProtectedRoute token={token}>
                {isAdmin ? (
                  <Navigate to="/admin/shops" replace />
                ) : (
                  <MyProductsPage
                    user={user}
                    shops={shops}
                    products={products}
                    onProductsRefresh={fetchPublicData}
                    loading={loading}
                  />
                )}
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/shops"
            element={
              <ProtectedRoute token={token}>
                {isAdmin ? (
                  <AdminShopsPage shops={shops} loading={loading} onRefresh={fetchPublicData} />
                ) : (
                  <Navigate to="/add-products" replace />
                )}
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/shops/:shopId/products"
            element={
              <ProtectedRoute token={token}>
                {isAdmin ? <AdminShopProductsPage /> : <Navigate to="/add-products" replace />}
              </ProtectedRoute>
            }
          />
          <Route
            path="/explore"
            element={<ExplorePage products={products} loading={loading} />}
          />
        </Routes>
      </main>
    </div>
  );
}

export default App;
