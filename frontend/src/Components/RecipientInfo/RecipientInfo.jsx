import React, { useCallback, useState } from "react";
import { formatDate } from "../../Utils/utils";
import { Avatar, Typography } from "@mui/material";
import ProfileIcon from "../../Assets/SVGs/Profile.svg";
import { useChat } from "../../Contexts/ChatProvider";
import axios from "axios";
import { toast } from "react-toastify";
import UserDialog from "../RecipientInfoDialog/RecipientInfoDialog";

export default function RecipientInfo({ clearChatMessagesHandler }) {
  const {
    recipient,
    changeBlockingStatus,
    removeExistingMemberFromGroup,
    changeGroupMemberRole,
  } = useChat();
  const [openUserDialog, setOpenUserDialog] = useState(false);
  const [openUpdateProfileDialog, setOpenUpdateProfileDialog] = useState(false);

  const [openAddUserDialog, setOpenAddUserDialog] = useState(false);

  const openAddUserDialogHandler = useCallback(() => {
    setOpenAddUserDialog(true);
  }, []);

  const closeAddUserDialogHandler = useCallback(() => {
    setOpenAddUserDialog(false);
  }, []);

  const closeUserDialog = useCallback(() => {
    setOpenUserDialog(false);
  }, []);

  const blockHandler = useCallback(async () => {
    try {
      const response = await axios.patch(
        `${process.env.REACT_APP_API_URL}/api/v1/users/blockUser/${recipient?._id}`,
        {},
        {
          headers: {
            Authorization: localStorage.getItem("token"),
          },
        }
      );
      if (response.data.result) {
        toast.success("User blocked successfully.");
        changeBlockingStatus(true, true);
      } else {
        toast.error("Failed to block the user.");
      }
    } catch (error) {
      console.error("Error while blocking user:", error);
      toast.error(
        error?.response?.data?.message ||
          "An error occurred while blocking the user."
      );
    } finally {
      closeUserDialog();
    }
  }, []);

  const unblockHandler = useCallback(async () => {
    try {
      const response = await axios.patch(
        `${process.env.REACT_APP_API_URL}/api/v1/users/unblockUser/${recipient?._id}`,
        {},
        {
          headers: {
            Authorization: localStorage.getItem("token"),
          },
        }
      );
      if (response.data.result) {
        toast.success("User unblocked successfully.");
        changeBlockingStatus(false, true);
      } else {
        toast.error("Failed to unblock the user.");
      }
    } catch (error) {
      console.error("Error while unblocking user:", error);
      toast.error(
        error?.response?.data?.message ||
          "An error occurred while unblocking the user."
      );
    } finally {
      closeUserDialog();
    }
  }, []);

  const clearChatHandler = useCallback(async () => {
    try {
      const url = recipient?.isGroup
        ? `${process.env.REACT_APP_API_URL}/api/v1/group/clearGroupChat/${recipient?._id}`
        : `${process.env.REACT_APP_API_URL}/api/v1/messages/clearChat/${recipient?._id}`;

      const response = await axios.delete(url, {
        headers: {
          Authorization: localStorage.getItem("token"),
        },
      });
      if (response.data.result) {
        toast.success("Chat Cleared Successfully.");
        clearChatMessagesHandler();
      } else {
        toast.error("Failed to clear chat.");
      }
    } catch (error) {
      console.error("Error while Clearing Chat :", error);
      toast.error(
        error?.response?.data?.message ||
          "An error occurred while Clearing Chat of the user."
      );
    } finally {
      closeUserDialog();
    }
  }, []);

  const changeGroupDescription = useCallback(async (description) => {
    try {
      const url = `${process.env.REACT_APP_API_URL}/api/v1/group/changeDescription/${recipient?._id}`;
      const response = await axios.put(
        url,
        {
          description: description,
        },
        {
          headers: {
            Authorization: localStorage.getItem("token"),
          },
        }
      );
      if (response.data.result) {
        toast.success("Group Description Updated Successfully!.");
      }
    } catch (error) {
      console.error("Error while Clearing Chat :", error);
      toast.error(
        error?.response?.data?.message ||
          "An error occurred while Clearing Chat of the user."
      );
    }
  }, []);

  const makeAdminHandler = useCallback(async (userId) => {
    try {
      const url = `${process.env.REACT_APP_API_URL}/api/v1/group/makeAdmin/${recipient?._id}`;
      const response = await axios.patch(
        url,
        {
          userId: userId,
        },
        {
          headers: {
            Authorization: localStorage.getItem("token"),
          },
        }
      );
      if (response.data.result) {
        toast.success("New Admin Created Successfully!.");
        changeGroupMemberRole(userId, "admin");
      }
    } catch (error) {
      console.error("Error while Makind Admin  :", error);
      toast.error(
        error?.response?.data?.message ||
          "An error occurred while Makind Admin the user."
      );
    }
  }, []);

  const removeAdminHandler = useCallback(async (userId) => {
    try {
      const url = `${process.env.REACT_APP_API_URL}/api/v1/group/removeAdmin/${recipient?._id}`;
      const response = await axios.patch(
        url,
        {
          userId: userId,
        },
        {
          headers: {
            Authorization: localStorage.getItem("token"),
          },
        }
      );
      if (response.data.result) {
        toast.success(" Admin Removed Successfully!.");
        changeGroupMemberRole(userId, "member");
      }
    } catch (error) {
      console.error("Error while Removing Admin  :", error);
      toast.error(
        error?.response?.data?.message ||
          "An error occurred while Removing Admin the user."
      );
    }
  }, []);

  const kickOutUserHandler = useCallback(async (userId) => {
    try {
      const url = `${process.env.REACT_APP_API_URL}/api/v1/group/removeMember/${recipient?._id}`;
      const response = await axios.patch(
        url,
        {
          userId: userId,
        },
        {
          headers: {
            Authorization: localStorage.getItem("token"),
          },
        }
      );
      if (response.data.result) {
        toast.success("User Kicked Out Successfully!.");
        removeExistingMemberFromGroup(userId);
      }
    } catch (error) {
      console.error("Error while Kicking out  :", error);
      toast.error(
        error?.response?.data?.message ||
          "An error occurred while Kicking out the user."
      );
    }
  }, []);

  const leaveGroupHandler = useCallback(async () => {
    try {
      const url = `${process.env.REACT_APP_API_URL}/api/v1/group/leaveGroup/${recipient?._id}`;
      const response = await axios.patch(
        url,
        {},
        {
          headers: {
            Authorization: localStorage.getItem("token"),
          },
        }
      );
      if (response.data.result) {
        toast.success("Group Left Successfully!.");
        removeExistingMemberFromGroup(response.data.data);
      }
    } catch (error) {
      console.error("Error while Leaving Group  :", error);
      toast.error(
        error?.response?.data?.message ||
          "An error occurred while Leaving Group the user."
      );
    }
  }, []);

  const handleProfileClick = useCallback(() => {
    setOpenUpdateProfileDialog(true);
  }, []);

  const closeUpdateProfileDialog = useCallback(() => {
    setOpenUpdateProfileDialog(false);
  }, []);
  return (
    <>
      <section
        className="w-full px-3 py-1 flex justify-between border-b-2 border-blue-500 cursor-pointer bg-blue-300"
        title={`Click Here to get More Info About ${recipient.name}`}
        onClick={() => {
          setOpenUserDialog(true);
        }}
      >
        <section className="px-3">
          <Avatar
            src={recipient?.profilePic || ProfileIcon}
            alt="Preview"
            sx={{
              width: 50,
              height: 50,
              outline: "2px solid #ffffff",
              outlineOffset: "2px",
              background: "#ffffff",
            }}
          />
        </section>
        <section>
          <Typography variant="h6" color="#ffffff">
            {recipient.name}
          </Typography>

          {recipient?.isTyping ? (
            <Typography variant="p" color="green">
              {
                recipient?.typer 
                ?
                `${recipient?.typer} is typing...`
                :
                "Typing..."
              }
            </Typography>
          ) : recipient?.isOnline ? (
            <Typography variant="p" color="green">
              Online
            </Typography>
          ) : (
            recipient?.lastSeen && (
              <Typography variant="p" color="blue">
                Last Seen at {formatDate(recipient?.lastSeen)}
              </Typography>
            )
          )}
        </section>
      </section>
      <UserDialog
        open={openUserDialog}
        handleClose={closeUserDialog}
        name={recipient.name}
        profilePic={recipient.profilePic}
        email={recipient.email}
        hasBlocked={recipient.hasBlocked}
        isBlocked={recipient.isBlocked}
        blockHandler={blockHandler}
        unblockHandler={unblockHandler}
        clearChatHandler={clearChatHandler}
        isGroup={recipient?.isGroup}
        members={recipient?.members}
        groupDescription={recipient?.description}
        isAdmin={recipient?.isAdmin}
        updateDescriptionHandler={changeGroupDescription}
        kickOutUserHandler={kickOutUserHandler}
        makeAdminHandler={makeAdminHandler}
        removeAdminHandler={removeAdminHandler}
        openUpdateProfilePicDialog={openUpdateProfileDialog}
        handleProfileClick={handleProfileClick}
        closeUpdateProfileDialog={closeUpdateProfileDialog}
        leaveGroupHandler={leaveGroupHandler}
        openAddUserDialog={openAddUserDialog}
        openAddUserDialogHandler={openAddUserDialogHandler}
        closeAddUserDialogHandler={closeAddUserDialogHandler}
      />
    </>
  );
}
