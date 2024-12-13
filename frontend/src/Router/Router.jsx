import React from 'react'
import {Route, Routes} from "react-router-dom";
import RegistrationPage from '../Pages/RegistrationPage';
import ErrorPage from '../Pages/ErrorPage';
import ChatScreen from '../Components/ChatScreen/ChatScreen';
export default function Router() {
  return (
    <Routes>
        <Route  path='/' element={<RegistrationPage/>}/>
        <Route  path='*' element={<ErrorPage/>}/>
        <Route  path="/chat" element={<ChatScreen/>}/>
    </Routes>
  )
}