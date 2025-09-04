import React, { useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useUser } from "../contexts/UserContext";

const PrivateRoute = () => {
  const { isLoggedIn } = useUser();

  // Clear browser history on logout
  useEffect(() => {
    if (!isLoggedIn) {
      // Clear browser history when not logged in
      window.history.replaceState(null, null, "/login");
    }
  }, [isLoggedIn]);

  return isLoggedIn ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;
