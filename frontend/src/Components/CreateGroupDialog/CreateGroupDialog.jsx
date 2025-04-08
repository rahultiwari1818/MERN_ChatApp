import React, { useState, useEffect, useMemo } from "react";
import DialogComp from "../Common/Dialog";
import { TextField, Button, Avatar, Stack, List, ListItem, ListItemAvatar, ListItemText, Checkbox } from "@mui/material";
import { useChat } from "../../Contexts/ChatProvider";
import { ReactComponent as UserIcon } from "../../Assets/SVGs/Profile.svg";
import axios from "axios";

export default function CreateGroupDialog({ open, handleClose }) {
    const [searchTerm, setSearchTerm] = useState("");

    const [groupData, setGroupData] = useState({
        groupName: "",
        groupImage: null,
        selectedUsers: [],
        preview:null,
        groupDescription:""
    });

    const { users, getUsers,addNewUser } = useChat();

    useEffect(() => {
        if (open) {
            setGroupData({
                groupName: "",
                groupImage: null,
                selectedUsers: [],
                preview:null,
                groupDescription:""
            })
            getUsers("");
        }
    }, [open]);

    useEffect(() => {
        getUsers(searchTerm);
    }, [searchTerm]);

    const handleImageChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setGroupData((prev) => ({
                ...prev,
                groupImage: file,
                preview:URL.createObjectURL(file)
            }));
        }
    };

    const toggleUserSelection = (user) => {
        const newSelectedUsers = groupData.selectedUsers.indexOf(user) >= 0 ?
            groupData.selectedUsers.filter((userId) => userId !== user)
            :
            [...groupData.selectedUsers, user]
            ;

        setGroupData((prev) => {
            return {
                ...prev,
                selectedUsers: newSelectedUsers
            }
        })
    };


    const handleCreateGroup = async () => {
        if (!groupData.groupName.trim() || groupData.selectedUsers.length === 0) {
            return;
        }

        const formData = new FormData();
        formData.append("groupName", groupData.groupName);
        formData.append("selectedUsers",groupData.selectedUsers);
        if (groupData.groupImage) {
            formData.append("groupImage", groupData.groupImage); // Ensure it's a File object
        }
        
        const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/v1/group/createGroup`, formData, {
            headers: {
                Authorization: localStorage.getItem("token"), // Keep the token
                "Content-Type":"multipart/form-data"
            },
        });

        addNewUser(response.data.data)
        
        handleClose();
    };

      const usersToMap = useMemo(()=>{
        const updatedList = [];
         users?.forEach((user)=>{
            let flag = false;
            if(user?.isGroup) return;
            updatedList.push(user)
         })
        return updatedList;
      },[users]);
    

    return (
        <DialogComp open={open} handleClose={handleClose} dialogTitle="Create New Group">
            <Stack spacing={2} p={2}>
                <TextField
                    label="Group Name"
                    variant="outlined"
                    fullWidth
                    value={groupData.groupName}
                    onChange={(e) => setGroupData((prev) => ({ ...prev, groupName: e.target.value }))}
                />

                <Stack direction="row" alignItems="center" spacing={2}>
                    <input
                        accept="image/*"
                        style={{ display: "none" }}
                        id="upload-group-image"
                        type="file"
                        onChange={handleImageChange}
                    />
                    <label htmlFor="upload-group-image">
                        <Button component="span" variant="contained" startIcon={<UserIcon />}>
                            Upload Image
                        </Button>
                    </label>
                    {groupData.groupImage && <Avatar src={groupData.preview} alt="Group" sx={{ width: 56, height: 56 }} />}
                </Stack>

                <TextField
                    label="Group Description"
                    variant="outlined"
                    fullWidth
                    value={groupData.groupDescription}
                    onChange={(e) => setGroupData((prev) => ({ ...prev, groupDescription: e.target.value }))}
                />


                <TextField
                    label="Search Users"
                    variant="outlined"
                    fullWidth
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />

                <List sx={{ maxHeight: 200, overflowY: "auto" }}>
                    {usersToMap.map((user) => (

                        <ListItem key={user._id} button onClick={() => toggleUserSelection(user._id)}>
                            <ListItemAvatar>
                                <Avatar src={user?.profilePic} alt={user.name} />
                            </ListItemAvatar>
                            <ListItemText primary={user.name} secondary={user.email} />
                            <Checkbox checked={groupData.selectedUsers.indexOf(user._id) >= 0} />
                        </ListItem>
                    ))}
                </List>

                <Button variant="contained" color="primary" onClick={handleCreateGroup} fullWidth>
                    Create Group
                </Button>
            </Stack>
        </DialogComp>
    );
}
