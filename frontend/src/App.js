import React from 'react';
import './App.css';
import Navbar from './Components/Navbar/Navbar';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { BrowserRouter } from 'react-router-dom';
import Router from './Router/Router';
import AuthProvider from './Contexts/AuthProvider';
import OverlayProvider from './Contexts/OverlayProvider';

function App() {
  return (

    <BrowserRouter>
      <AuthProvider >
        <OverlayProvider>
            <Navbar/>
            <Router/>
            <ToastContainer  onClick={()=>{
            }}/>
        </OverlayProvider>
      </AuthProvider>
    </BrowserRouter>

  );
}

export default App;
