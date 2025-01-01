import { Box, Button, TextField, Typography } from '@mui/material'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import Message from '../Message/Message';
import SendButtonImage from "../../Assets/Images/SendButton.png";
import axios from 'axios';
import { useChat } from '../../Contexts/ChatProvider';
import RecipientInfo from '../RecipientInfo/RecipientInfo';


export default function ChatScreen({ changeTextBoxCss }) {
    const [messageToBeSent, setMessageToBeSent] = useState("");
    const [messages, setMessages] = useState([]);
    const messageBoxRef = useRef(null);
    const { newMessage, recipient } = useChat();
    
    const getMessages = async () => {
        try {
            if (!recipient) return;
            const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/api/v1/messages/getAllMessages/${recipient?._id}`, {
                headers: {
                    Authorization: localStorage.getItem("token"),
                }
            });
            setMessages(() => data.data);
        } catch (error) {
            console.log(error);
        }
    };

    function scrollToBottom() {
        if (messageBoxRef.current) {
            messageBoxRef.current.scrollTop = messageBoxRef.current.scrollHeight;
        }
    }
    useEffect(() => {
        setMessages((old) => [...old, newMessage]);
    }, [newMessage])

    useEffect(() => {
        getMessages();
    }, [recipient]);

    // Ensure scrollToBottom is called after messages are updated
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const sendMessage = async () => {
        try {
            const dataToBeSent = {
                message: messageToBeSent,
                recipient: recipient._id,
            };
            await axios.post(
                `${process.env.REACT_APP_API_URL}/api/v1/messages/sendMessage`,
                dataToBeSent,
                {
                    headers: {
                        Authorization: localStorage.getItem("token"),
                    },
                }
            );
            setMessages((old) => [...old, { message: messageToBeSent, timestamp:new Date().toISOString(), isSender: true }]);
            setMessageToBeSent("");
        } catch (error) {
            console.log(error);
        }
    };

    const onDeletingMessage = useCallback((messageId) => {
        setMessages((old) => {
            return old.filter((oldMessage) => oldMessage._id !== messageId);
        })
    }, []);


    return (
        <section className={`h-[84vh] fixed right-0 bottom-5 top-[66px] lg:top-[85px]  overflow-hidden ${changeTextBoxCss}`}>
            {
                recipient
                &&
                <RecipientInfo />
            }
            <Box
                className={`mb-3 overflow-y-scroll ${recipient ? "h-[90%]" : "h-full"} `}
                ref={messageBoxRef} // Place the ref here on the scrollable section
            >
                {recipient ? (
                    <>
                        {messages.length === 0 ? (
                            <Typography
                                className="flex justify-center items-center font-bold bottom-72 fixed"
                                variant="h3"
                            >
                                Start Your Conversation
                            </Typography>
                        ) : (
                            messages.map((message) => (
                                <Message
                                    message={message.message}
                                    time={message.timestamp}
                                    isSender={message.isSender}
                                    key={message._id || message.timestamp}
                                    messageId={message._id}
                                    onDeletingMessage={onDeletingMessage}
                                />
                            ))
                        )}
                    </>
                ) : (
                    <Typography
                        className="flex justify-center items-center font-bold bottom-72 fixed"
                        variant="h3"
                    >
                        Select a Chat to Start Your Conversation
                    </Typography>
                )}
            </Box>
            {
                recipient?.hasBlocked ?
                    <section className={`fixed bottom-0 right-0 flex items-center justify-center bg-white py-3 border border-t-2  ${changeTextBoxCss} `}>
                        <Typography variant="h5" color="initial">
                            You Are Blocked By {recipient.name}
                        </Typography>
                    </section>
                    :
                    recipient?.isBlocked 
                    ?
                    <section className={`fixed bottom-0 right-0 flex items-center justify-center bg-white py-3 border border-t-2  ${changeTextBoxCss} `}>
                    <Typography variant="h5" color="initial">
                        {recipient.name} is Blocked By You. Unblock {recipient.name} to Start Chat.
                    </Typography>
                </section>
                    :
                    <section className={`fixed bottom-0 right-0 flex items-center justify-center bg-white  ${changeTextBoxCss}`}>
                        <TextField
                            fullWidth
                            label="message"
                            name="message"
                            type="text"
                            value={messageToBeSent}
                            onChange={(e) => setMessageToBeSent(e.target.value)}
                            variant="outlined"
                            margin="normal"
                            required
                            placeholder="Your Message"
                            className="fixed bottom-2 text-wrap"
                        />
                        <Button
                            className="rounded-md bg-blue-300 text-white"
                            disabled={messageToBeSent.trim().length === 0 || !recipient}
                            onClick={sendMessage}
                        >
                            <img src={SendButtonImage} alt="send button" className="h-12 w-12" />
                        </Button>
                    </section>
            }
        </section>
    );
}
