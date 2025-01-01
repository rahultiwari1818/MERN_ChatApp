import React from 'react'
import { ReactComponent as Logo } from '../../Assets/SVGs/logo1.svg';
import {ReactComponent as ProfileIcon} from "../../Assets/SVGs/Profile.svg";
import Menu from '../Menu/Menu.jsx';
import { useAuth } from '../../Contexts/AuthProvider.jsx';
import { useNavigate } from 'react-router-dom';
export default function Navbar() {
  const {  isAuthenticated } = useAuth();
  const navigate = useNavigate();
  return (
    <nav className='bg-white shadow-md pl-12  md:gap-5  flex justify-between items-center px-2 md:px-20 py-1 lg:py-3 w-screen '>
      
        <Logo
        className="cursor-pointer w-20 h-20"
         onClick={()=>{
          navigate("/");
        }}
        />
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
