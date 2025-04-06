import { Box, Button, Container, TextField, Typography } from '@mui/material'
import React, { useCallback, useState } from 'react'
import Overlay from '../Common/Overlay';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from "../../Contexts/AuthProvider";
import ForgotPasswordModal from '../ForgotPasswordModal/ForgotPasswordModal';
import GoogleLogin from '../GoogleLogin/GoogleLogin';

export default function  Login() {

    const { login } = useAuth();

    

    const [data, setData] = useState({
        email: "",
        password: ""
    })
    const [showOverlay, setShowOverlay] = useState(false);


    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setData({
            ...data,
            [name]: value
        });
    };

    const [openForgotPasswordModal,setOpenForgotPasswordModal] = useState(false);

    const closeForgotPasswordModal = useCallback(()=>{
        setOpenForgotPasswordModal(false);
    },[]);

    const handleSubmission = async (e) => {
        e.preventDefault();
        try {
            setShowOverlay(true)
            const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/v1/users/login`, {
                mail: data.email,
                password: data.password
            });
            toast.success(response.data.message);
            login(response.data.token, { email: data.email });
        } catch (error) {
            console.log(error);
            if (error?.response?.data) {
                toast.error(error?.response?.data?.message);
            }
        }
        finally {
            setShowOverlay(false)
        }
    }


    return (
        <>
            {
                showOverlay
                &&
                <Overlay />
            }
            <Container maxWidth="xs" className='mt-60 lg:mt-5 min-h-fit' >

                <Box
                    component="form"
                    onSubmit={handleSubmission}
                    sx={{
                        mt: 4,
                        p: 3,
                        boxShadow: 3,
                        borderRadius: 2,
                        backgroundColor: "white"
                    }}>
                    <Typography variant="h4" component="h2" align="center" fontWeight="bold" mb={1}>
                        Login
                    </Typography>
                    <TextField
                        fullWidth
                        label="Email"
                        name="email"
                        type="email"
                        value={data.email}
                        onChange={handleInputChange}
                        variant="outlined"
                        margin="normal"
                        required
                        placeholder="Your Email"
                    />
                    <TextField
                        fullWidth
                        label="Password"
                        name="password"
                        type="password"
                        value={data.password}
                        onChange={handleInputChange}
                        variant="outlined"
                        margin="normal"
                        required
                        placeholder="Your Password"
                    />
                    <Button
                        fullWidth
                        type="submit"
                        variant="contained"
                        color="primary"
                        sx={{ mt: 2, py: 1.5, fontWeight: "bold" }}
                    >
                        Login
                    </Button>
                        <GoogleLogin isLogin={true}/>
                    <button
                    type='button'
                        className='my-3 px-5 py-3 bg-red-500 text-white hover:text-red-500 hover:bg-white hover:outline hover:outline-red-500 rounded'
                        onClick={()=>setOpenForgotPasswordModal(true)}
                    >
                        Forgot Password
                    </button>
                </Box>
            </Container>
            <ForgotPasswordModal open={openForgotPasswordModal} close={closeForgotPasswordModal}/>
        </>
    )
}
