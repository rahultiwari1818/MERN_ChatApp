import React, { useEffect } from 'react'
import RegistrationForm from '../Components/Registration/RegistrationForm'
import Login from '../Components/Login/Login'
import { useAuth } from '../Contexts/AuthProvider'
import { useNavigate } from 'react-router-dom'
import "./RegistrationPage.css";
import { useOverlay } from '../Contexts/OverlayProvider'

export default function RegistrationPage() {
  const navigate = useNavigate();

  const {isAuthenticated} = useAuth();

  const {setOverlay} = useOverlay();

  useEffect(()=>{
    setOverlay(true);
    if(isAuthenticated) navigate("/chat");
    setOverlay(false);
  },[]);

  return (
    <div className='h-screen w-screen  flex overflow-scroll justify-center   items-center bg-image'>
      <div className='block lg:flex items-center  justify-center gap-3 bg-blue-300 rounded-lg shadow-lg py-5 px-5 '>
        <Login/>
        <RegistrationForm/>
      </div>
    </div>
  )
}
