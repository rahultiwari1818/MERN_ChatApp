import React from "react";
import { ReactComponent as CloseIcon } from "../../Assets/SVGs/CloseIcon.svg";
import DownloadIcon from "../../Assets/Images/DownloadIcon.png";
import {saveAs} from "file-saver";

export default function MediaPreviewModal({
  open,
  close,
  deleteFunc,
  url,
  type,
}) {
  if (!open) return null; // Return null if the modal is not open

  const handleDelete = () => {
    if (deleteFunc) {
      deleteFunc(); // Call deleteFunc when delete button is clicked
      close(); // Close the modal after deleting
    }
  };

  const handleDownload = () => {
    saveAs(url,url.split("/").pop());  
  };
  

  return (
    <section className=" fixed top-0 left-0 right-0 bottom-0 flex justify-center items-center bg-black bg-opacity-70 z-20">
      <section className="absolute flex justify-between gap-5 top-10 right-5">
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

      {/* Delete Button (if deleteFunc exists) */}
      {deleteFunc && (
        <button
          onClick={handleDelete}
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2 text-white bg-red-500 px-4 py-2 rounded"
        >
          Delete
        </button>
      )}
    </section>
  );
}
