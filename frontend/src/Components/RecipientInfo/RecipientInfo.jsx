import React, { useCallback, useState } from 'react'
import { formatDate } from '../../Utils/utils'
import { Avatar, Button, Typography } from '@mui/material'
import ProfileIcon from "../../Assets/SVGs/Profile.svg";
import { useChat } from '../../Contexts/ChatProvider';
import DialogComp from '../Common/Dialog';
import axios from 'axios';
import { toast } from 'react-toastify';

export default function RecipientInfo() {

    const { recipient,changeBlockingStatus } = useChat();
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
                changeBlockingStatus(true);
            } else {
                toast.error("Failed to block the user.");
            }
        } catch (error) {
            console.error("Error while blocking user:", error);
            toast.error(error?.response?.data?.message || "An error occurred while blocking the user.");
        }
        finally{
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
                changeBlockingStatus(false);
            } else {
                toast.error("Failed to unblock the user.");
            }
        } catch (error) {
            console.error("Error while unblocking user:", error);
            toast.error(error?.response?.data?.message || "An error occurred while unblocking the user.");
        }
        finally{
            closeUserDialog();
        }
    }, []);
    


    return (
        <>
            <section className='w-full px-3 py-1 flex justify-between border-b-2 border-blue-500 cursor-pointer bg-blue-300'
                title={`Click Here to get More Info About ${recipient.name}`}
                onClick={() => {
                    setOpenUserDialog(true);
                }}
            >
                <section className='px-3'>
                    <Avatar
                        src={(recipient?.profilePic || ProfileIcon)}
                        alt="Preview"
                        sx={{
                            width: 50, height: 50, outline: "2px solid #ffffff",
                            outlineOffset: "2px",background:"#ffffff"
                        }}
                    />
                </section>
                <section>

                    <Typography variant="h6" color="#ffffff" >
                        {
                            recipient.name
                        }
                    </Typography>
                    {
                        recipient?.isOnline ?
                            <Typography variant="p" color="green">
                                Online
                            </Typography>
                            :
                            recipient?.lastSeen &&
                            <Typography variant="p" color="blue">
                                Last Seen at  {
                                    formatDate(recipient?.lastSeen)
                                }
                            </Typography>
                    }
                </section>
            </section>
            <UserDialog open={openUserDialog} handleClose={closeUserDialog} name={recipient.name} profilePic={recipient.profilePic} email={recipient.email} hasBlocked={recipient.hasBlocked} isBlocked={recipient.isBlocked} blockHandler={blockHandler} unblockHandler={unblockHandler}/>
        </>
    )
}

const UserDialog = ({ open, handleClose, profilePic, name, email, hasBlocked, isBlocked,blockHandler,unblockHandler }) => {
    return (
        <>
            <DialogComp open={open} handleClose={handleClose} dialogTitle={"User Information"}>
                <section className="flex flex-col items-center gap-4">
                    <Avatar
                        src={(profilePic || ProfileIcon)}
                        alt="Preview"
                        sx={{ width: 150, height: 150 }}
                    />
                    <Typography> Name :
                        {name}
                    </Typography>
                    <Typography>
                        Email :
                        {email}
                    </Typography>
                    {
                        !hasBlocked
                        ?
                        isBlocked
                        ?
                        <Button
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
                            onClick={unblockHandler}
                        >
                            Unblock
                        </Button>
                        :
                        <Button
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
                            onClick={blockHandler}
                        >
                            Block
                        </Button>
                        :
                        <></>
                    }
                </section>
            </DialogComp>
        </>
    );
}