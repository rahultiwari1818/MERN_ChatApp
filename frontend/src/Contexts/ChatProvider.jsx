import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import notificationSound from "../Assets/Sounds/notification.mp3";
import { toast } from 'react-toastify';
import ToastBox from '../Components/Common/ToastBox';
import axios from 'axios';

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

    const [users, setUsers] = useState([]);
    const [isUsersLoading,setIsUsersLoading] = useState(false);
    const [messageStatus,setMessageStatus] = useState("");

    const changeNewMessage = (mess)=>{
        setNewMessage(mess);
    }   


    const sortUser = (senderId, message) => {
        const updatedUserList = [...users]; // Clone the existing user list
        const userIndex = updatedUserList.findIndex(
            (user) =>
                user._id === senderId 
        );

        // If the user exists in the list and the chat is not open
          // Remove the user from its current position
            const user = updatedUserList.splice(userIndex, 1)?.at(0);
            user.lastMessage = message


            // Add the user to the top of the list
            updatedUserList?.unshift(user);
        setUsers(updatedUserList);
    }

    const getUsers = async (email,showOtherUsers) => {
        try {
            setIsUsersLoading(true);
            const url = `${process.env.REACT_APP_API_URL}/api/v1/users/${showOtherUsers ? 'getUsers' :"getConversations"}?friendMail=${email}`;
            const { data } = await axios.get(
url,
                {
                    headers: {
                        Authorization: localStorage.getItem('token'),
                    },
                }
            );
            setUsers(data.data.length === 0 ? [] : data.data);
        } catch (error) {
            console.log(error?.response);
            //   if (error?.response?.status === 400) navigate('/');
        }
        finally{
            setIsUsersLoading(false);
        }
    };


    const changeRecipient = async (recipient) => {
        // console.log("recipient selected :",recipient);
        setRecipient(() => recipient);
    };

    const changeBlockingStatus = async (status,isBlocked) => {
        if(isBlocked){
            setRecipient((old) => {
                return {
                    ...old,
                    isBlocked: status
                }
            })
        }
        else{
            setRecipient((old) => {
                return {
                    ...old,
                    hasBlocked: status
                }
            })
        }
        
    }

    const newMessageHandler = async (newMessage) => {
        const sound = new Audio(notificationSound);
        sound?.play();
        console.log(newMessage, "message")
        sortUser(newMessage?.senderId, newMessage?.message);
        if (recipient?._id === newMessage.senderId) {
            
            setNewMessage(newMessage);
            socket?.emit("markMessageAsRead",{_id:newMessage?._id,senderId:newMessage?.senderId});
        }
        else {
            toast(
                <ToastBox newMessage={newMessage} changeRecipient={changeRecipient} users={users} />
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

    const blockUserHandler = async ({ _id }) => {
        if (recipient?._id === _id) {
            changeBlockingStatus(true);
        }
    }

    const unblockUserHandler = async ({ _id }) => {
        if (recipient?._id === _id) {
            changeBlockingStatus(false,false);
        }
    }

    const cameOnlineHandler = async ({ _id }) => {
        if (recipient?._id === _id) {
            setRecipient(() => {
                return {
                    ...recipient,
                    isOnline: true
                }
            })
        }
    }


    const gotOfflineHandler = async ({ _id }) => {
        if (recipient?._id === _id) {
            setRecipient(() => {
                return {
                    ...recipient,
                    isOnline: false
                }
            })
        }
    }

    const markMessageAsReadHandler = async(message) =>{
        setMessageStatus(message)
        console.log("read : ",message)
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

        socket?.on("userBlocked", blockUserHandler);

        socket?.on("userUnblocked", unblockUserHandler);

        socket?.on("userCameOnline", cameOnlineHandler)

        socket?.on("userGoneOffline", gotOfflineHandler)

        socket?.emit("markConversationAsRead",{senderId:recipient?._id});

        socket?.on("messageRead",markMessageAsReadHandler)


        return () => {
            socket.off('newMessage');
        };
    }, [recipient]);



    return (
        <ChatContext.Provider value={{ newMessage, changeRecipient, recipient, changeBlockingStatus, users, getUsers,messageStatus,isUsersLoading, changeNewMessage }}>
            {children}
        </ChatContext.Provider>
    );
}

export const useChat = () => {
    return useContext(ChatContext);
};
