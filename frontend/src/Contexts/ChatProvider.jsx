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

    const [recipientConversationStatus,setRecipientConversationStatus] = useState("");

    const [users, setUsers] = useState([]);
    const [isUsersLoading,setIsUsersLoading] = useState(false);
    const [messageStatus,setMessageStatus] = useState("");

    const changeNewMessage = (mess)=>{
        setNewMessage(mess);
    }   


    const sortUser = (senderId, message) => {
        console.log("sort user called")
        const updatedUserList = [...users]; // Clone the existing user list
        const userIndex = updatedUserList.findIndex(
            (user) =>
                user._id === senderId 
        );

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
        if(!newMessage?.isNewConversation){
            sortUser(newMessage?.senderId, newMessage?.message);
        }
        if (recipient?._id === newMessage.senderId || recipient?._id === newMessage?.groupId) {
            socket?.emit("markMessageAsRead",{_id:newMessage?._id,senderId:newMessage?.senderId});
            const updatedMessage = {...newMessage,readReceipts:"read"};
            setNewMessage(updatedMessage);
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
        setUsers((oldUsers)=>{
            const updatedUserList = oldUsers.map((user)=>{
                if(user._id === _id){
                    return {
                        ...user,
                        isOnline:true
                    }
                }
                return user;
            })
            return updatedUserList;
        })
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
        setUsers((oldUsers)=>{
            const updatedUserList = oldUsers.map((user)=>{
                if(user._id === _id){
                    return {
                        ...user,
                        isOnline:false
                    }
                }
                return user;
            })
            return updatedUserList;
        })
    }

    const markMessageAsReadHandler = async(message) =>{
        if(!message) return;
        setMessageStatus(message);
    }

    const wholeConversationIsReadedHandler = (data) =>{
        if(!recipient) return;
        if(recipient._id === data.recipientId){
            setRecipientConversationStatus(true)
        }
    }

    const newConversationStartedHandler  = (newConversation) =>{
        setUsers((oldUsers)=>{
            if(oldUsers?.at(0)._id === newConversation._id) return oldUsers;
            return [newConversation,...oldUsers];
        })
    }

    const removeExistingMemberFromGroup = (userId) =>{
        setRecipient((old)=>{
            return {
                ...old,
                members : old?.members?.filter((member)=>member._id !== userId)
            }
        })
    }

    const changeGroupMemberRole = (userId,role) =>{
        setRecipient((old)=>{
            return {
                ...old,
                members : old?.members?.map((member)=>{
                    const newRole = member._id === userId ? role : member.role;
                    return {
                        ...member,
                        role:newRole
                    }
                })
            }
        })
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

        if(recipient){
            socket?.emit("markConversationAsRead",{senderId : recipient?._id,token: localStorage.getItem("token")});
        }


        socket?.on("messageHasBeenReaded",markMessageAsReadHandler)

        socket?.on("wholeConversationIsReaded",wholeConversationIsReadedHandler);

        socket?.on("newConversationStarted",newConversationStartedHandler);


        return () => {
            socket.off('newMessage');
        };
    }, [recipient]);



    return (
        <ChatContext.Provider value={{ newMessage, changeRecipient, recipient, changeBlockingStatus, users, getUsers,messageStatus,isUsersLoading, changeNewMessage ,recipientConversationStatus,removeExistingMemberFromGroup,changeGroupMemberRole}}>
            {children}
        </ChatContext.Provider>
    );
}

export const useChat = () => {
    return useContext(ChatContext);
};
