import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import notificationSound from "../Assets/Sounds/notification.mp3";

// Create Chat Context
const ChatContext = createContext();

// ChatProvider Component
export default function ChatProvider({ children }) {
    const [newMessage, setNewMessage] = useState("");
    const [recipient, setRecipient] = useState("");


    const changeRecipient = async (recipient) => {
        setRecipient(recipient);
    };
    

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
            // console.log(newMessage, recipient,"message")
            if (recipient._id === newMessage.senderId) {
                setNewMessage(newMessage);

            }

        });


        return () => {
            socket.disconnect();
        }
    },[]);



    return (
        <ChatContext.Provider value={{ newMessage, changeRecipient, recipient }}>
            {children}
        </ChatContext.Provider>
    );
}

export const useChat = () => {
    return useContext(ChatContext);
};
