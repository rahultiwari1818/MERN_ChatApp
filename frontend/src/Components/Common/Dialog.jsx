import React  from 'react'
import { Dialog, DialogTitle, DialogContent, DialogActions,Button } from "@mui/material";

export default function DialogComp({open,handleClose,dialogTitle,children}) {
    return (
        <div>
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>{dialogTitle}</DialogTitle>
                <DialogContent>
                    {
                        children
                    }
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Close</Button>
                </DialogActions>
            </Dialog>
        </div>
    )
}
