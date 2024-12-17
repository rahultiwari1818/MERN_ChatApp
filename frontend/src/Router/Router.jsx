import React from 'react'
import { Route, Routes } from "react-router-dom";
import RegistrationPage from '../Pages/RegistrationPage';
import ErrorPage from '../Pages/ErrorPage';
import MainApp from '../Pages/MainApp';
import ProtectedRoute from '../Components/ProtectedRoute/ProtectedRoute';
import Profile from '../Components/Profile/Profile';
export default function Router() {
  return (
    <Routes>
      <Route path='/' element={<RegistrationPage />} />
      <Route path='*' element={<ErrorPage />} />
      <Route path="/chat" element={
        <ProtectedRoute>
          <MainApp />
        </ProtectedRoute>
      } />
      <Route path="/profile" element={
        <ProtectedRoute>
          <Profile/>
        </ProtectedRoute>
      }/>
    </Routes>
  )
}
