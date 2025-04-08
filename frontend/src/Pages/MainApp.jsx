import React, { useCallback, useEffect, useState } from 'react'
import UserList from '../Components/UserList/UserList';
import ChatScreen from '../Components/ChatScreen/ChatScreen';
import { ReactComponent as BarIcon } from ".././Assets/SVGs/Bar.svg";
import { ReactComponent as CloseIcon } from ".././Assets/SVGs/CloseIcon.svg";
import ChatProvider from '../Contexts/ChatProvider';



export default function MainApp() {

  const [changeTextBoxCss, setChangeTextBoxCss] = useState();

  const [isVisibleUserList, setIsVisibleUserList] = useState(true);
  const [showButtons, setShowButtons] = useState(false);




  const handleResize = () => {
    let width = window.innerWidth;
    if (width < 1000) {
      setShowButtons(true);
      setIsVisibleUserList(false)
      // setChangeTextBoxCss(() => "left-0");
    }
    else {
      setIsVisibleUserList(true);
      setShowButtons(false);

      // if (width > 1600) {
      //   setChangeTextBoxCss(() => "left-[580px]");
      // } else if (width > 1500) {
      //   setChangeTextBoxCss(() => "left-[520px]");
      // } else if (width > 1400) {
      //   setChangeTextBoxCss(() => "left-[480px]");
      // } else if (width > 1300) {
      //   setChangeTextBoxCss(() => "left-[420px]");
      // } else if (width > 1200) {
      //   setChangeTextBoxCss(() => "left-[380px]");
      // } else if (width > 1100) {
      //   setChangeTextBoxCss(() => "left-[360px]");
      // } else if (width > 1000) {
      //   setChangeTextBoxCss(() => "left-[320px]");
      // } else {
      //   setChangeTextBoxCss(() => "left-[620px]");
      // }
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

  const handleBarClick = (flag) => {
    setIsVisibleUserList(flag);
  }

  

  const handleHideClick = useCallback(() => {

    if (window.innerWidth > 1000) return;
    setIsVisibleUserList(false);
  }, []);


  return (
    // <UserProvider>
      <ChatProvider>

        <section className='flex'>
          {
            showButtons
            &&
            <button

              className='bg-blue-300 px-3 py-3 rounded-tr-lg rounded-br-lg top-6  absolute left-0 z-10 cursor-pointer'
              onClick={()=>handleBarClick(!isVisibleUserList)}
            >
              {
                isVisibleUserList?

                <CloseIcon className=" h-4 w-4 lg:h-10 lg:w-10 md:h-6 md:w-6" />
                :
                <BarIcon className=" h-4 w-4 lg:h-10 lg:w-10 md:h-6 md:w-6" />

              }
            </button>
          }
          {
            isVisibleUserList &&
            <UserList handleClick={handleHideClick} />
          }
          <ChatScreen  />
        </section>
      </ChatProvider>
    // </UserProvider>
  )
}
