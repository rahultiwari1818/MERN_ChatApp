import * as React from "react";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../Contexts/AuthProvider";
import { ReactComponent as LogoutIcon } from "../../Assets/SVGs/LoginIcon.svg";
import CreateGroupDialog from "../CreateGroupDialog/CreateGroupDialog";
import { useChat } from "../../Contexts/ChatProvider";

export default function MenuBasic({ Title }) {
  const { logout } = useAuth();
  const { userLoggedOut } = useChat();

  const [anchorEl, setAnchorEl] = React.useState(null);
  const [openCreateGroupDialog, setOpenGroupDialog] = React.useState(false);
  const open = Boolean(anchorEl);
  const navigate = useNavigate();

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const closeCreateGroupDialog = () => {
    
    setOpenGroupDialog(false);
  };

  const openProfile = () => {
    navigate("/profile");
    handleClose();
  };

  const logoutUser = () => {
    userLoggedOut();
    logout();
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
        <MenuItem onClick={openProfile}>Profile</MenuItem>
        <MenuItem
          onClick={() => {
            setOpenGroupDialog(true);
          }}
        >
          Create Group
        </MenuItem>
        <MenuItem onClick={logoutUser} className="flex justify-between gap-1">
          Logout <LogoutIcon />
        </MenuItem>
      </Menu>
      <CreateGroupDialog
        open={openCreateGroupDialog}
        handleClose={closeCreateGroupDialog}
      />
    </div>
  );
}
