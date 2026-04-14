import { Navigate, useLocation } from "react-router-dom";

function ProtectedRoute({ token, children }) {
  const location = useLocation();

  if (!token) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          message: "Please login to access this section.",
          redirectTo: location.pathname,
        }}
      />
    );
  }

  return children;
}

export default ProtectedRoute;
