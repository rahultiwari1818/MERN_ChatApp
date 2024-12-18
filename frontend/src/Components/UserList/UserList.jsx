import React, { useEffect, useState } from 'react';
import {
  List,
  Typography,
} from '@mui/material';
import User from '../User/User';
import axios from "axios";
import { useNavigate } from 'react-router-dom';


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
        onClick={()=>handleClick(undefined)}
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
