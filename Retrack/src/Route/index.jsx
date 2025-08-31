import React from "react";
import { Suspense } from "react";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import Callback from "../Auth/Callback";
import Loader from "../Layout/Loader";
import LayoutRoutes from "../Route/LayoutRoutes";
import Signin from "../Auth/Signin";
import PrivateRoute from "./PrivateRoute";
import { authRoutes } from "./AuthRoutes";
import { useUser } from "../contexts/UserContext";

const Routers = () => {
  const { isLoggedIn } = useUser();

  const isAuthenticated = isLoggedIn;

  return (
    <BrowserRouter basename={"/"}>
      <Suspense fallback={<Loader />}>
        <Routes>
          {/* Public routes */}
          <Route path="/callback" element={<Callback />} />
          <Route path="/login" element={<Signin />} />

          {/* Auth routes */}
          {authRoutes.map(({ path, Component }, i) => (
            <Route key={i} path={path} element={Component} />
          ))}

          {/* Protected routes */}
          <Route path="/" element={<PrivateRoute />}>
            <Route
              index
              element={
                isAuthenticated ? (
                  <Navigate to={`/pages/dashboard`} replace />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route path="/*" element={<LayoutRoutes />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default Routers;
