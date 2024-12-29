import React, { useState } from "react";
import { Button, Typography, Avatar } from "@mui/material";
import DialogComp from "../Common/Dialog";
import CameraIcon from "../../Assets/SVGs/CameraIcon.svg"; // Update path as per your file structure
import axios from "axios";
import { toast } from "react-toastify";
import { useOverlay } from "../../Contexts/OverlayProvider";

export default function ProfileDialog({ open, handleClose, data, handleNewProfilePic }) {
    const [selectedFile, setSelectedFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const { setOverlay } = useOverlay();
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setSelectedFile(file);
        if (file) {
            const filePreview = URL.createObjectURL(file);
            setPreview(filePreview);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            toast.error("Please select a file to upload.");
            return;
        }
        // debugger;
        setOverlay(true);
        const formData = new FormData();
        formData.append("photo", selectedFile);

        try {
            const { data } = await axios.patch(
                `${process.env.REACT_APP_API_URL}/api/v1/users/changeProfilePic`,
                formData,
                {
                    headers: {
                        Authorization: localStorage.getItem("token"),
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            setOverlay(false);

            toast.success(data.message);
            handleNewProfilePic(data.data.profilePic)
            handleClose();
        } catch (error) {
            console.error(error);
            toast.error(error?.response?.data?.message || "Error uploading file.");
        }
        finally{
            setOverlay(false);
        }
    };

    return (
        <>

            <DialogComp open={open} handleClose={handleClose} dialogTitle="Update Profile Photo">
                <div className="flex flex-col items-center gap-4">
                    <Avatar
                        src={preview || (data?.profilePic || CameraIcon)}
                        alt="Preview"
                        sx={{ width: 120, height: 120 }}
                    />
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        style={{ display: "none" }}
                        id="upload-photo"
                    />
                    <label htmlFor="upload-photo">
                        <Button variant="contained" component="span">
                            Choose Photo
                        </Button>
                    </label>
                    <Typography variant="body2" color="textSecondary">
                        Select a photo to update your profile picture.
                    </Typography>
                    <Button variant="contained" color="primary" onClick={handleUpload}>
                        Upload
                    </Button>
                </div>
            </DialogComp>
        </>
    );
}
