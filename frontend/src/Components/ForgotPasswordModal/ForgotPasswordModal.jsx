import React, { useCallback, useEffect, useState } from 'react'
import DialogComp from "../Common/Dialog";
import { Box, Button, TextField, Typography } from '@mui/material';
import axios from 'axios';
import { toast } from 'react-toastify';
import OtpInput from '../OTPInput/OtpInput';

export default function ForgotPasswordModal({ open, close }) {
    const [data, setData] = useState({
        email: "",
        otp: "",
        newPassword: ""
    });
    const [isDisabled, setIsDisabled] = useState(false);
    const [isOTPVisible, setIsOTPVisible] = useState(false);
    const [isPasswordResetVisible, setIsPasswordResetVisible] = useState(false);

    const changeOTP = useCallback((newOTP) => {
        setData((old) => ({ ...old, otp: newOTP }));
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setData({ ...data, [name]: value });
    };

    const closeModal = () =>{
        close();
    }

    const getOTP = async () => {
        try {
            setIsDisabled(true);
            const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/v1/users/forgotPassword`, {
                email: data.email
            });
            toast.success(response.data.message);
            setIsOTPVisible(true);
        } catch (error) {
            toast.error(error?.response?.data?.message || "Error sending OTP");
            setIsDisabled(false);
        }
    };

    const verifyOTP = async () => {
        try {
            const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/v1/users/verifyOTP`, {
                mail: data.email,
                otp: data.otp
            });

            if (response.status === 200) {
                localStorage.setItem("token", response.data.token)
                setIsPasswordResetVisible(true);
                toast.success("OTP verified! Set your new password.");
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Invalid OTP");
        }
    };

    const resetPassword = async () => {
        try {
            if (!data.newPassword.trim()) {
                toast.error("Password cannot be empty");
                return;
            }

            const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/v1/users/resetPassword`, {
                newPassword: data.newPassword
            }, {
                headers: {
                    Authorization: localStorage.getItem("token")
                }
            });

            if (response.status === 200) {
                toast.success("Password reset successfully!");
                closeModal(); // Close modal on success
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Error resetting password");
        }
    };

    useEffect(() => {
        if (open) {
            setData({ email: "", otp: "", newPassword: "" });
            setIsDisabled(false);
            setIsOTPVisible(false);
            setIsPasswordResetVisible(false);
        }
    }, [open]);

    return (
        <DialogComp open={open} handleClose={close} dialogTitle={"Change Password"}>
            {
                !isPasswordResetVisible && (
                    <>
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
                            disabled={isDisabled}
                        />
                        <Button
                            fullWidth
                            variant="contained"
                            color="primary"
                            sx={{ mt: 2, py: 1.5, fontWeight: "bold" }}
                            disabled={isDisabled}
                            onClick={getOTP}
                        >
                            Send OTP
                        </Button>

                        {isOTPVisible && (
                            <Box mt={3}>
                                <Typography variant="h6" align="center" mb={2}>
                                    Enter OTP
                                </Typography>
                                <OtpInput otp={data.otp} setOtp={changeOTP} />
                                <Button
                                    fullWidth
                                    variant="contained"
                                    color="primary"
                                    sx={{ mt: 3, py: 1.5, fontWeight: "bold" }}
                                    onClick={verifyOTP}
                                >
                                    Verify OTP
                                </Button>
                            </Box>
                        )}
                    </>
                )
            }


            {isPasswordResetVisible && (
                <Box mt={3}>
                    <Typography variant="h6" align="center" mb={2}>
                        Set New Password
                    </Typography>
                    <TextField
                        fullWidth
                        label="New Password"
                        name="newPassword"
                        type="password"
                        value={data.newPassword}
                        onChange={handleInputChange}
                        variant="outlined"
                        margin="normal"
                        required
                        placeholder="Enter New Password"
                    />
                    <Button
                        fullWidth
                        variant="contained"
                        color="primary"
                        sx={{ mt: 3, py: 1.5, fontWeight: "bold" }}
                        onClick={resetPassword}
                    >
                        Reset Password
                    </Button>
                </Box>
            )}
        </DialogComp>
    );
}
