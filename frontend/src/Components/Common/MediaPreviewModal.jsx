import React, { useCallback, useState } from "react";
import { ReactComponent as CloseIcon } from "../../Assets/SVGs/CloseIcon.svg";
import DownloadIcon from "../../Assets/Images/DownloadIcon.png";
import { ReactComponent as DeleteIcon } from "../../Assets/SVGs/DeleteIcon.svg";

import { saveAs } from "file-saver";
import DeletionDialogBox from "../Message/DeletionDialogBox";

export default function MediaPreviewModal({
  open,
  close,
  deleteFunc,
  url,
  type,
  isSender
}) {
  const [openDeletionModal, setOpenDeletionModal] = useState(false);

  const closeOpenDeletionModal = useCallback(() => {
    setOpenDeletionModal(false);
  }, []);

  const handleDelete = () => {
    // if (deleteFunc) {
    //   deleteFunc(url); // Call deleteFunc when delete button is clicked
    //   close(); // Close the modal after deleting
    // }
    setOpenDeletionModal(true);
  };

  const handleDownload = () => {
    saveAs(url, url.split("/").pop());
  };
  if (!open) return;

  return (
    <>
      <section className=" fixed top-0 left-0 right-0 bottom-0 flex justify-center items-center bg-black bg-opacity-70 z-20">
        <section className="absolute flex justify-between gap-5 top-10 right-5">
          {
            isSender
            &&
          <DeleteIcon
            className="  text-white cursor-pointer bg-white  p-3 rounded-full h-10 w-10 "
            onClick={handleDelete}
          />
          }

          <img
            src={DownloadIcon}
            alt="download"
            className="bg-white cursor-pointer rounded-full p-2 h-10 w-10"
            onClick={handleDownload}
          />
          <CloseIcon
            className="  text-white cursor-pointer bg-white p-2 rounded-full h-10 w-10 "
            onClick={close}
          />
        </section>

        {/* Render Image */}
        {type.includes("image") && (
          <img
            src={url}
            alt="media-preview"
            className="max-w-full max-h-full object-contain "
          />
        )}

        {/* Render Video */}
        {type.includes("video") && (
          <video controls className="max-w-full max-h-full object-contain">
            <source src={url} type={type} />
            Your browser does not support the video tag.
          </video>
        )}

        
      </section>
      <DeletionDialogBox
        open={openDeletionModal}
        handleClose={closeOpenDeletionModal}
        deleteHandler={deleteFunc}
        isSender={isSender}
        url={url}
        isDeleteForEveryone={true}
      />
    </>
  );
}
