import React from 'react'
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from "@mui/material";

export default function DialogComp({ open, handleClose, dialogTitle, children }) {
    return (
        <div>
            <Dialog open={open} onClose={handleClose} >
                <DialogTitle
                    sx={{
                        backgroundColor: '#3B82F6', // bg-blue-500 equivalent
                        textAlign: 'center',
                        padding: '4px',
                        border: '1px solid blue',
                        color: 'white' // Adjust text color for better contrast
                    }}
                >
                    {dialogTitle}
                </DialogTitle>
                <DialogContent
                    sx={{
                        padding: '16px !important', // Adjust padding if needed
                        backgroundColor: '#F3F4F6', // Optional: Light background for content
                    }}
                >
                    {
                        children
                    }
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}
                     sx={{
                        backgroundColor: '#3B82F6',
                        color: 'white',
                        textTransform: 'none',
                        fontWeight: 'bold',
                        padding: '8px 16px',
                        borderRadius: '4px',
                        border: '2px solid transparent',
                        transition: 'all 0.3s ease-in-out',
                        '&:hover': {
                            backgroundColor: 'white',
                            color: '#3B82F6',
                            border: '2px solid #3B82F6',
                        },
                      }}
                    >Close</Button>
                </DialogActions>
            </Dialog>
        </div>
    )
}
