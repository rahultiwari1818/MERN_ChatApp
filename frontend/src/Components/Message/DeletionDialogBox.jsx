import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Radio,
  RadioGroup,
  Typography,
} from "@mui/material";
import { useState } from "react";

function DeletionDialogBox({
  open,
  handleClose,
  deleteHandler,
  isSender,
  url,
  isDeleteForEveryone,
}) {
  const [deleteOption, setDeleteOption] = useState("me");


  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Delete message?</DialogTitle>
      <DialogContent>
        {isDeleteForEveryone ? (
          <Typography>
            Media will be deleted for everyone.
          </Typography>
        ) : isSender ? (
          <>
            <Typography>
              You can delete messages for everyone or just for yourself.
            </Typography>
            <RadioGroup
              value={deleteOption}
              onChange={(e) => setDeleteOption(e.target.value)}
            >
              <FormControlLabel
                value="me"
                control={<Radio />}
                label="Delete for me"
              />
              <FormControlLabel
                value="everyone"
                control={<Radio />}
                label="Delete for everyone"
              />
            </RadioGroup>
          </>
        ) : (
          <Typography>
            This has no effect on your recipient's chat.!.
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          onClick={() => deleteHandler(deleteOption, url)}
          sx={{
            backgroundColor: "red",
            color: "white",
            textTransform: "none",
            fontWeight: "bold",
            padding: "8px 16px",
            borderRadius: "4px",
            border: "2px solid transparent",
            transition: "all 0.3s ease-in-out",
            "&:hover": {
              backgroundColor: "white",
              color: "red",
              border: "2px solid red",
            },
          }}
        >
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default DeletionDialogBox;
