import React, { useEffect, useState } from 'react';
import { Avatar, Typography, TextField, } from '@mui/material';
import axios from 'axios';
import ProfileIcon from "../../Assets/SVGs/Profile.svg";
import {ReactComponent as CameraIcon} from "../../Assets/SVGs/CameraIcon.svg";
import {toast} from "react-toastify";

export default function Profile() {
  const [userData, setUserData] = useState({});
  // const [editable, setEditable] = useState(false);
  const [updatedData, setUpdatedData] = useState({ name: '', email: '' });
  const [friendEmail,setFriendEmail] = useState("");

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

  // const handleEditToggle = () => {
  //   setEditable((prev) => !prev);
  // };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUpdatedData((prev) => ({ ...prev, [name]: value }));
  };

  const inviteFriendHandler = async ( ) =>{
    try {

      const {data} = await axios.post(`${process.env.REACT_APP_API_URL}/api/v1/users/inviteFriend`,{friendMail:friendEmail},{
        headers:{
          Authorization:localStorage.getItem("token")
        }
      })

      toast.success(data.message);
      setFriendEmail("");
      
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.error?.message)
    }
  }

  // const handleSaveChanges = async () => {
  //   try {
  //     await axios.put(`${process.env.REACT_APP_API_URL}/api/v1/users/profile`, updatedData, {
  //       headers: {
  //         Authorization: localStorage.getItem("token"),
  //       },
  //     });
  //     setUserData(updatedData);
  //     setEditable(false);
  //   } catch (err) {
  //     // setError('Failed to update profile');
  //   }
  // };

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
        <section className='lg:flex justify-between items-center p-4 my-4 outline outline-blue-300 rounded-lg gap-5'>
          <Typography variant="h4" color="initial">
            Invite a Friend to Chat
          </Typography>
          <TextField
          fullWidth
          name="email"
          label="Email"
          type="email"
          variant="outlined"
          margin="normal"
          value={friendEmail}
          onChange={(e)=>setFriendEmail(e.target.value)}
        />
        <button
        className='bg-blue-400 text-white rounded-lg px-4 py-3 hover:text-blue-400 hover:bg-white hover:outline hover:outline-blue-400'
        onClick={inviteFriendHandler}
        >
          Invite
        </button>

        </section>
      </section>
    </section>
  );
}
