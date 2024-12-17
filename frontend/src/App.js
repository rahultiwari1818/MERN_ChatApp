import React from 'react';
import './App.css';
import Navbar from './Components/Navbar/Navbar';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { BrowserRouter } from 'react-router-dom';
import Router from './Router/Router';
import AuthProvider from './Contexts/AuthProvider';

function App() {
  return (

    <BrowserRouter>
      <AuthProvider>
          <Navbar/>
          <Router/>
          <ToastContainer />
      </AuthProvider>
    </BrowserRouter>

  );
}

export default App;
