import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  List,
  TextField,
  Typography,
} from '@mui/material';
import User from '../User/User';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { debounce } from '../../Utils/utils';

export default function UserList({ handleClick,newMessage,recipient }) {
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();
  const [searchEmail, setSearchEmail] = useState('');

  const getUsers = async (email) => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/users/getUsers?friendMail=${email}`,
        {
          headers: {
            Authorization: localStorage.getItem('token'),
          },
        }
      );
      setUsers(data.data.length === 0 ? [] : data.data);
    } catch (error) {
      console.log(error?.response);
      if (error?.response?.status === 400) navigate('/');
    }
  };

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
      if (userIndex !== -1 && recipient !== newMessage.senderId) {
        // Remove the user from its current position
        const [user] = updatedUserList.splice(userIndex, 1);
        // Add the user to the top of the list
        updatedUserList.unshift(user);
      }
      return updatedUserList;
    }
    return users;
  }, [newMessage, users, recipient]); // Include `users` and `recipient` in dependencies
  

  return (
    <section className="h-screen px-10 overflow-scroll fixed bg-blue-300 text-white z-10 md:w-[30%]">
      <Typography
        variant="h6"
        sx={{ mt: 2, mb: 2 }}
        onClick={() => handleClick(undefined)}
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
        {usersToMap?.map((user) => (
          <User user={user} handleClick={handleClick} key={user._id} />
        ))}
      </List>
    </section>
  );
}
