import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  List,
  TextField,
  Typography,
} from '@mui/material';
import User from '../User/User';
import { debounce } from '../../Utils/utils';
import { useChat } from '../../Contexts/ChatProvider';

export default function UserList({ handleClick }) {
  // const [users, setUsers] = useState([]);
  const [searchEmail, setSearchEmail] = useState('');

  const {users,getUsers,isUsersLoading} = useChat();

  const {changeRecipient,newMessage,recipient} = useChat();

 

  // Debounced function
  const debouncedGetUsers = useCallback(
    debounce((email) => getUsers(email), 800),
    []
  );

  // Update debounced function when `searchEmail` changes
  useEffect(() => {

      debouncedGetUsers(searchEmail);
    
  }, [searchEmail, debouncedGetUsers]);

  // Fetch all users initially
  useEffect(() => {
    getUsers('');
  }, []);


  const usersToMap = useMemo(() => {
    if (newMessage) {
      const updatedUserList = [...users]; // Clone the existing user list
      const userIndex = updatedUserList.findIndex(
        (user) =>
          user._id === newMessage.senderId || user._id === newMessage.receiverId
      );
  
      // If the user exists in the list and the chat is not open
      if (userIndex !== -1 && recipient._id !== newMessage.senderId) {
        // Remove the user from its current position
        const user = updatedUserList.splice(userIndex, 1);
        // Add the user to the top of the list
        updatedUserList.unshift(user);
      }
      console.log(updatedUserList);
      return updatedUserList;
    }
    return users;
  }, [newMessage, users]); // Include `users` and `recipient` in dependencies


  return (
    <section className="h-screen px-10 overflow-scroll fixed bg-blue-300 text-white z-10 md:w-[30%]">
      <Typography
        variant="h6"
        sx={{ mt: 2, mb: 2 }}
        onClick={() => {
          handleClick()
          changeRecipient("");
        }}
      >
        Chats
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
          usersToMap?.map((user) => (
            <User user={user} handleClick={handleClick} key={user._id} isSkeleton={false} />
          ))
        }

      </List>
    </section>
  );
}
