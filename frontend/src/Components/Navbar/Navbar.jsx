import React from 'react'
import { ReactComponent as Logo } from '../../Assets/SVGs/logo.svg';
export default function Navbar() {
  return (
    <nav className='bg-white shadow-md md:gap-5  flex justify-between items-center px-2 py-3 w-screen '>
        <Logo/>
    </nav>
  )
}
