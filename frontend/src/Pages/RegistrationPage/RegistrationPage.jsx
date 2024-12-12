import React from 'react'
import RegistrationForm from '../../Components/Registration/RegistrationForm'
import Login from '../../Components/Login/Login'

export default function RegistrationPage() {
  return (
    <div className='h-screen w-screen block lg:flex  items-center bg-blue-300'>
        <Login/>
        <RegistrationForm/>
    </div>
  )
}
