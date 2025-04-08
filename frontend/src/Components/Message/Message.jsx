import React, { useCallback, useEffect, useState } from "react";
import {
  Container,
  Typography,
  Box,
  DialogActions,
  Button,
  Skeleton,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  Radio,
  RadioGroup,
  FormControlLabel,
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
import { useChat } from "../../Contexts/ChatProvider";
import DeletionDialogBox from "./DeletionDialogBox";

export default function Message({
  message,
  time,
  isSender,
  messageId,
  onDeletingMessage,
  readReceipts,
  isSkeleton,
  media,
  isGroup,
  senderName,
  senderProfilePic,
}) {
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  const [medias,setMedias] = useState(media);

  useEffect(()=>{
   setMedias((old)=>media);
  },[media]);

  const [openMediPreview, setOpenMediaPreview] = useState({
    isOpen: false,
    url: "",
    type: "",
  });



  const { recipient } = useChat();

  const closeMediaPreview = useCallback(() => {
    setOpenMediaPreview({
      isOpen: false,
      url: "",
      type: "",
    });
  }, []);

  const setMediaData = (url, type) => {
    setOpenMediaPreview(() => {
      return {
        isOpen: true,
        url: url,
        type: type,
      };
    });
  };

  const deleteMedia = useCallback(async (deleteChat, mediaUrl) => {
    try {
      if (!messageId) return;
      if (readReceipts === "not sent") return;

      const url = recipient?.isGroup
        ? `${process.env.REACT_APP_API_URL}/api/v1/group/deleteMedia/${messageId}`
        : `${process.env.REACT_APP_API_URL}/api/v1/messages/deleteMedia/${messageId}`;
      const response = await axios.delete(url, {
        data: { mediaUrl: mediaUrl },
        headers: {
          Authorization: localStorage.getItem("token"),
        },
      });

      if (response.data.result) {
        toast.success(response.data.message || "Message deleted successfully.");
        setMedias((old)=>{
          return old.filter((media)=>{
            return media.url !== mediaUrl
          })
        })
      } else {
        toast.error(response.data.message || "Failed to delete the message.");
      }

      closeMediaPreview();
    } catch (error) {
      console.log(error);
    }
  }, []);

  const deleteHandler = useCallback(
    async (deleteChat) => {
      try {
        if (!messageId) {
          toast.error("Message ID is required.");
          return;
        }

        if (readReceipts === "not sent") return;

        const url = recipient?.isGroup
          ? deleteChat === "me"
            ? `${process.env.REACT_APP_API_URL}/api/v1/group/deleteGroupMessage/${messageId}`
            : `${process.env.REACT_APP_API_URL}/api/v1/group/deleteGroupMessage/deleteForEveryone/${messageId}`
          : deleteChat === "me"
          ? `${process.env.REACT_APP_API_URL}/api/v1/messages/${messageId}`
          : `${process.env.REACT_APP_API_URL}/api/v1/messages/deleteForEveryone/${messageId}`;
        const response = await axios.delete(url, {
          headers: {
            Authorization: localStorage.getItem("token"),
          },
        });

        if (response.data.result) {
          toast.success(
            response.data.message || "Message deleted successfully."
          );
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
    },
    [messageId]
  );

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
          alignItems: "center",
        }}
        className="cursor-pointer"
      >
        {!isSender && isGroup && (
          <Avatar
            src={senderProfilePic}
            alt={senderName}
            sx={{ width: 32, height: 32, marginRight: 1 }}
          />
        )}
        <Box
          sx={{
            maxWidth: "70%",
            padding: "10px 15px",
            borderRadius: "12px",
            backgroundColor: isSender ? "#93C5FD" : "#f5f5f5",
            color: isSender ? "white" : "black",
            wordBreak: "break-word",
          }}
          onClick={() => {
            if (media?.length > 0) return;
            setOpenDeleteDialog(true);
          }}
        >
          {isGroup && !isSender && (
            <Typography
              variant="caption"
              className="text-wrap text-[8px] md:text-xs lg:text-sm text-blue-500"
            >
              {senderName}
            </Typography>
          )}
          <Typography className="text-wrap text-xs md:text-sm lg:text-base">
            {message}
          </Typography>
          {medias?.length > 0 && (
            <Box sx={{ marginTop: "10px" }}>
              {medias.map((item, index) => {
                if (item.type.includes("image")) {
                  return (
                    <img
                      key={index}
                      src={item.url}
                      loading="lazy"
                      alt={`media-${index}`}
                      style={{
                        width: "100%",
                        maxWidth: "300px",
                        borderRadius: "8px",
                      }}
                      className="my-2"
                      onClick={() => setMediaData(item.url, item.type)}
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
                      onClick={() => setMediaData(item.url, item.type)}
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
                return null;
              })}
            </Box>
          )}
          <section className="flex justify-between items-center gap-2">
            <Typography
              variant="caption"
              sx={{
                marginTop: "5px",
                color: isSender ? "#cfe2ff" : "#aaa",
                fontSize: "10px",
                textAlign: "right",
              }}
            >
              {formatDate(time)}
            </Typography>
            {!isGroup && isSender && (
              <img
                src={
                  readReceipts === "read"
                    ? ReadTick
                    : readReceipts === "delivered"
                    ? DoubleTick
                    : readReceipts === "sent"
                    ? SingleTick
                    : NotSentIcon
                }
                alt="status"
                className="h-5 w-5"
              />
            )}
          </section>
        </Box>
      </Container>
      <DeletionDialogBox
        open={openDeleteDialog}
        handleClose={closeDialog}
        deleteHandler={deleteHandler}
        isSender={isSender}
      />
      <MediaPreviewModal
        open={openMediPreview.isOpen}
        close={closeMediaPreview}
        url={openMediPreview.url}
        type={openMediPreview.type}
        deleteFunc={deleteMedia}
        isSender={isSender}
      />
    </>
  );
}

// function DeletionDialogBox({ open, handleClose, deleteHandler, isSender }) {
//   const [deleteOption, setDeleteOption] = useState("me");

//   return (
//     <Dialog open={open} onClose={handleClose}>
//       <DialogTitle>Delete message?</DialogTitle>
//       <DialogContent>
//         {isSender ? (
//           <>
//             <Typography>
//               You can delete messages for everyone or just for yourself.
//             </Typography>
//             <RadioGroup
//               value={deleteOption}
//               onChange={(e) => setDeleteOption(e.target.value)}
//             >
//               <FormControlLabel
//                 value="me"
//                 control={<Radio />}
//                 label="Delete for me"
//               />
//               <FormControlLabel
//                 value="everyone"
//                 control={<Radio />}
//                 label="Delete for everyone"
//               />
//             </RadioGroup>
//           </>
//         ) : (
//           <Typography>
//             This has no effect on your recipient's chat.!.
//           </Typography>
//         )}
//       </DialogContent>
//       <DialogActions>
//         <Button onClick={handleClose}>Cancel</Button>
//         <Button
//           onClick={() => deleteHandler(deleteOption)}
//           sx={{
//             backgroundColor: "red",
//             color: "white",
//             textTransform: "none",
//             fontWeight: "bold",
//             padding: "8px 16px",
//             borderRadius: "4px",
//             border: "2px solid transparent",
//             transition: "all 0.3s ease-in-out",
//             "&:hover": {
//               backgroundColor: "white",
//               color: "red",
//               border: "2px solid red",
//             },
//           }}
//         >
//           Delete
//         </Button>
//       </DialogActions>
//     </Dialog>
//   );
// }

// function DeletionDialogBox({ open, handleClose, deleteHandler }) {
//   const [deleteOption, setDeleteOption] = useState("me");

//   return (
//     <DialogComp
//       open={open}
//       handleClose={handleClose}
//       dialogTitle="Delete message?"
//     >
//       <Typography variant="h6" className="text-red-500">
//         This Can Be Reverted Back. Are you Sure?
//       </Typography>
//       <DialogActions>
//         <Button
//           onClick={deleteHandler}
//           sx={{
//             backgroundColor: "red",
//             color: "white",
//             textTransform: "none",
//             fontWeight: "bold",
//             padding: "8px 16px",
//             borderRadius: "4px",
//             border: "2px solid transparent",
//             transition: "all 0.3s ease-in-out",
//             "&:hover": {
//               backgroundColor: "white",
//               color: "red",
//               border: "2px solid red",
//             },
//           }}
//         >
//           Delete
//         </Button>
//       </DialogActions>
//     </DialogComp>
//   );
// }
