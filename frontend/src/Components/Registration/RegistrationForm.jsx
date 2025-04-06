import React, { useCallback, useState } from "react";
import axios from "axios";
import { Container, Box, TextField, Button, Typography } from "@mui/material";
import OtpInput from "../OTPInput/OtpInput.jsx";
import { toast } from "react-toastify";
import Overlay from "../Common/Overlay.jsx";
import GoogleLogin from "../GoogleLogin/GoogleLogin.jsx";

export default function RegistrationForm() {
  const [data, setData] = useState({ name: "", email: "", password: "" });
  const [otp, setOTP] = useState("");
  const [isOTPVisible, setIsOTPVisible] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);

  const [showOverlay, setShowOverlay] = useState(false);

  const changeOTP = useCallback((newOTP) => {
    setOTP(() => newOTP);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setData({
      ...data,
      [name]: value,
    });
  };

  const getOTP = async () => {
    try {
      setIsDisabled(true);
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/v1/users/verifyUser`,
        {
          email: data.email,
        }
      );
      toast.success(response.data.message);
      setIsOTPVisible(true);
    } catch (error) {
      console.error("Error verifying user:", error);
      setIsDisabled(false);
    }
  };

  const verifyOTP = async () => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/v1/users/verifyOTP`,
        {
          mail: data.email,
          otp: otp,
        }
      );
      setShowOverlay(() => true);
      registerUser();
    } catch (error) {
      console.error("Error verifying OTP:", error);
      toast.error(error.response.message);
    }
  };

  const handleSubmission = async (e) => {
    e.preventDefault();
    getOTP();
  };

  const registerUser = async () => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/v1/users/register`,
        {
          mail: data.email,
          name: data.name,
          password: data.password,
        }
      );

      setShowOverlay(false);
      setData(() => {
        return {
          name: "",
          email: "",
          password: "",
        };
      });
      setOTP("");
      setIsDisabled(false);
      setIsOTPVisible(false);
    } catch (error) {
      if (error?.response?.status === 401) {
        toast.error(error?.response?.data?.message);
      }
      setOTP("");
      setIsDisabled(false);
      setIsOTPVisible(false);
      console.log("Registration Error : ", error);
    }
  };

  return (
    <>
      {showOverlay && <Overlay />}
      <Container maxWidth="xs" className="mb-10">
        <Box
          component="form"
          onSubmit={handleSubmission}
          sx={{
            mt: 4,
            p: 3,
            boxShadow: 3,
            borderRadius: 2,
            backgroundColor: "white",
          }}
        >
          <Typography
            variant="h4"
            component="h2"
            align="center"
            fontWeight="bold"
            mb={1}
          >
            Welcome
          </Typography>
          <Typography variant="h6" component="h3" align="center" mb={4}>
            Sign up now to get started
          </Typography>
          <TextField
            fullWidth
            label="Name"
            name="name"
            value={data.name}
            onChange={handleInputChange}
            variant="outlined"
            margin="normal"
            required
            placeholder="Your Name"
            disabled={isDisabled}
          />
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
            disabled={isDisabled}
          />
          <Button
            fullWidth
            type="submit"
            variant="contained"
            color="primary"
            sx={{ mt: 2, py: 1.5, fontWeight: "bold" }}
            disabled={isDisabled}
          >
            Register
          </Button>
          <GoogleLogin isLogin={false} />

          {isOTPVisible && (
            <Box mt={3}>
              <Typography variant="h6" align="center" mb={2}>
                Enter OTP
              </Typography>
              <Box>
                <OtpInput otp={otp} setOtp={changeOTP} />
              </Box>
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
        </Box>
      </Container>
    </>
  );
}
