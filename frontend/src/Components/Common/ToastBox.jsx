import { Avatar } from '@mui/material'
import React from 'react'
import  ProfileIcon from "../../Assets/SVGs/Profile.svg"

export default function ToastBox({newMessage,changeRecipient,users }) {
    // const {users} = useUserProvider();
    return (
        <section className='flex justify-between items-center px-2 py-2'
        onClick={()=>{
            const recipient = users?.find((user)=> user._id === newMessage.senderId);
            changeRecipient(recipient)
        }}
        >
            <section>
             <Avatar src={newMessage?.senderProfilePic  ? newMessage?.senderProfilePic: ProfileIcon} alt={"user.name"} className={`${!newMessage?.senderProfilePic ?  'rounded outline outline-white p-2 bg-white' : '' } `}     sx={!newMessage?.senderProfilePic ? { width: 40, height: 40 } : {backgroundColor:"#ffffff"}} 
             />
            </section>
            <section className='flex flex-col justify-between'>
                <p className='font-bold'>{newMessage.senderName}</p>
                <p>
                    {
                        newMessage.message.trim(10)
                    }
                </p>
            </section>
        </section>
    )
}
