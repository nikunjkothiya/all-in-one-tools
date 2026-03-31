import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { getAdminToken } from "../services/api";

const AdminRoute = ({ children }) => {
  const location = useLocation();

  if (!getAdminToken()) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  }

  return children;
};

export default AdminRoute;
