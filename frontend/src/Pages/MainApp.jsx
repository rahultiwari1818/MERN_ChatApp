import React from 'react'
import {io} from 'socket.io-client';

export default function MainApp() {
  const socket = io(process.env.REACT_APP_API_URL,{
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
