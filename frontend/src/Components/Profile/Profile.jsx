import React, { useEffect, useState } from 'react'
import ProfileIcon from "../../Assets/SVGs/Profile.svg";
import { TextField, Typography } from '@mui/material';
import axios from 'axios';




export default function Profile() {


  const [userData, setUserData] = useState({});

  const fetchProfileData = async () => {
    try {
      const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/api/v1/users/profile`, {
        headers: {
          Authorization: localStorage.getItem("token"),
        }
      })
      setUserData(() => data.data);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    fetchProfileData();
  }, []);


  return (
    <section className='rounded-lg shadow-lg bg-white m-5 p-5 flex justify-center items-center gap-10'>
      <section className=''>
        <section className='p-5 rounded-lg shadow-lg '>
          <img src={userData.profilePic ? userData.profilePic : ProfileIcon} alt="User Image" className='h-20 w-20' />
        </section>
        <section>

        </section>
      </section>
      <section>
        <section className='flex justify-around gap-10'>
          <Typography variant='h4'>
            User
          </Typography>
          <TextField
            fullWidth
            name="name"
            type="text"
            variant="outlined"
            margin="normal"
            required
            placeholder="Your Name"
            value={userData.name}
          />

        </section>
      </section>
    </section>
  )
}
