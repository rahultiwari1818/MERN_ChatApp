import React, { useEffect, useState } from 'react'
import { io } from 'socket.io-client';
import UserList from '../Components/UserList/UserList';
import ChatScreen from '../Components/ChatScreen/ChatScreen';
import { Button } from '@mui/material';

export default function MainApp() {
  const socket = io(process.env.REACT_APP_API_URL, {
    auth: {
      userId: localStorage.getItem("token")
    }
  });

  const [isVisibleUserList, setIsVisibleUserList] = useState(true);
  const [showButtons, setShowButtons] = useState(false)
  const handleResize = () => {
    let width = window.innerWidth;
    if (width < 1000) {
      setShowButtons(true);
      setIsVisibleUserList(false)
    }
    else {
      setIsVisibleUserList(true);
      setShowButtons(false);
    }
    // console.log(width);
  };

  useEffect(() => {
    handleResize();
  }, [])

  useEffect(() => {
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleBarClick = () => {
    setIsVisibleUserList(true);
  }

  const handleHideClick = () => {
    setIsVisibleUserList(false);
  }

  useEffect(() => {
    socket.on("connect", () => {
      console.log("connected");
    })



    return () => {
      socket.disconnect();
    }
  }, []);

  return (
    <>

      <section className='flex'>
        {
          showButtons
          &&
          <Button className='bg-black text-white absolute left-0 z-10'
            onClick={handleBarClick}
          >
            Button
          </Button>
        }
        {
          isVisibleUserList &&
          <UserList handleClick={handleHideClick} />
        }
        <ChatScreen />
      </section>
    </>
  )
}
