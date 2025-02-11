import { useState, useEffect } from "react";
import axios from "axios";
import { Outlet, Navigate } from "react-router-dom";

const PrivateRoutes = () => {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    const checkToken = async () => {
      try {
        const response = await axios.get("http://localhost:8080/api/auth/checkToken");
        setIsAuthenticated(response.data.token);
      } catch (error) {
        console.error("Error checking token:", error);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkToken();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/" />;
};

export default PrivateRoutes;