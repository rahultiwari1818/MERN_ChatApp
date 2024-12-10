import React, { useState } from "react";
import axios from "axios";
import { Container, Box, TextField, Button, Typography } from "@mui/material";

export default function RegistrationForm() {
  const [data, setData] = useState({
    name: "",
    email: "",
    password: ""
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setData({
      ...data,
      [name]: value
    });
  };

  const handleSubmission = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/api/v1/user/register`,
        data
      );
      console.log("Registration successful:", response.data);
    } catch (error) {
      console.error("Error during registration:", error);
    }
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
          sx={{
            mt: 2,
            py: 1.5,
            fontWeight: "bold"
          }}
        >
          Register
        </Button>
      </Box>
    </Container>
  );
}
