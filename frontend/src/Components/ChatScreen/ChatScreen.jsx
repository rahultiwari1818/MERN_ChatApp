import { Box, Button, Container, TextField } from '@mui/material'
import React, { useState } from 'react'
import Message from '../Message/Message';
import SendButtonImage from "../../Assets/Images/SendButton.png";

const messages = [
    { senderId: "1", recipientId: "2", message: "Hello!", timestamp: new Date("2024-12-11T09:00:00Z") },
    { senderId: "2", recipientId: "1", message: "Hi! How are you?", timestamp: new Date("2024-12-11T09:01:00Z") },
    { senderId: "1", recipientId: "2", message: "How are you?", timestamp: new Date("2024-12-11T09:05:00Z") },
    { senderId: "2", recipientId: "1", message: "I’m good, thanks! What about you?", timestamp: new Date("2024-12-11T09:06:00Z") },
    { senderId: "1", recipientId: "2", message: "Did you finish the task?", timestamp: new Date("2024-12-11T09:10:00Z") },
    { senderId: "2", recipientId: "1", message: "Yes, I just finished it.", timestamp: new Date("2024-12-11T09:11:00Z") },
    { senderId: "1", recipientId: "2", message: "Let me know if you need help.", timestamp: new Date("2024-12-11T09:15:00Z") },
    { senderId: "2", recipientId: "1", message: "Thanks! I’ll reach out if needed.", timestamp: new Date("2024-12-11T09:16:00Z") },
    { senderId: "1", recipientId: "2", message: "What’s the update on the project?", timestamp: new Date("2024-12-11T09:20:00Z") },
    { senderId: "2", recipientId: "1", message: "We’re on track, everything looks good.", timestamp: new Date("2024-12-11T09:21:00Z") },
    { senderId: "1", recipientId: "2", message: "Can we schedule a call?", timestamp: new Date("2024-12-11T09:25:00Z") },
    { senderId: "2", recipientId: "1", message: "Sure, what time works for you?", timestamp: new Date("2024-12-11T09:26:00Z") },
    { senderId: "1", recipientId: "2", message: "Check out this link I shared.", timestamp: new Date("2024-12-11T09:30:00Z") },
    { senderId: "2", recipientId: "1", message: "Got it. I’ll take a look.", timestamp: new Date("2024-12-11T09:31:00Z") },
    { senderId: "1", recipientId: "2", message: "I’m waiting for your response.", timestamp: new Date("2024-12-11T09:35:00Z") },
    { senderId: "2", recipientId: "1", message: "Sorry for the delay, here’s my update.", timestamp: new Date("2024-12-11T09:36:00Z") },
    { senderId: "1", recipientId: "2", message: "Can we meet later today?", timestamp: new Date("2024-12-11T09:40:00Z") },
    { senderId: "2", recipientId: "1", message: "Yes, let’s meet at 4 PM.", timestamp: new Date("2024-12-11T09:41:00Z") },
    { senderId: "1", recipientId: "2", message: "Let’s finalize the proposal.", timestamp: new Date("2024-12-11T09:45:00Z") },
    { senderId: "2", recipientId: "1", message: "Sure, I’ll send you the draft shortly.", timestamp: new Date("2024-12-11T09:46:00Z") },
    { senderId: "1", recipientId: "2", message: "Can you confirm the schedule?", timestamp: new Date("2024-12-11T09:50:00Z") },
    { senderId: "2", recipientId: "1", message: "Yes, it’s confirmed for tomorrow.", timestamp: new Date("2024-12-11T09:51:00Z") },
    { senderId: "1", recipientId: "2", message: "Here’s the document you requested.", timestamp: new Date("2024-12-11T09:55:00Z") },
    { senderId: "2", recipientId: "1", message: "Thanks, I’ll review it now.", timestamp: new Date("2024-12-11T09:56:00Z") },
    { senderId: "1", recipientId: "2", message: "Don’t forget the deadline tomorrow.", timestamp: new Date("2024-12-11T10:00:00Z") },
    { senderId: "2", recipientId: "1", message: "Got it. I’ll make sure everything’s ready.", timestamp: new Date("2024-12-11T10:01:00Z") },
    { senderId: "1", recipientId: "2", message: "Can you review this report?", timestamp: new Date("2024-12-11T10:05:00Z") },
    { senderId: "2", recipientId: "1", message: "I’m on it, I’ll send feedback soon.", timestamp: new Date("2024-12-11T10:06:00Z") },
    { senderId: "1", recipientId: "2", message: "The meeting has been rescheduled.", timestamp: new Date("2024-12-11T10:10:00Z") },
    { senderId: "2", recipientId: "1", message: "Thanks for letting me know.", timestamp: new Date("2024-12-11T10:11:00Z") },
    { senderId: "1", recipientId: "2", message: "Let’s align on the next steps.", timestamp: new Date("2024-12-11T10:15:00Z") },
    { senderId: "2", recipientId: "1", message: "Agreed, I’ll draft an email summary.", timestamp: new Date("2024-12-11T10:16:00Z") },
];



export default function ChatScreen() {

    const [messageToBeSent,setMessageToBeSent] = useState("");


    const sendMessage = async(e) =>{

    }

    return (
        <Container className='h-[90vh] fixed right-0 overflow-scroll'>
            <Box className="mb-10">
                {
                    messages?.map((message) => {
                        return <Message message={message.message} time={message.timestamp.toDateString()} isSender={message.senderId === '1'} />
                    })
                }
            </Box>
            <Box className="input-container fixed bottom-0 right-0 flex  bg-white w-full">
                <TextField
                    fullWidth
                    label="message"
                    name="message"
                    type="text"
                    value={messageToBeSent}
                    onChange={(e)=>setMessageToBeSent(e.target.value)}
                    variant="outlined"
                    margin="normal"
                    required
                    placeholder="Your Message"
                    className='fixed bottom-2'
                />
                <Button
                 className='rounded-md bg-blue-300 text-white'
                 disabled={messageToBeSent.trim().length === 0}
                 onClick={sendMessage}
                 >
                    <img src={SendButtonImage} alt="send button" className='h-12 w-12'/>
                </Button>
            </Box>
        </Container>
    )
}
