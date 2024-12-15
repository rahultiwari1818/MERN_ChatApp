import { Box, Button, Container, TextField, Typography } from '@mui/material'
import React, { useEffect, useRef, useState } from 'react'
import Message from '../Message/Message';
import SendButtonImage from "../../Assets/Images/SendButton.png";
import axios from 'axios';

export default function ChatScreen({ recipient,changeTextBoxCss }) {
    const [messageToBeSent, setMessageToBeSent] = useState("");
    const [messages, setMessages] = useState([]);
    const messageBoxRef = useRef(null);

    const getMessages = async () => {
        try {
            const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/api/v1/messages/getAllMessages/${recipient}`, {
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
                recipient: recipient,
            };
            const { data } = await axios.post(
                `${process.env.REACT_APP_API_URL}/api/v1/messages/sendMessage`,
                dataToBeSent,
                {
                    headers: {
                        Authorization: localStorage.getItem("token"),
                    },
                }
            );
            setMessages((old) => [...old, { message: messageToBeSent, timestamp: Date.now(), isSender: true }]);
            setMessageToBeSent("");
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <section className={`h-[80vh] fixed right-0 bottom-5 top-[85px]  overflow-hidden ${changeTextBoxCss}`}>
            <Box
                className="mb-10 overflow-y-scroll h-full"
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
                    className="fixed bottom-2"
                />
                <Button
                    className="rounded-md bg-blue-300 text-white"
                    disabled={messageToBeSent.trim().length === 0 || !recipient}
                    onClick={sendMessage}
                >
                    <img src={SendButtonImage} alt="send button" className="h-12 w-12" />
                </Button>
            </section>
        </section>
    );
}
