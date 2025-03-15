import React, { useCallback, useState } from "react";
import { formatDate } from "../../Utils/utils";
import { Avatar, Button, TextField, Typography } from "@mui/material";
import ProfileIcon from "../../Assets/SVGs/Profile.svg";
import { useChat } from "../../Contexts/ChatProvider";
import DialogComp from "../Common/Dialog";
import axios from "axios";
import { toast } from "react-toastify";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import DotMenuIcon from "../../Assets/Images/DotMenuIcon.png";
import AddUserIcon from "../../Assets/Images/AddUserIcon.png";

export default function RecipientInfo({ clearChatMessagesHandler }) {
  const {
    recipient,
    changeBlockingStatus,
    removeExistingMemberFromGroup,
    changeGroupMemberRole,
  } = useChat();
  const [openUserDialog, setOpenUserDialog] = useState(false);

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
          {recipient?.isOnline ? (
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
      />
    </>
  );
}

const UserDialog = ({
  open,
  handleClose,
  profilePic,
  name,
  email,
  hasBlocked,
  isBlocked,
  blockHandler,
  unblockHandler,
  clearChatHandler,
  isGroup,
  members,
  groupDescription,
  isAdmin,
  updateDescriptionHandler,
  kickOutUserHandler,
  makeAdminHandler,
  removeAdminHandler,
}) => {
  const [description, setDescription] = useState(groupDescription);

  const handleDescriptionChange = (e) => {
    setDescription(e.target.value);
  };

  return (
    <DialogComp
      open={open}
      handleClose={handleClose}
      dialogTitle={"User Information"}
    >
      <section className="flex flex-col items-center gap-4">
        <Avatar
          src={profilePic || ProfileIcon}
          alt="Preview"
          sx={{ width: 150, height: 150 }}
        />
        <Typography>
          {isGroup && "Group "} Name: {name}
        </Typography>

        {isGroup && (
          <section className="w-full p-3 border border-blue-500 rounded-lg shadow-md bg-white">
            <Typography variant="h6" className="font-semibold text-blue-500">
              Group Description
            </Typography>
            {isAdmin ? (
              <div className="flex flex-col gap-2">
                <TextField
                  value={description}
                  onChange={handleDescriptionChange}
                  multiline
                  rows={3}
                  fullWidth
                  variant="outlined"
                />
                <Button
                  sx={{ backgroundColor: "blue", color: "white" }}
                  onClick={() => updateDescriptionHandler(description)}
                >
                  Save Description
                </Button>
              </div>
            ) : (
              <Typography className="text-gray-600">
                {groupDescription || "No description available"}
              </Typography>
            )}
          </section>
        )}

        {isGroup && (
          <section className="w-full border border-blue-500 rounded-lg shadow-md bg-white">
            <Typography
              variant="h6"
              className="p-3 font-semibold bg-blue-500 text-white rounded-t-lg flex justify-between items-center"
            >
              <> Group Members</>

              {isAdmin && <img src={AddUserIcon} alt="add user" className="h-7 cursor-pointer"/>}
            </Typography>
            <div className="divide-y divide-gray-300 max-h-[200px] overflow-y-scroll">
              {members
                ?.sort((a, b) => (a.role === "admin" ? -1 : 1)) // Ensure admins are at the top
                .map((member) => (
                  <div
                    key={member._id}
                    className="flex justify-between items-center p-3 hover:bg-gray-100 cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar
                        src={member.profilePic || ProfileIcon} // Default if no profilePic
                        alt={member.name}
                        sx={{ width: 40, height: 40 }}
                      />
                      <div>
                        <Typography className="font-medium">
                          {member.name}
                        </Typography>
                        <Typography className="text-sm text-gray-500">
                          {member.email}
                        </Typography>
                      </div>
                    </div>
                    {member.role === "admin" && (
                      <span className="mx-2 px-2 py-1 text-xs font-bold text-white bg-red-500 rounded">
                        Admin
                      </span>
                    )}
                    {isAdmin && !member.isYou && (
                      <MenuBasic
                        Title={
                          <img src={DotMenuIcon} alt="menu" className="h-7" />
                        }
                        isAdmin={member.role === "admin"}
                        makeAdminHandler={makeAdminHandler}
                        removeAdminHandler={removeAdminHandler}
                        kickOutUserHandler={kickOutUserHandler}
                        userId={member._id}
                      />
                    )}
                  </div>
                ))}
            </div>
          </section>
        )}

        {!isGroup && <Typography>Email: {email}</Typography>}

        <Button
          sx={{ backgroundColor: "red", color: "white" }}
          onClick={clearChatHandler}
        >
          Clear Chat
        </Button>

        {!isGroup &&
          !hasBlocked &&
          (isBlocked ? (
            <Button
              sx={{ backgroundColor: "red", color: "white" }}
              onClick={unblockHandler}
            >
              Unblock
            </Button>
          ) : (
            <Button
              sx={{ backgroundColor: "red", color: "white" }}
              onClick={blockHandler}
            >
              Block
            </Button>
          ))}
      </section>
    </DialogComp>
  );
};

function MenuBasic({
  Title,
  isAdmin,
  kickOutUserHandler,
  makeAdminHandler,
  removeAdminHandler,
  userId,
}) {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <div>
      <Button
        id="basic-button"
        aria-controls={open ? "basic-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        onClick={handleClick}
      >
        {Title}
      </Button>
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          "aria-labelledby": "basic-button",
        }}
      >
        <MenuItem onClick={() => kickOutUserHandler(userId)}>Kick Out</MenuItem>
        {!isAdmin ? (
          <MenuItem onClick={() => makeAdminHandler(userId)}>
            Make Admin
          </MenuItem>
        ) : (
          <MenuItem onClick={() => removeAdminHandler(userId)}>
            Remove Admin
          </MenuItem>
        )}
      </Menu>
    </div>
  );
}
