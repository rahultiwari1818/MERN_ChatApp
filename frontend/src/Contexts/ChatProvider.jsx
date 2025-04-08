import React, { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import notificationSound from "../Assets/Sounds/notification.mp3";
import { toast } from "react-toastify";
import ToastBox from "../Components/Common/ToastBox";
import axios from "axios";

// Create Chat Context
const ChatContext = createContext();
const socket = io(process.env.REACT_APP_API_URL, {
  auth: {
    userId: localStorage.getItem("token"),
  },
});

// ChatProvider Component
export default function ChatProvider({ children }) {
  const [newMessage, setNewMessage] = useState("");
  const [recipient, setRecipient] = useState("");

  const [recipientConversationStatus, setRecipientConversationStatus] =
    useState("");

  const [users, setUsers] = useState([]);
  const [isUsersLoading, setIsUsersLoading] = useState(false);
  const [messageStatus, setMessageStatus] = useState("");

  const [deleteMessageForEveryone, setDeleteMessageForEveryone] = useState("");

  const changeNewMessage = (mess) => {
    setNewMessage(mess);
  };

  const changeDeleteMessageForEveryone = () => {
    setDeleteMessageForEveryone("");
  };

  const addNewUser = (user) =>{
   setUsers((oldUsers)=>{
        return [user,...oldUsers]
   })
  }


  const getUsers = async (email, showOtherUsers) => {
    try {
      setIsUsersLoading(true);
      const url = `${process.env.REACT_APP_API_URL}/api/v1/users/${
        showOtherUsers ? "getUsers" : "getConversations"
      }?friendMail=${email}`;
      const { data } = await axios.get(url, {
        headers: {
          Authorization: localStorage.getItem("token"),
        },
      });
      setUsers(() => (data.data.length === 0 ? [] : data.data));
    } catch (error) {
      console.log(error?.response);
      //   if (error?.response?.status === 400) navigate('/');
    } finally {
      setIsUsersLoading(false);
    }
  };

  const changeRecipient = async (recipient) => {
    // console.log("recipient selected :",recipient);
    setRecipient(() => recipient);
  };

  const changeBlockingStatus = async (status, isBlocked) => {
    if (isBlocked) {
      setRecipient((old) => {
        return {
          ...old,
          isBlocked: status,
        };
      });
      setUsers((old) => {
        return old?.map((user) => {
          if (user._id === recipient._id) {
            return { ...user, isBlocked: status };
          }
          return user;
        });
      });
    } else {
      setRecipient((old) => {
        return {
          ...old,
          hasBlocked: status,
        };
      });
      setUsers((old) => {
        return old?.map((user) => {
          if (user._id === recipient._id) {
            return { ...user, hasBlocked: status };
          }
          return user;
        });
      });
    }
  };

  const newMessageHandler = (message) => {
    const sound = new Audio(notificationSound);
    sound?.play().catch((error) => {
      console.error("Error playing sound:", error);
    });
    if (
      recipient &&
      (recipient?._id === message.senderId ||
        recipient?._id === message?.groupId)
    ) {
      socket?.emit("markMessageAsRead", {
        _id: message?._id,
        senderId: message?.senderId,
      });
      const updatedMessage = { ...message, readReceipts: "read" };
      setNewMessage(updatedMessage);
    } else {
      setNewMessage({
        ...message,
        isReceived: true,
        isNotForCurrentUser: true,
      });

      setUsers((old) => {
        return old?.map((user) => {
          if (user._id === newMessage.senderId) {
            return {
              ...user,
              unreadedMessagesCount: user.unreadedMessagesCount + 1,
            };
          }
          return user;
        });
      });

      toast(
        <ToastBox
          newMessage={message}
          changeRecipient={changeRecipient}
          users={users}
          isGroup={message?.groupId}
        />,
        {
          position: "top-center",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: false,
          progress: undefined,
          theme: "light",
        }
      );
    }
  };

  const blockUserHandler = async ({ _id }) => {
    if (recipient?._id === _id) {
      changeBlockingStatus(true);
    }
  };

  const unblockUserHandler = async ({ _id }) => {
    if (recipient?._id === _id) {
      changeBlockingStatus(false, false);
    }
  };

  const cameOnlineHandler = async ({ _id }) => {
    if (recipient && recipient?._id === _id) {
      setRecipient(() => {
        return {
          ...recipient,
          isOnline: true,
          isChanged: true,
        };
      });
    }
    setUsers((oldUsers) => {
      const updatedUserList = oldUsers.map((user) => {
        if (user._id === _id) {
          return {
            ...user,
            isOnline: true,
          };
        }
        return user;
      });
      return updatedUserList;
    });
  };

  const gotOfflineHandler = async ({ _id }) => {
    if (recipient) {
      if (recipient?._id === _id) {
        setRecipient(() => {
          return {
            ...recipient,
            isOnline: false,
            isChanged: true,
          };
        });
      }
    }
    setUsers((oldUsers) => {
      const updatedUserList = oldUsers.map((user) => {
        if (user._id === _id) {
          return {
            ...user,
            isOnline: false,
          };
        }
        return user;
      });
      return updatedUserList;
    });
  };

  const markMessageAsReadHandler = async (message) => {
    if (!message) return;

    setUsers((old) => {
      return old?.map((user) => {
        // console.log(user.lastMessage , message)
        if (user.lastMessage._id === message._id) {
          return {
            ...user,
            lastMessage: {
              ...user.lastMessage,
              readReceipts: "read",
            },
          };
        }
        return user;
      });
    });
    setMessageStatus(message);
  };

  const changeMessageStatus = async () => {
    setMessageStatus(null);
  };

  const wholeConversationIsReadedHandler = (data) => {
    if (!recipient) return;
    if (recipient._id === data.recipientId) {
      setRecipientConversationStatus(true);
    }
  };

  const changeRecipientConversationStatus = () => {
    setRecipientConversationStatus(false);
  };

  const newConversationStartedHandler = (newConversation) => {
    setUsers((oldUsers) => {
      if (oldUsers?.at(0)._id === newConversation._id) return oldUsers;
      return [newConversation, ...oldUsers];
    });
  };

  const removeExistingMemberFromGroup = (userId) => {
    setRecipient((old) => {
      return {
        ...old,
        members: old?.members?.filter((member) => member._id !== userId),
      };
    });
  };

  const addNewMembersInGroup = (users) => {
    setRecipient((old) => {
      return {
        ...old,
        members: users,
      };
    });
  };

  const changeGroupMemberRole = (userId, role) => {
    setRecipient((old) => {
      return {
        ...old,
        members: old?.members?.map((member) => {
          const newRole = member._id === userId ? role : member.role;
          return {
            ...member,
            role: newRole,
          };
        }),
      };
    });
  };

  const updateGroupDescription = (desc) => {
    setRecipient((old) => {
      return {
        ...old,
        description: desc,
      };
    });
  };

  const updateGroupIcon = (groupIcon) => {
    setRecipient((old) => {
      return {
        ...old,
        profilePic: groupIcon,
      };
    });
  };

  const handleTyping = () => {
    let typingTimeout;
    if (!recipient) return;
    const packet = {
      _id: recipient._id,
      isGroup: recipient?.isGroup,
      token: localStorage.getItem("token"),
      isTyping: true,
    };
    socket.emit("typing", packet); // Replace with actual user info
    clearTimeout(typingTimeout); // Reset typing timeout
    typingTimeout = setTimeout(() => {
      packet.isTyping = false;
      socket.emit("typing", packet); // Clear typing status after 1 second
    }, 3000); // Typing indicator disappears after 1 second
  };

  const recipientTypingHandler = (data) => {
    // debugger;
    // console.log(recipient,"rth")
    if(!recipient || !recipient._id) return;
    if (data._id === recipient?._id) {
      setRecipient((old) => {
        return {
          ...old,
          isTyping: data?.isTyping,
          typingHandling: true,
          typer: data?.name,
        };
      });
    } else {
    }
  };

  const changeUnreadedMessageCount = () => {
    if (recipient && recipient?.unreadedMessagesCount > 0) {
      setUsers((old) => {
        return old?.map((user) => {
          if (user._id === recipient._id) {
            return {
              ...user,
              unreadedMessagesCount: 0,
            };
          }
          return user;
        });
      });
    }
  };

  const updateReadReceiptHandler = (data) => {
    // console.log(data)
    // if(data?.senderId === recipient._id){
    //   console.log(data)
    // }
  };

  const messageDeletedForEveryoneHandler = (data) => {
    try {
      if (data.senderId === recipient?._id) {
        setDeleteMessageForEveryone(data.messageId);
      }
    } catch (error) {}
  };

  const userLoggedOut = () => {
    socket?.emit("logout");
  };

  const loggedIn = () => {
    socket.emit("loggedin");
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      socket?.connect();
    }
  }, [localStorage.getItem("token")]);


  useEffect(() => {


    socket?.on("connect", () => {
      console.log("connected");
    });
    socket?.on("connect_error", (err) => {
      console.log("Connection Error: ", err);
    });
    socket?.on("connect_failed", (err) => {
      console.log("Connection Failed: ", err);
    });

    socket?.on("newMessage", newMessageHandler);

    socket?.on("userBlocked", blockUserHandler);

    socket?.on("userUnblocked", unblockUserHandler);

    socket?.on("userCameOnline", cameOnlineHandler);

    socket?.on("userGoneOffline", gotOfflineHandler);

    if (recipient) {
      changeUnreadedMessageCount();
      socket?.emit("markConversationAsRead", {
        senderId: recipient?._id,
        token: localStorage.getItem("token"),
      });
    }

    socket?.on("messageHasBeenReaded", markMessageAsReadHandler);

    socket?.on("wholeConversationIsReaded", wholeConversationIsReadedHandler);

    socket?.on("newConversationStarted", newConversationStartedHandler);

    socket?.on("recipientTyping", recipientTypingHandler);

    socket?.on("updateReadReceipt", updateReadReceiptHandler);

    socket?.on("messageDeletedForEveryone", messageDeletedForEveryoneHandler);




    return () => {
      socket?.off("newMessage");
    };
  }, [recipient?._id]);

  return (
    <ChatContext.Provider
      value={{
        newMessage,
        changeRecipient,
        recipient,
        changeBlockingStatus,
        users,
        getUsers,
        messageStatus,
        isUsersLoading,
        changeNewMessage,
        recipientConversationStatus,
        removeExistingMemberFromGroup,
        changeGroupMemberRole,
        updateGroupIcon,
        addNewMembersInGroup,
        updateGroupDescription,
        changeRecipientConversationStatus,
        changeMessageStatus,
        handleTyping,
        deleteMessageForEveryone,
        changeDeleteMessageForEveryone,
        userLoggedOut,
        loggedIn,
        addNewUser
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export const useChat = () => {
  return useContext(ChatContext);
};
