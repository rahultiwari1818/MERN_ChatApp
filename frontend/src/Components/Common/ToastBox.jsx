import { Avatar } from '@mui/material'
import React from 'react'

export default function ToastBox({newMessage }) {
    return (
        <section className='flex justify-between items-center px-2 py-2'>
            <section>
                <Avatar
                    src={`${newMessage.senderProfilePic}`}
                    alt='sender profile pic'
                    sx={{
                        width: 50, height: 50, outline: "2px solid #ffffff",
                        outlineOffset: "2px",background:"#ffffff"
                    }}
                    className='rounded outline outline-white p-2 bg-white'
                />
            </section>
            <section className='flex flex-col justify-between'>
                <p className='font-bold'>{newMessage.senderName}</p>
                <p>
                    {
                        newMessage.message
                    }
                </p>
            </section>
        </section>
    )
}
