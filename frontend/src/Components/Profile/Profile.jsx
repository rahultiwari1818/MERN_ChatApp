import React, { useEffect, useState } from 'react';
import { Avatar, Typography, TextField, Button, } from '@mui/material';
import axios from 'axios';
import ProfileIcon from "../../Assets/SVGs/Profile.svg";
import {ReactComponent as CameraIcon} from "../../Assets/SVGs/CameraIcon.svg";
export default function Profile() {
  const [userData, setUserData] = useState({});
  const [editable, setEditable] = useState(false);
  const [updatedData, setUpdatedData] = useState({ name: '', email: '' });

  const fetchProfileData = async () => {
    try {
      const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/api/v1/users/profile`, {
        headers: {
          Authorization: localStorage.getItem("token"),
        },
      });
      setUserData(data.data);
      setUpdatedData({ name: data.data.name, email: data.data.email });
    } catch (err) {
      // setError('Failed to fetch profile data');
    }
  };

  const handleEditToggle = () => {
    setEditable((prev) => !prev);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUpdatedData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveChanges = async () => {
    try {
      await axios.put(`${process.env.REACT_APP_API_URL}/api/v1/users/profile`, updatedData, {
        headers: {
          Authorization: localStorage.getItem("token"),
        },
      });
      setUserData(updatedData);
      setEditable(false);
    } catch (err) {
      // setError('Failed to update profile');
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, []);


  return (
    <section className="rounded-lg shadow-lg bg-white m-5 p-5 flex flex-col md:flex-row justify-center items-center gap-10">
      <section className="flex flex-col items-center gap-4 relative">
        <Avatar
          src={userData.profilePic ? userData.profilePic : ProfileIcon}
          alt="User Image"
          sx={{ width: 120, height: 120 }}
          className='outline outline-blue-300 p-3'
        />
        <button className='absolute bottom-0  right-2 outline bg-white p-2    rounded-xl'>
          <CameraIcon/>
        </button>
        {/* <Button variant="contained" color="primary" size="small" onClick={handleEditToggle}>
          {editable ? 'Cancel' : 'Edit Profile'}
        </Button> */}
      </section>

      <section className="w-full md:w-2/3">
        <Typography variant="h4" className="mb-4">
          User Profile
        </Typography>

        <TextField
          fullWidth
          name="name"
          label="Name"
          variant="outlined"
          margin="normal"
          disabled={true}
          value={updatedData.name}
          onChange={handleInputChange}
        />

        <TextField
          fullWidth
          name="email"
          label="Email"
          variant="outlined"
          margin="normal"
          disabled={true}
          value={updatedData.email}
          onChange={handleInputChange}
        />

        {/* {editable && (
          <Button
            variant="contained"
            color="success"
            className="mt-4"
            onClick={handleSaveChanges}
          >
            Save Changes
          </Button>
        )} */}
      </section>
    </section>
  );
}
