import {  Typography } from '@mui/material'
import React from 'react'

export default function ErrorPage() {
  return (
    <section className='bg-blue-300 min-h-[90vh] w-screen flex items-center justify-center'>
        <Typography variant="h1" color="white">
                404 Not Found
        </Typography>
    </section>
  )
}
