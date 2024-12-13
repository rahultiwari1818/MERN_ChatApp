import React from 'react';
import './App.css';
import Navbar from './Components/Navbar/Navbar';
import RegistrationPage from './Pages/RegistrationPage';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { BrowserRouter } from 'react-router-dom';
import Router from './Router/Router';

function App() {
  return (

    <BrowserRouter>
        <Navbar/>
        <Router/>
        <ToastContainer />
    </BrowserRouter>

  );
}

export default App;
