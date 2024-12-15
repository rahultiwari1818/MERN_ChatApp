import { Avatar, Box, ListItem, ListItemAvatar, ListItemText, Typography } from '@mui/material';
import React from 'react';
import  ProfileIcon from "../../Assets/SVGs/Profile.svg"
export default function User({ user,handleClick }) {
  return (
    <ListItem
      key={user._id}
      className='p-4 mb-1 cursor-pointer border-b-white border-b rounded-lg hover:bg-[#1976d2]'
      onClick={()=>{
        handleClick(user._id)
      }}
      
    >
      <ListItemAvatar>
        <Avatar src={user.avatar === "" ? ProfileIcon : user.avatar} alt={user.name} className='rounded outline outline-white p-2'/>
      </ListItemAvatar>
      <ListItemText
        primary={
          <Typography
            variant="body1"
            className='font-medium'
          >
            {user.name}
          </Typography>
        }
        secondary={
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography
              variant="body2"
              noWrap
              sx={{
                maxWidth: '70%',
                color: 'inherit', // Text adapts to hover color
              }}
              className=''
            >
              {user.lastMessage}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                ml: 2,
                color: 'inherit', // Adapts to hover color
              }}
            >
              {user.time}
            </Typography>
          </Box>
        }
      />
    </ListItem>
  );
}
