import React, {  useEffect, useState } from 'react'
import { io } from 'socket.io-client';
import UserList from '../Components/UserList/UserList';
import ChatScreen from '../Components/ChatScreen/ChatScreen';
import { ReactComponent as BarIcon } from ".././Assets/SVGs/Bar.svg";
import notificationSound from "../Assets/Sounds/notification.mp3";



export default function MainApp() {

  const [changeTextBoxCss, setChangeTextBoxCss] = useState();

  const [newMessage,setNewMessage] = useState("");
  const [isVisibleUserList, setIsVisibleUserList] = useState(true);
  const [showButtons, setShowButtons] = useState(false);
  const [recipient, setRecipient] = useState("");




  const handleResize = () => {
    let width = window.innerWidth;
    if (width < 1000) {
      setShowButtons(true);
      setIsVisibleUserList(false)
      setChangeTextBoxCss(() => "left-0");
    }
    else {
      setIsVisibleUserList(true);
      setShowButtons(false);
      
      if (width > 1600) {
        setChangeTextBoxCss(() => "left-[580px]");
      } else if (width > 1500) {
        setChangeTextBoxCss(() => "left-[520px]");
      } else if (width > 1400) {
        setChangeTextBoxCss(() => "left-[480px]");
      } else if (width > 1300) {
        setChangeTextBoxCss(() => "left-[420px]");
      } else if (width > 1200) {
        setChangeTextBoxCss(() => "left-[380px]");
      } else if (width > 1100) {
        setChangeTextBoxCss(() => "left-[360px]");
      } else if (width > 1000) {
        setChangeTextBoxCss(() => "left-[320px]");
      } else {
        setChangeTextBoxCss(() => "left-[620px]");
      }
    }
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

  const handleHideClick = (newRecipient) => {

    setRecipient(() => newRecipient);

    if (window.innerWidth > 1000) return;
    setIsVisibleUserList(false);
  }

  const socket = io(process.env.REACT_APP_API_URL, {
    auth: {
      userId: localStorage.getItem("token")
    }
  });


  useEffect(() => {
    socket.on("connect", () => {
      console.log("connected");
    })
    socket.on('connect_error', (err) => {
      console.log("Connection Error: ", err);
    });
    socket.on('connect_failed', (err) => {
      console.log("Connection Failed: ", err);
    });
    


    socket?.on("newMessage", (newMessage) => { 
      const sound = new Audio(notificationSound);
      sound?.play();
      console.log(newMessage,recipient)
      if(recipient === newMessage.senderId){
        setNewMessage(newMessage);
      }

    });


    return () => {
      socket.disconnect();
    }
  });

  return (
    <>

      <section className='flex'>
        {
          showButtons
          &&
          <button

            className='bg-blue-300 px-3 py-3 rounded-tr-lg rounded-br-lg  absolute left-0 z-10 cursor-pointer'
            onClick={handleBarClick}
          >
            <BarIcon className="h-6 w-6 md:h-10 md:w-10" />
          </button>
        }
        {
          isVisibleUserList &&
          <UserList handleClick={handleHideClick} recipient={recipient}  newMessage={newMessage} />
        }
        <ChatScreen recipient={recipient} changeTextBoxCss={changeTextBoxCss} newMessage={newMessage}/>
      </section>
    </>
  )
}
