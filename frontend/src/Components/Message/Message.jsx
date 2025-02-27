import React, { useCallback, useState } from 'react';
import { Container, Typography, Box, DialogActions, Button } from '@mui/material';
import { toast } from "react-toastify";
import DialogComp from '../Common/Dialog';
import axios from 'axios';
import { formatDate } from '../../Utils/utils';
import ReadTick from "../../Assets/Images/ReadTick.png";
import DoubleTick from "../../Assets/Images/DoubleTick.png";
import SingleTick from "../../Assets/Images/SingleTick.png";
import NotSentIcon from "../../Assets/Images/NotSentIcon.png";

export default function Message({ message, time, isSender, messageId, onDeletingMessage,isSent,isReceived,isRead }) {

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
    finally {
      closeDialog();
    }
  }, []);




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
          onClick={() => {
            if(!isSender) return;
            setOpenDeleteDialog(true);
          }}
        >
          <Typography  className='text-wrap text-xs md:text-sm lg:text-base'>{message}</Typography>
          <section className="flex justify-between items-center gap-2">
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
              {formatDate(time)}
            </Typography>
            {
              isSender ?
              (
              
              isRead
              ?
              
              <img src={ReadTick} alt="read" srcset="" className='h-5 w-5'/>
              
              :
              isReceived
              ?
              <img src={DoubleTick} alt="received" srcset="" className='h-5 w-5'/>
              :
              isSent
              ?
              <img src={SingleTick} alt="sent" srcset="" className='h-5 w-5'/>
              :
              <img src={NotSentIcon} alt="not sent" srcset="" className='h-5 w-5 '/>
              )
              :
              <></>
            }
          </section>
        </Box>
      </Container>
      <DeletionDialogBox open={openDeleteDialog} handleClose={closeDialog} deleteHandler={deleteHandler} />
    </>
  );
}


// --------------------------------------- Dialog Box For Deleting ----------------------------------------


function DeletionDialogBox({ open, handleClose, deleteHandler }) {
  return (
    <DialogComp open={open} handleClose={handleClose} dialogTitle="Delete This Message">
      <Typography variant="h6" className='text-red-500'>
        This Can Be Reverted Back.
        Are you Sure ?
      </Typography>
      <DialogActions>
        <Button
          onClick={deleteHandler}
          sx={{
            backgroundColor: 'red',
            color: 'white',
            textTransform: 'none',
            fontWeight: 'bold',
            padding: '8px 16px',
            borderRadius: '4px',
            border: '2px solid transparent',
            transition: 'all 0.3s ease-in-out',
            '&:hover': {
                backgroundColor: 'white',
                color: 'red',
                border: '2px solid red',
            },
          }}
        >
          Delete
        </Button>
      </DialogActions>
    </DialogComp>
  )
}
