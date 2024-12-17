import React from 'react'
import { ReactComponent as Logo } from '../../Assets/SVGs/logo.svg';
import {ReactComponent as ProfileIcon} from "../../Assets/SVGs/Profile.svg";
import Menu from '../Menu/Menu.jsx';
import { useAuth } from '../../Contexts/AuthProvider.jsx';
export default function Navbar() {
  const {  isAuthenticated } = useAuth();

  return (
    <nav className='bg-white shadow-md md:gap-5  flex justify-between items-center px-2 md:px-20 py-3 w-screen '>
        <Logo/>
        {
          isAuthenticated
          &&
          <Menu 
            Title={<ProfileIcon className="rounded-lg  cursor-pointer outline outline-blue-300 p-3"/>}
          />
        }
        
    </nav>
  )
}
