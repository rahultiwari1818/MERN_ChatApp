import React from 'react';
import './App.css';
import Navbar from './Components/Navbar/Navbar';
import RegistrationPage from './Pages/RegistrationPage/RegistrationPage';
import NewApp from './Pages/RegistrationPage/App.jsx';

function App() {
  return (

    <>
        <Navbar/>
        <NewApp/>
        <RegistrationPage/>
    </>

  );
}

export default App;
