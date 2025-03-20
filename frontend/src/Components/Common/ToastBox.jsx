import { Avatar } from "@mui/material";
import React, { useEffect, useState } from "react";
import ProfileIcon from "../../Assets/SVGs/Profile.svg";

export default function ToastBox({ newMessage, changeRecipient, users, isGroup }) {







  const handleRecipientChange = () => {
    const recipient = users?.find((user) => user._id === (isGroup ? newMessage.groupId : newMessage.senderId));
    if (recipient) changeRecipient(recipient);
  };

  const profilePic = isGroup
    ? newMessage?.profilePic
    : newMessage?.senderProfilePic || ProfileIcon;

  return (
    <section className="flex justify-between items-center px-2 py-1 cursor-pointer text-xs md:text-sm" onClick={handleRecipientChange}>
      <section>
        <Avatar
          src={profilePic}
          alt="Profile"
          className={`${!newMessage?.senderProfilePic ? "rounded outline outline-white p-2 bg-white" : ""}`}
          sx={!newMessage?.senderProfilePic ? { width: 40, height: 40 } : { backgroundColor: "#ffffff" }}
        />
      </section>
      <section className="flex flex-col justify-between">
        <p className="font-bold">{isGroup ? newMessage?.name : newMessage.senderName}</p>
        <p>{newMessage.message.slice(0, 10)}</p>
      </section>
    </section>
  );
}
