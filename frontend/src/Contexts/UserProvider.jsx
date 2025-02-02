import axios from "axios";
import React,{ createContext, useContext, useState } from "react";


const UserContext = createContext();
export default function UserProvider({children}){



    return <UserContext.Provider value="">
        {children}
    </UserContext.Provider>
}

export const useUserProvider = () =>{
    return useContext(UserContext);
}