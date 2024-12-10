import React, { useEffect } from 'react';
import {io} from 'socket.io-client';


export default function App() {

    const socket = io("http://localhost:5000",{
      auth:{
        userId:localStorage.getItem("token")
      }
    });

    useEffect(()=>{
        socket.on("connect",()=>{
            console.log("connected");
        })

        

        return ()=>{
            socket.disconnect();
        }
    },[]);

  return (
    <div>
      
    </div>
  )
}
