import { Box } from '@mui/material';
import React from 'react';
import OtpInput from 'react-otp-input';

export default function OtpInputComp({otp,setOtp}) {

  return (
    <Box>
    <OtpInput
      value={otp}
      onChange={setOtp}
      numInputs={6}
      renderSeparator={<span> </span>}
      renderInput={(props) => <input {...props} style={{width:"2rem"}}
      className=" h-12 mx-2  text-center border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
      />}
    />
    </Box>
  );
}