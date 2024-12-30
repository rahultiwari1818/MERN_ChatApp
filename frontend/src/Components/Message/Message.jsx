import React, { useCallback, useState } from 'react';
import { Container, Typography, Box, DialogActions, Button } from '@mui/material';
import { toast } from "react-toastify";
import DialogComp from '../Common/Dialog';
import axios from 'axios';

export default function Message({ message, time, isSender, messageId, onDeletingMessage }) {

  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  const deleteHandler = useCallback(async () => {
    try {
      if (!messageId) {
        toast.error("Message ID is required.");
        return;
      }


      // Make the DELETE API call
      const response = await axios.delete(
        `${process.env.REACT_APP_API_URL}/api/v1/messages/${messageId}`,
        {
          headers: {
            Authorization: localStorage.getItem("token"), // Include the token for authentication
          },
        }
      );

      if (response.data.result) {
        toast.success(response.data.message || "Message deleted successfully.");
        onDeletingMessage(messageId);
      } else {
        toast.error(response.data.message || "Failed to delete the message.");
      }
    } catch (error) {
      console.error("Error while deleting the message:", error);
      toast.error(
        error.response?.data?.message || "An error occurred while deleting the message."
      );
    }
    finally{
      closeDialog();
    }
  }, []);


  // const deleteHandle = async () => {
  //   try {
  //     if (!messageId) {
  //       toast.error("Message ID is required.");
  //       return;
  //     }

  //     console.log("Deleting message with ID:", messageId);

  //     // Make the DELETE API call
  //     const response = await axios.delete(
  //       `${process.env.REACT_APP_API_URL}/api/v1/messages/${messageId}`,
  //       {
  //         headers: {
  //           Authorization: localStorage.getItem("token"), // Include the token for authentication
  //         },
  //       }
  //     );

  //     if (response.data.result) {
  //       toast.success(response.data.message || "Message deleted successfully.");
  //       onDeletingMessage(messageId);
  //     } else {
  //       toast.error(response.data.message || "Failed to delete the message.");
  //     }
  //   } catch (error) {
  //     console.error("Error while deleting the message:", error);
  //     toast.error(
  //       error.response?.data?.message || "An error occurred while deleting the message."
  //     );
  //   }
  // };


  const closeDialog = useCallback(() => {
    setOpenDeleteDialog(false);
  }, []);



  return (
    <>
      <Container
        sx={{
          display: 'flex',
          justifyContent: isSender ? 'flex-end' : 'flex-start',
          padding: '8px 0',
        }}
        className='cursor-pointer'
        onClick={() => {
          setOpenDeleteDialog(true);
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
      <DeletionDialogBox open={openDeleteDialog} handleClose={closeDialog} deleteHandler={deleteHandler}/>
    </>
  );
}


// --------------------------------------- Dialog Box For Deleting ----------------------------------------


function DeletionDialogBox({ open, handleClose,deleteHandler }) {
  return (
    <DialogComp open={open} handleClose={handleClose} dialogTitle="Delete This Message">
      <Typography variant="h6" className='text-red-500'>
        This Can Be Reverted Back.
        Are you Sure ?
      </Typography>
      <DialogActions>
        <Button onClick={deleteHandler}>Delete</Button>
      </DialogActions>
    </DialogComp>
  )
}
