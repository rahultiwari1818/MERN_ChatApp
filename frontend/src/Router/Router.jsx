import React from "react";
import { Route, Routes } from "react-router-dom";
import RegistrationPage from "../Pages/RegistrationPage";
import ErrorPage from "../Pages/ErrorPage";
import MainApp from "../Pages/MainApp";
import ProtectedRoute from "../Components/ProtectedRoute/ProtectedRoute";
import Profile from "../Components/Profile/Profile";
import { GoogleOAuthProvider } from "@react-oauth/google";
export default function Router() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
            <RegistrationPage />
          </GoogleOAuthProvider>
        }
      />
      <Route path="*" element={<ErrorPage />} />
      <Route
        path="/chat"
        element={
          <ProtectedRoute>
            <MainApp />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
