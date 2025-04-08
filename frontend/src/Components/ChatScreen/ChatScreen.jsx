import { Box, Button, Typography } from "@mui/material";
import React, { useCallback, useEffect, useRef, useState } from "react";
import Message from "../Message/Message";
import SendButtonImage from "../../Assets/Images/SendButton.png";
import axios from "axios";
import { useChat } from "../../Contexts/ChatProvider";
import RecipientInfo from "../RecipientInfo/RecipientInfo";
import { ReactComponent as CameraIcon } from "../../Assets/SVGs/CameraIcon.svg";
import { toast } from "react-toastify";

export default function ChatScreen() {
  const [messageToBeSent, setMessageToBeSent] = useState("");
  const [messages, setMessages] = useState([]);
  const messageBoxRef = useRef(null);
  const {
    newMessage,
    recipient,
    messageStatus,
    changeNewMessage,
    recipientConversationStatus,
    changeRecipientConversationStatus,
    changeMessageStatus,
    handleTyping,
    deleteMessageForEveryone,
    changeDeleteMessageForEveryone
  } = useChat();

  const clearChatMessages = useCallback(() => {
    setMessages([]);
  }, []);

  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  const fileInputRef = useRef(null);
  const [selectedFiles, setSelectedFiles] = useState([]);

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    if (selectedFiles.length + files.length > 10) {
      toast.info("You can only select up to 10 files.");
      return;
    }
    if (files.length > 0) {
      setSelectedFiles((prev) => [...prev, ...files]);
    }
  };

  const removeFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const getMessages = async (isGroup) => {
    try {
      if (!recipient?._id) return;
      setIsLoadingMessages(true);


      const url = isGroup
        ? `${process.env.REACT_APP_API_URL}/api/v1/group/${recipient?._id}/getMessages`
        : `${process.env.REACT_APP_API_URL}/api/v1/messages/getAllMessages/${recipient?._id}`;

      const { data } = await axios.get(url, {
        headers: {
          Authorization: localStorage.getItem("token"),
        },
      });

      setMessages(() => data.data);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  function scrollToBottom() {
    if (messageBoxRef.current) {
      messageBoxRef.current.scrollTop = messageBoxRef.current.scrollHeight;
    }
  }

  

  const sendMessage = async (isGroup) => {
    try {
      if (
        !recipient ||
        (messageToBeSent.trim().length === 0 && selectedFiles.length === 0)
      )
        return;

      const formData = new FormData();
      for (let file of selectedFiles) {
        formData.append(`media`, file);
      }
      formData.append("message", messageToBeSent);
      formData.append("recipient", recipient._id);

      const mediaUrls = selectedFiles.map((file) => ({
        url: URL.createObjectURL(file),
        type: file.type,
      }));

      const tempMessage = {
        message: messageToBeSent,
        media: mediaUrls,
        senderId: "",
        recipient: recipient._id,
        readReceipts: "not sent",
        timestamp: Date.now(),
        isSender: true,
        isTemp: true,
      };

      setMessages((old) => [...old, tempMessage]);
      setMessageToBeSent("");
      setSelectedFiles([]);

      const url = recipient?.isGroup
        ? `${process.env.REACT_APP_API_URL}/api/v1/group/sendMessage`
        : `${process.env.REACT_APP_API_URL}/api/v1/messages/sendMessage`;

      const { data } = await axios.post(url, formData, {
        headers: {
          Authorization: localStorage.getItem("token"),
          "Content-Type": "multipart/form-data",
        },
      });

      setMessages((old) => {
        const updatedMessages = old.filter((msg) => !msg?.isTemp);
        return [...updatedMessages, { ...data.data, isSender: true }];
      });

      setMessageToBeSent("");
      setSelectedFiles([]);
      changeNewMessage({ ...data.data });
    } catch (error) {
      setMessageToBeSent("");
      setSelectedFiles([]);
      console.log(error);
    }
  };

  const onDeletingMessage = useCallback((messageId) => {
    setMessages((old) => {
      return old.filter((oldMessage) => oldMessage._id !== messageId);
    });
  }, []);


  useEffect(() => {
    if (newMessage?.isSender) return;
    if (newMessage?.isNotForCurrentUser) return;
    setMessages((old) => [...old, newMessage]);
  }, [newMessage?._id]);

  useEffect(() => {
    if(recipient?.typingHandling) return;
    getMessages(recipient?.isGroup);
  }, [recipient?._id]);

  // Ensure scrollToBottom is called after messages are updated
  useEffect(() => {
    scrollToBottom();
  }, [messages]);



  useEffect(() => {
    if (!messageStatus) return;
    setMessages((old) => {
      const id = messageStatus?._id;
      const updatedMessages = messages.map((message) => {
        if (message._id === id) {
          return {
            ...message,
            readReceipts: "read",
          };
        }
        return message;
      });
      return updatedMessages;
    });
    changeMessageStatus();
  }, [messageStatus?._id]);

  useEffect(() => {
    if (!recipientConversationStatus) return;
    setMessages((oldMessages) => {
      return oldMessages.map((message) => {
        return {
          ...message,
          readReceipts: "read",
        };
      });
    });
    changeRecipientConversationStatus(false);
  }, [recipientConversationStatus]);

  useEffect(()=>{
    if(deleteMessageForEveryone.length === 0){
      return;
    }

    setMessages((old)=>{
      return old.filter((message)=>{
        return message._id !== deleteMessageForEveryone;
      })
    })
    
    changeDeleteMessageForEveryone("");
  },[deleteMessageForEveryone])

  return (
    <section
      className={`h-[85vh] fixed right-0  top-[66px] lg:top-[85px] bg-image  overflow-hidden w-full lg:w-[70vw]    `}
    >
      {recipient && (
        <RecipientInfo clearChatMessagesHandler={clearChatMessages} />
      )}
      <Box
        className={`mb-3 overflow-y-scroll ${
          recipient ? "h-[90%]" : "h-full"
        } `}
        ref={messageBoxRef} // Place the ref here on the scrollable section
      >
        {recipient ? (
          isLoadingMessages ? (
            <>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16].map(
                (message) => (
                  <Message
                    key={message}
                    isSkeleton={true}
                    isSender={message % 2 == 0}
                  />
                )
              )}
            </>
          ) : (
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
                    time={message?.timestamp || message?.createdAt}
                    isSender={message.isSender}
                    key={message._id || message.timestamp}
                    messageId={message._id}
                    readReceipts={message?.readReceipts}
                    onDeletingMessage={onDeletingMessage}
                    media={message?.media}
                    isGroup={recipient?.isGroup}
                    senderName={message?.senderId?.name}
                    senderProfilePic={message?.senderId?.profilePic}
                  />
                ))
              )}
            </>
          )
        ) : (
          <Typography
            className="flex justify-center items-center font-bold bottom-72 fixed"
            variant="h3"
          >
            Select a Chat to Start Your Conversation
          </Typography>
        )}
      </Box>
      {recipient?.hasBlocked ? (
        <section
          className={`fixed bottom-0 right-0 flex items-center justify-center bg-white py-3 border border-t-2 w-full lg:w-[70vw]   `}
        >
          <Typography variant="h5" color="initial">
            You Are Blocked By {recipient.name}
          </Typography>
        </section>
      ) : recipient?.isBlocked ? (
        <section
          className={`fixed bottom-0 right-0 flex items-center justify-center bg-white py-3 border border-t-2 w-full lg:w-[70vw]   `}
        >
          <Typography variant="h5" color="initial">
            You Have Blocked {recipient.name}. Unblock {recipient.name} to Start
            Chat.
          </Typography>
        </section>
      ) : (
        <section
          className={`fixed bottom-0 right-0 flex items-center justify-center bg-white w-full lg:w-[70vw]   `}
        >
          {/* Hidden File Input */}
          {selectedFiles.length > 0 && (
            <div className="  p-2 absolute bottom-14 left-0 bg-white min-w-fit">
              <div className="overflow-x-scroll py-2 flex gap-2 justify-start items-center">
                {selectedFiles.map((file, index) => {
                  const fileURL = URL.createObjectURL(file);
                  return file.type.startsWith("image/") ? (
                    <div key={index} className="relative">
                      <img
                        src={fileURL}
                        alt="preview"
                        className="w-16 h-16 rounded-md object-cover"
                      />
                      <button
                        className="absolute top-0 right-0 bg-red-500 text-white text-xs p-1 rounded-full"
                        onClick={() => removeFile(index)}
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div key={index} className="relative">
                      <video
                        src={fileURL}
                        className="w-16 h-16 rounded-md object-cover"
                        controls
                      />
                      <button
                        className="absolute top-0 right-0 bg-red-500 text-white text-xs p-1 rounded-full"
                        onClick={() => removeFile(index)}
                      >
                        ✕
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          <input
            type="file"
            accept="image/*, video/*"
            multiple
            ref={fileInputRef}
            style={{ display: "none" }}
            onChange={handleFileUpload}
            disabled={!recipient}
          />

          {/* Camera Icon (Triggers File Input) */}
          <CameraIcon
            className="outline outline-blue-400 p-2 mx-2 rounded cursor-pointer"
            onClick={() => fileInputRef.current.click()}
          />

          {/* Preview Section */}

          <textarea
            rows={1}
            value={messageToBeSent}
            onChange={(e) => {
              setMessageToBeSent(e.target.value);
              handleTyping();
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            onkeyP
            placeholder="Your Message"
            className="flex-1 resize-none overflow-auto p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            style={{ maxHeight: "150px" }}
          />

          <Button
            className="rounded-md bg-blue-300 text-white"
            disabled={
              (selectedFiles.length === 0 &&
                messageToBeSent.trim().length === 0) ||
              !recipient
            }
            onClick={sendMessage}
          >
            <img
              src={SendButtonImage}
              alt="send button"
              className="h-12 w-12"
            />
          </Button>
        </section>
      )}
    </section>
  );
}
