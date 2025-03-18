import React, { useEffect, useMemo, useState } from "react";
import {
  Avatar,
  Button,
  Checkbox,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  TextField,
  Typography,
} from "@mui/material";
import ProfileIcon from "../../Assets/SVGs/Profile.svg";
import { useChat } from "../../Contexts/ChatProvider";
import DialogComp from "../Common/Dialog";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import DotMenuIcon from "../../Assets/Images/DotMenuIcon.png";
import AddUserIcon from "../../Assets/Images/AddUserIcon.png";
import { ReactComponent as CameraIcon } from "../../Assets/SVGs/CameraIcon.svg";
import ProfileDialog from "../ProfileDialog/ProfileDialog";
import axios from "axios";
import { toast } from "react-toastify";

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
  leaveGroupHandler,
  kickOutUserHandler,
  makeAdminHandler,
  removeAdminHandler,
  openUpdateProfilePicDialog,
  handleProfileClick,
  closeUpdateProfileDialog,
  openAddUserDialog,
  openAddUserDialogHandler,
  closeAddUserDialogHandler,
}) => {
  const [description, setDescription] = useState(groupDescription);

  useEffect(()=>{
    setDescription(description);
  },[groupDescription])

  const handleDescriptionChange = (e) => {
    setDescription(e.target.value);
  };

  const { recipient, updateGroupIcon  } = useChat();

  return (
    <DialogComp
      open={open}
      handleClose={handleClose}
      dialogTitle={"User Information"}
    >
      <section className="flex flex-col items-center gap-4">
        <section className="flex flex-col items-center gap-4 relative">
          <Avatar
            src={profilePic || ProfileIcon}
            alt="User Image"
            sx={{ width: 150, height: 150 }}
          />
          {isAdmin && (
            <button
              className="absolute bottom-0  right-2 outline bg-white p-2    rounded-xl"
              onClick={handleProfileClick}
            >
              <CameraIcon />
            </button>
          )}
        </section>
        <Typography variant="h5">
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

              {isAdmin && (
                <img
                  src={AddUserIcon}
                  alt="add user"
                  className="h-7 cursor-pointer"
                  onClick={() => {
                    openAddUserDialogHandler();
                  }}
                />
              )}
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

        <section className="flex justify-between items-center gap-5">
          {isGroup && (
            <Button
              sx={{ backgroundColor: "red", color: "white" }}
              onClick={leaveGroupHandler}
            >
              Leave Group
            </Button>
          )}

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


      </section>
      <ProfileDialog
        open={openUpdateProfilePicDialog}
        handleClose={closeUpdateProfileDialog}
        userData={recipient}
        isGroup={true}
        handleNewProfilePic={updateGroupIcon}
      />
      
      <AddUserModal
        open={openAddUserDialog}
        close={closeAddUserDialogHandler}
        existingUsers={members}
      />
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

function AddUserModal({ open, close, existingUsers }) {
  const [searchTerm, setSearchTerm] = useState("");

  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const { users, getUsers, recipient,addNewMembersInGroup } = useChat();

  const handleAddUser = async () => {
    try {
      const { data } = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/v1/group/addMembers/${recipient?._id}`,
        {
            userIds : selectedUserIds
        },
        {
          headers: {
            Authorization: localStorage.getItem("token"),
          },
        }
      );
      if(data.result){
        toast.success(data.message)
        addNewMembersInGroup(data.data.members)
      }
    } catch (error) {
      console.log("Error While Adding New Users");
      
    } finally {
      close();
    }
  };

  const toggleUserSelection = (user) => {
    setSelectedUserIds((prevSelected) =>
      prevSelected.includes(user)
        ? prevSelected.filter((userId) => userId !== user)
        : [...prevSelected, user]
    );
  };

  useEffect(() => {
    getUsers(searchTerm);
  }, [searchTerm]);

  const usersToMap = useMemo(() => {
    const updatedList = [];
    if(!existingUsers) return [];
    users?.forEach((user) => {
      let flag = false;
      if (user?.isGroup) return;
      for (let existedUser of existingUsers) {
        if (existedUser._id === user._id) {
          flag = true;
          break;
        }
      }
      if (!flag) {
        updatedList.push(user);
      }
    });
    return updatedList;
  }, [users]);

  return (
    <DialogComp open={open} handleClose={close} dialogTitle={"Add New Users"}>
      <TextField
        label="Search Users"
        variant="outlined"
        fullWidth
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <List sx={{ maxHeight: 200, overflowY: "auto" }}>
        {usersToMap.map((user) => (
          <ListItem
            key={user._id}
            button
            onClick={() => toggleUserSelection(user._id)}
          >
            <ListItemAvatar>
              <Avatar src={user?.profilePic || ProfileIcon} alt={user.name} />
            </ListItemAvatar>
            <ListItemText primary={user.name} secondary={user.email} />
            <Checkbox checked={selectedUserIds.indexOf(user._id) >= 0} />
          </ListItem>
        ))}
      </List>
      <Button
        variant="contained"
        color="primary"
        onClick={handleAddUser}
        fullWidth
      >
        Add Users
      </Button>
    </DialogComp>
  );
}
export default UserDialog;
