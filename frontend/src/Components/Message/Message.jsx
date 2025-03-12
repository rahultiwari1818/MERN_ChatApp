import React, { useCallback, useState } from "react";
import {
  Container,
  Typography,
  Box,
  DialogActions,
  Button,
  Skeleton,
} from "@mui/material";
import { toast } from "react-toastify";
import DialogComp from "../Common/Dialog";
import axios from "axios";
import { formatDate } from "../../Utils/utils";
import ReadTick from "../../Assets/Images/ReadTick.png";
import DoubleTick from "../../Assets/Images/DoubleTick.png";
import SingleTick from "../../Assets/Images/SingleTick.png";
import NotSentIcon from "../../Assets/Images/NotSentIcon.png";
import MediaPreviewModal from "../Common/MediaPreviewModal";

export default function Message({
  message,
  time,
  isSender,
  messageId,
  onDeletingMessage,
  readReceipts,
  isSkeleton,
  media,
}) {
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  const [openMediPreview,setOpenMediaPreview] = useState({
    isOpen : false,
    url:"",
    type:""
  });

  const closeMediaPreview = useCallback(()=>{
    setOpenMediaPreview({
      isOpen : false,
      url:"",
      type:""
    })
  },[]);

  const setMediaData = (url,type)=>{
    setOpenMediaPreview(()=>{
      return {
        isOpen:true,
        url:url,
        type:type

      }
    })
  }


  const deleteHandler = useCallback(async () => {
    try {
      if (!messageId) {
        toast.error("Message ID is required.");
        return;
      }

      if(readReceipts === "not sent") return;

      const response = await axios.delete(
        `${process.env.REACT_APP_API_URL}/api/v1/messages/${messageId}`,
        {
          headers: {
            Authorization: localStorage.getItem("token"),
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
        error.response?.data?.message ||
          "An error occurred while deleting the message."
      );
    } finally {
      closeDialog();
    }
  }, [messageId, onDeletingMessage]);

  const closeDialog = useCallback(() => {
    setOpenDeleteDialog(false);
  }, []);

  if (isSkeleton) {
    return (
      <Container
        sx={{
          display: "flex",
          justifyContent: isSender ? "flex-end" : "flex-start",
          padding: "8px 0",
        }}
      >
        <Box
          sx={{
            maxWidth: "70%",
            padding: "10px 15px",
            borderRadius: "12px",
            backgroundColor: "#f0f0f0",
          }}
        >
          <Skeleton variant="text" width={200} height={20} />
          <Skeleton variant="text" width={100} height={15} />
        </Box>
      </Container>
    );
  }

  return (
    <>
      <Container
        sx={{
          display: "flex",
          justifyContent: isSender ? "flex-end" : "flex-start",
          padding: "8px 0",
        }}
        className="cursor-pointer"
      >
        <Box
          sx={{
            maxWidth: "70%",
            padding: "10px 15px",
            borderRadius: "12px",
            backgroundColor: isSender ? "#1976d2" : "#f5f5f5",
            color: isSender ? "white" : "black",
            wordBreak: "break-word",
          }}
          onClick={() => {
            if(media?.length > 0) return;
            setOpenDeleteDialog(true);
          }}
        >
          {/* Render the message text */}
          <Typography className="text-wrap text-xs md:text-sm lg:text-base">
            {message}
          </Typography>

          {/* Render media (images, videos, etc.) */}
          {media?.length > 0 ? (
            <Box sx={{ marginTop: "10px" }}>
              {media &&
                media.length > 0 &&
                media.map((item, index) => {
                  if (item.type.includes("image")) {
                    return (
                      <img
                        key={index}
                        src={item.url}
                        alt={`media-${index}`}
                        style={{
                          width: "100%",
                          maxWidth: "300px",
                          borderRadius: "8px",
                        }}
                        className="my-2"
                        onClick={()=>setMediaData(item.url,item.type)}
                      />
                    );
                  }
                  if (item.type.includes("video")) {
                    return (
                      <video
                        key={index}
                        controls
                        style={{
                          width: "100%",
                          maxWidth: "300px",
                          borderRadius: "8px",
                        }}
                        className="my-2"
                        onClick={()=>setMediaData(item.url,item.type)}
                      >
                        <source src={item.url} type={item.type} />
                        Your browser does not support the video tag.
                      </video>
                    );
                  }
                  if (item.type.includes("audio")) {
                    return (
                      <audio
                        key={index}
                        controls
                        style={{ width: "100%", maxWidth: "300px" }}
                        className="my-2"

                      >
                        <source src={item.url} type={item.type} />
                        Your browser does not support the audio tag.
                      </audio>
                    );
                  }
                  return null; // If the media type is not supported
                })}
            </Box>
          ) : (
            <></>
          )}

          {/* Message time and read status */}
          <section className="flex justify-between items-center gap-2">
            <Typography
              variant="caption"
              sx={{
                display: "block",
                marginTop: "5px",
                color: isSender ? "#cfe2ff" : "#aaa",
                fontSize: "10px",
                textAlign: "right",
              }}
            >
              {formatDate(time)}
            </Typography>
            {isSender &&
              (readReceipts === "read" ? (
                <img src={ReadTick} alt="read" className="h-5 w-5" />
              ) : readReceipts === "delivered" ? (
                <img src={DoubleTick} alt="received" className="h-5 w-5" />
              ) : readReceipts === "sent" ? (
                <img src={SingleTick} alt="sent" className="h-5 w-5" />
              ) : (
                <img src={NotSentIcon} alt="not sent" className="h-5 w-5" />
              ))}
          </section>
        </Box>
      </Container>
      <DeletionDialogBox
        open={openDeleteDialog}
        handleClose={closeDialog}
        deleteHandler={deleteHandler}
      />
      <MediaPreviewModal open={openMediPreview.isOpen} close={closeMediaPreview} url={openMediPreview.url} type={openMediPreview.type}/>
    </>
  );
}

function DeletionDialogBox({ open, handleClose, deleteHandler }) {
  return (
    <DialogComp
      open={open}
      handleClose={handleClose}
      dialogTitle="Delete This Message"
    >
      <Typography variant="h6" className="text-red-500">
        This Can Be Reverted Back. Are you Sure?
      </Typography>
      <DialogActions>
        <Button
          onClick={deleteHandler}
          sx={{
            backgroundColor: "red",
            color: "white",
            textTransform: "none",
            fontWeight: "bold",
            padding: "8px 16px",
            borderRadius: "4px",
            border: "2px solid transparent",
            transition: "all 0.3s ease-in-out",
            "&:hover": {
              backgroundColor: "white",
              color: "red",
              border: "2px solid red",
            },
          }}
        >
          Delete
        </Button>
      </DialogActions>
    </DialogComp>
  );
}
