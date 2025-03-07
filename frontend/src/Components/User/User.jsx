import { Avatar, Box, Container, ListItem, ListItemAvatar, ListItemText, Skeleton, Typography } from '@mui/material';
import React from 'react';
import ProfileIcon from "../../Assets/SVGs/Profile.svg"
import { useChat } from '../../Contexts/ChatProvider';
import OnlineIcon from "../../Assets/Images/OnlineIcon.png";
export default function User({ user, handleClick, isSkeleton }) {
  const { changeRecipient } = useChat();

  if (isSkeleton) {
    return (
      <Container sx={{ display: 'flex', justifyContent: "around",gap:"10px", padding: '8px 0' }}>
        <Box sx={{backgroundColor:"#f0f0f0",borderRadius: '12px',padding:"5px"}}>
          <Skeleton variant="circular" width={50} height={50} />

        </Box>
        <Box sx={{ maxWidth: '80%', padding: '10px 15px', borderRadius: '12px', backgroundColor: '#f0f0f0' }}>
          <Skeleton variant="text" width={300} height={20} />
          <Skeleton variant="text" width={150} height={15} />
        </Box>
      </Container>
    )
  }

  return (
    <ListItem
      key={user._id}
      className='p-4 mb-1 cursor-pointer border-b-white border-b rounded-lg hover:bg-[#1976d2]'
      onClick={() => {
        handleClick()
        changeRecipient(user);
      }}

    >
      <ListItemAvatar className='relative'>
        <Avatar src={user?.profilePic ? user?.profilePic : ProfileIcon} alt={user.name} className={`${!user?.profilePic ? 'rounded outline outline-white p-2 bg-white' : ''} `} sx={!user?.profilePic ? { width: 40, height: 40 } : { backgroundColor: "#ffffff" }}
        />
        {
          user?.isOnline
          &&
          <img src={OnlineIcon} alt="icon" className='h-16 w-10 absolute top-1 left-3' />
        }

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
              className='text-green-900'
            >
              {user?.lastMessage}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                ml: 2,
                color: 'inherit', // Adapts to hover color
              }}
            >
              {user?.noOfUnreadMessages > 1 ? user?.noOfUnreadMessages : ""}
            </Typography>
          </Box>
        }
      />
    </ListItem>
  );
}
