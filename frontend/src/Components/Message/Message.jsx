import React from 'react';
import { Container, Typography, Box } from '@mui/material';

export default function Message({ message, time, isSender }) {
  return (
    <Container
      sx={{
        display: 'flex',
        justifyContent: isSender ? 'flex-end' : 'flex-start',
        padding: '8px 0',
      }}
    >
      <Box
        sx={{
          maxWidth: '70%',
          padding: '10px 15px',
          borderRadius: '12px',
          backgroundColor: isSender ? '#1976d2' : '#f5f5f5',
          color: isSender ? 'white' : 'black',
          wordBreak: 'break-word',
        }}
      >
        <Typography variant="body1">{message}</Typography>
        <Typography
          variant="caption"
          sx={{
            display: 'block',
            marginTop: '5px',
            color: isSender ? '#cfe2ff' : '#aaa',
            fontSize: '10px',
            textAlign: 'right',
          }}
        >
          {time}
        </Typography>
      </Box>
    </Container>
  );
}
