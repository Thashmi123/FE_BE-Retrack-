import React from "react";
import { Route, Routes } from "react-router-dom";
import { routes } from "./Routes";
import AppLayout from "../Layout/Layout";

const LayoutRoutes = () => {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        {routes.map(({ path, Component }, i) => (
          <Route key={i} path={path} element={Component} />
        ))}
      </Route>
    </Routes>
  );
};

export default LayoutRoutes;
