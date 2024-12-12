import React from 'react';
import './App.css';
import Navbar from './Components/Navbar/Navbar';
import RegistrationPage from './Pages/RegistrationPage/RegistrationPage';
import NewApp from './Pages/RegistrationPage/App.jsx';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (

    <>
        <Navbar/>
        <NewApp/>
        <RegistrationPage/>
        <ToastContainer />

    </>

  );
}

export default App;
