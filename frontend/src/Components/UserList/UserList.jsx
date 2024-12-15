import React, { useEffect, useState } from 'react';
import {
  Container,
  List,
  Typography,
} from '@mui/material';
import User from '../User/User';
import axios from "axios";
import { useNavigate } from 'react-router-dom';

const user = [
    { id: 1, name: 'John Doe', avatar: '', lastMessage: 'Hey, how are you?', time: '09:30 AM' },
    { id: 2, name: 'Jane Smith', avatar: '', lastMessage: 'Meeting rescheduled.', time: '08:45 AM' },
    { id: 3, name: 'Emily Davis', avatar: '', lastMessage: 'Check the document.', time: 'Yesterday' },
    { id: 4, name: 'Michael Brown', avatar: '', lastMessage: 'Let’s catch up later.', time: 'Monday' },
    { id: 5, name: 'Chris Wilson', avatar: '', lastMessage: 'Project deadline extended.', time: '10:15 AM' },
    { id: 6, name: 'Sarah Taylor', avatar: '', lastMessage: 'Call me when you’re free.', time: '09:00 AM' },
    { id: 7, name: 'Daniel Moore', avatar: '', lastMessage: 'Lunch at 1 PM?', time: 'Yesterday' },
    { id: 8, name: 'Laura Martinez', avatar: '', lastMessage: 'Thanks for the help!', time: '08:00 AM' },
    { id: 9, name: 'Andrew Johnson', avatar: '', lastMessage: 'Can we discuss this later?', time: '10:45 AM' },
    { id: 10, name: 'Sophia Lee', avatar: '', lastMessage: 'See you at the meeting.', time: '11:00 AM' },
    { id: 1, name: 'John Doe', avatar: '', lastMessage: 'Hey, how are you?', time: '09:30 AM' },
    { id: 2, name: 'Jane Smith', avatar: '', lastMessage: 'Meeting rescheduled.', time: '08:45 AM' },
    { id: 3, name: 'Emily Davis', avatar: '', lastMessage: 'Check the document.', time: 'Yesterday' },
    { id: 4, name: 'Michael Brown', avatar: '', lastMessage: 'Let’s catch up later.', time: 'Monday' },
    { id: 5, name: 'Chris Wilson', avatar: '', lastMessage: 'Project deadline extended.', time: '10:15 AM' },
    { id: 6, name: 'Sarah Taylor', avatar: '', lastMessage: 'Call me when you’re free.', time: '09:00 AM' },
    { id: 7, name: 'Daniel Moore', avatar: '', lastMessage: 'Lunch at 1 PM?', time: 'Yesterday' },
    { id: 8, name: 'Laura Martinez', avatar: '', lastMessage: 'Thanks for the help!', time: '08:00 AM' },
    { id: 9, name: 'Andrew Johnson', avatar: '', lastMessage: 'Can we discuss this later?', time: '10:45 AM' },
    { id: 10, name: 'Sophia Lee', avatar: '', lastMessage: 'See you at the meeting.', time: '11:00 AM' },
];

export default function UserList({handleClick}) {

  const [users,setUsers] = useState([]);
  const navigate = useNavigate(null);

  const getUsers = async() =>{
      try {
          const {data} = await axios.get(`${process.env.REACT_APP_API_URL}/api/v1/users/getAllUsers`,{
            headers:{
              Authorization:localStorage.getItem("token"),
            }
          });
          setUsers(()=>data.data.length === 0 ? [] : data.data);
      } catch (error) {
          console.log(error?.response);
          if(error?.response.status === 400) navigate("/");
      }
  }

  useEffect(()=>{

    getUsers();


  },[]);

  return (
    <section  className='h-screen px-10 overflow-scroll fixed bg-blue-300 text-white z-10 md:w-[30%]  '>
      <Typography variant="h6" sx={{ mt: 2, mb: 2 }}
        onClick={handleClick}
      >
        Chats
      </Typography>
      <List>
        
        {users?.map((user) => (
          <User user={user} handleClick={handleClick} key={user._id} />
        ))}
      </List>
    </section>
  );
}
