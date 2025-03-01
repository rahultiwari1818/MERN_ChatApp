import { uploadToCloudinary } from "../config/cloudinary.config.js";
import Group from "../models/group.model.js";


export const creategroup = async (req, res) => {
    try {
        const { groupName, selectedUsers } = req.body;
        const photo = req.file;

        if (!groupName || !selectedUsers) {
            return res.status(400).json({
                message: "Group name and selected users are required",
                result: false,
            });
        }

        let newProfilePicPath = "";
        if (photo) {
            const result = await uploadToCloudinary(photo.path, "image");
            if (result?.message === "Fail") {
                return res.status(500).json({
                    message: "Image upload failed",
                    result: false,
                });
            }
            newProfilePicPath = result?.url || "";
        }

        const newGroup = await Group.create({
            groupName,
            selectedUsers: JSON.parse(selectedUsers), // Ensure selectedUsers is an array
            groupImage: newProfilePicPath,
            createdBy:req.user._id,
            admins:[req.user._id]
        });

        newGroup.save();

        return res.status(201).json({
            message: "Group Created Successfully",
            result: true,
            group: newGroup,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Internal Server Error",
            error: error.message,
        });
    }
};

export const getChat = async (req, res) => {
    try {

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal Server Error"
        })
    }
}

export const addMembers = async (req, res) => {
    try {

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal Server Error"
        })
    }
}

export const removeMembers = async (req, res) => {
    try {

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal Server Error"
        })
    }
}

export const makeAdmin = async (req, res) => {
    try {

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal Server Error"
        })
    }
}

export const removeAdmin = async (req, res) => {
    try {

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal Server Error"
        })
    }
}

export const changeDescription = async (req, res) => {
    try {

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal Server Error"
        })
    }
}

export const changeGroupIcon = async (req, res) => {
    try {

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal Server Error"
        })
    }
}