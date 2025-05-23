import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  List,
  TextField,
  Typography,
} from '@mui/material';
import User from '../User/User';
import { debounce } from '../../Utils/utils';
import { useChat } from '../../Contexts/ChatProvider';
import UserListIcon from "../../Assets/Images/contact.png";
import {ReactComponent as CloseIcon} from "../../Assets/SVGs/CloseIcon.svg"

export default function UserList({ handleClick }) {
  // const [users, setUsers] = useState([]);
  const [searchEmail, setSearchEmail] = useState('');

  const {users,getUsers,isUsersLoading} = useChat();

  const {changeRecipient,newMessage,recipient} = useChat();

  const [showOtherUsers,setShowOtherUsers] = useState(false);

 

  // Debounced function
  const debouncedGetUsers = useCallback(
    debounce((email,showOtherUsers) => getUsers(email,showOtherUsers), 800),
    []
  );

  // Update debounced function when `searchEmail` changes
  useEffect(() => {

      debouncedGetUsers(searchEmail,showOtherUsers);
    
  }, [searchEmail, debouncedGetUsers,showOtherUsers]);


  // Fetch all users initially
  useEffect(() => {
    setSearchEmail("");
  }, [showOtherUsers]);



  const closeShowOthers = () =>{
    setShowOtherUsers(false);
  }


  const usersToMap = useMemo(() => {
    if (newMessage && !newMessage.isNewConversation) {
      if(newMessage?.isSender && !newMessage.groupId && !newMessage.isReceived){
        const updatedUserList = [...users]; // Clone the existing user list
        const userIndex = updatedUserList.findIndex(
          (user) =>
            user._id === newMessage?.recipientId
        );

    
        // If the user exists in the list and the chat is not open
        if (userIndex !== -1) {
          // Remove the user from its current position
          const user = updatedUserList.splice(userIndex, 1).at(0);
          // Add the user to the top of the list
          updatedUserList.unshift({...user,lastMessage:newMessage,lastMessageTime:Date.now()});
        }
        return updatedUserList;
      }

      if(newMessage?.isSender && newMessage?.groupId && !newMessage.isReceived){
        const updatedUserList = [...users]; // Clone the existing user list
        const userIndex = updatedUserList.findIndex(
          (user) =>
            user._id === newMessage.groupId
         
        );
        // If the user exists in the list and the chat is not open
        if (userIndex !== -1 && recipient._id !== newMessage.senderId) {
          // Remove the user from its current position
          const user = updatedUserList.splice(userIndex, 1).at(0);
          // Add the user to the top of the list
          updatedUserList.unshift({...user,lastMessage:newMessage,lastMessageTime:Date.now()});
        }
        // console.log(updatedUserList , "upl grp");
        return updatedUserList;
      }

      // console.log(newMessage, "gr")

      if(newMessage?.groupId){
        const updatedUserList = [...users]; // Clone the existing user list
        const userIndex = updatedUserList.findIndex(
          (user) =>
            user._id === newMessage.groupId
         
        );
        // If the user exists in the list and the chat is not open
        if (userIndex !== -1 && recipient._id !== newMessage.senderId) {
          // Remove the user from its current position
          const user = updatedUserList.splice(userIndex, 1).at(0);
          // Add the user to the top of the list
          updatedUserList.unshift({...user,lastMessage:newMessage,lastMessageTime:Date.now()});
        }
        // console.log(updatedUserList , "upl grp rec");
        return updatedUserList;
      }

      const updatedUserList = [...users]; // Clone the existing user list
      const userIndex = updatedUserList.findIndex(
        (user) =>
          user._id === newMessage.senderId 
      );
      // If the user exists in the list and the chat is not open
      if (userIndex !== -1 && recipient._id !== newMessage.senderId) {
        // Remove the user from its current position
        const user = updatedUserList.splice(userIndex, 1).at(0);
        // Add the user to the top of the list
        updatedUserList.unshift({...user,lastMessage:newMessage,lastMessageTime:Date.now()});
      }
      // console.log(updatedUserList , "upl");
      return updatedUserList;
    }
    return users;
  }, [newMessage?._id, users?.length]); // Include `users` and `recipient` in dependencies


  return (
    <section className="h-screen px-10 overflow-scroll fixed bg-blue-300 text-white  z-10 lg:z-[0] w-full md:w-[60vw] lg:w-[30vw]  ">
      <Typography
        variant="h6"
        sx={{ mt: 2, mb: 2 }}
        onClick={() => {
          handleClick()
          changeRecipient(null);
        }}
      >
        {
          showOtherUsers 
          ?
          "Other Users"
          :
          "Chats"
        }
        
      </Typography>
      <TextField
        fullWidth
        label="Search Friend"
        name="email"
        type="email"
        value={searchEmail}
        onChange={(e) => setSearchEmail(e.target.value)}
        margin="normal"
        placeholder="Your Email"
        className="bg-white outline outline-white"
      />
      <List>
        {
          isUsersLoading
          ?
          [1,2,3,4,5,6,7,8,9,10,11,12,13]?.map((user) => (
            <User isSkeleton={true} key={user} />
          ))
          :
          usersToMap?.length === 0
          ?
          <Typography>
            No Users Found
          </Typography>
          :
          usersToMap?.map((user) => (
            <User user={user} handleClick={handleClick} key={user._id} isSkeleton={false} />
          ))
        }

      </List>
      <div className='relative'>

      {
        showOtherUsers
        ?
        <CloseIcon onClick={closeShowOthers} className='fixed bottom-5 left-[75vw!important] md:left-[50vw!important]  lg:left-[25vw!important] cursor-pointer rounded-full bg-white p-2 h-10 w-10'/>
        :
      <img src={UserListIcon} alt='user list ' className='fixed bottom-5 left-[75vw!important] md:left-[50vw!important]  lg:left-[25vw!important] cursor-pointer' onClick={()=>setShowOtherUsers(true)}/>
      }
      </div>
    </section>
  );
}
