import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import notificationSound from "../Assets/Sounds/notification.mp3";
import { toast } from 'react-toastify';
import ToastBox from '../Components/Common/ToastBox';

// Create Chat Context
const ChatContext = createContext();
const socket = io(process.env.REACT_APP_API_URL, {
    auth: {
        userId: localStorage.getItem("token")
    }
});

// ChatProvider Component
export default function ChatProvider({ children }) {
    const [newMessage, setNewMessage] = useState("");
    const [recipient, setRecipient] = useState("");

    const changeRecipient = async (recipient) => {
        // console.log("recipient selected :",recipient);
        setRecipient(() => recipient);
    };

    const changeBlockingStatus = async (status) => {
        setRecipient((old) => {
            return {
                ...old,
                isBlocked: status
            }
        })
    }

    const newMessageHandler = async (newMessage) => {
        const sound = new Audio(notificationSound);
        sound?.play();
        console.log(newMessage, "message")
        if (recipient._id === newMessage.senderId) {
            setNewMessage(newMessage);

        }
        else {
            toast(
                <ToastBox newMessage={newMessage}/>
            , {
                position: "top-center",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: false,
                progress: undefined,
                theme: "light",
            });
          
        }
    }

    const blockUserHandler =  async({_id}) =>{
        if(recipient._id == _id){
            changeBlockingStatus(true);
        }
    }

    const unblockUserHandler =  async({_id}) =>{
        if(recipient._id == _id){
            changeBlockingStatus(false);
        }
    }

    const cameOnlineHandler = async({_id}) =>{
        if(recipient?._id == _id ){
            setRecipient(()=>{
                return {
                    ...recipient,
                    isOnline:true
                }
            })
        }
    }

    
    const gotOfflineHandler = async({_id}) =>{
        if(recipient?._id == _id ){
            setRecipient(()=>{
                return {
                    ...recipient,
                    isOnline:false
                }
            })
        }
    }

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



        socket?.on("newMessage", newMessageHandler);

        socket?.on("userBlocked",blockUserHandler);

        socket?.on("userUnblocked",unblockUserHandler);

        socket?.on("userCameOnline",cameOnlineHandler)

        socket?.on("userGoneOffline",gotOfflineHandler)


        return () => {
            socket.off('newMessage');
        };
    }, [recipient]);



    return (
        <ChatContext.Provider value={{ newMessage, changeRecipient, recipient, changeBlockingStatus }}>
            {children}
        </ChatContext.Provider>
    );
}

export const useChat = () => {
    return useContext(ChatContext);
};
