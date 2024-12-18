import React, { useEffect } from 'react'
import RegistrationForm from '../Components/Registration/RegistrationForm'
import Login from '../Components/Login/Login'
import { useAuth } from '../Contexts/AuthProvider'
import { useNavigate } from 'react-router-dom'

export default function RegistrationPage() {
  const navigate = useNavigate();

  const {isAuthenticated} = useAuth();

  useEffect(()=>{
    if(isAuthenticated) navigate("/chat");
  },[]);

  return (
    <div className='h-screen w-screen block lg:flex  items-center bg-blue-300'>
        <Login/>
        <RegistrationForm/>
    </div>
  )
}
