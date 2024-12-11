import React, { useState } from "react";
import axios from "axios";
import { Container, Box, TextField, Button, Typography } from "@mui/material";

export default function RegistrationForm() {
  const [data, setData] = useState({
    name: "",
    email: "",
    password: ""
  });

  const [otp, setOTP] = useState("");
  const [isOTPVisible, setIsOTPVisible] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setData({
      ...data,
      [name]: value
    });
  };

  const handleOTPChange = (e) => {
    setOTP(e.target.value);
  };

  const getOTP = async () => {
    try {
      setIsDisabled(true); // Disable inputs and button
      console.log(process.env.REACT_APP_API_URL)
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/v1/users/verifyUser`, {
        email: data.email
      });
      console.log(response.data); // Handle response if needed
      setIsOTPVisible(true); // Show OTP input
    } catch (error) {
      console.error("Error verifying user:", error);
      setIsDisabled(false); // Re-enable inputs and button in case of error
    }
  };

  const handleSubmission = async (e) => {
    e.preventDefault();
    getOTP();
  };

  return (
    <Container maxWidth="xs">
      <Box
        component="form"
        onSubmit={handleSubmission}
        sx={{
          mt: 4,
          p: 3,
          boxShadow: 3,
          borderRadius: 2,
          backgroundColor: "white"
        }}
      >
        <Typography variant="h4" component="h2" align="center" fontWeight="bold" mb={1}>
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
        {isOTPVisible && (
          <TextField
            fullWidth
            label="Enter OTP"
            name="otp"
            value={otp}
            onChange={handleOTPChange}
            variant="outlined"
            margin="normal"
            required
            placeholder="Enter 6-digit OTP"
          />
        )}
        <Button
          fullWidth
          type="submit"
          variant="contained"
          color="primary"
          sx={{
            mt: 2,
            py: 1.5,
            fontWeight: "bold"
          }}
          disabled={isDisabled}
        >
          Register
        </Button>
      </Box>
    </Container>
  );
}
