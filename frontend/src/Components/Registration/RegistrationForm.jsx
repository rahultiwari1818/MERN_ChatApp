import React, { useState } from 'react';
import axios from "axios";

export default function RegistrationForm() {
  const [data, setData] = useState({
    name: "",
    email: "",
    password: ""
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setData({
      ...data,
      [name]: value
    });
  };

  const handleSubmission = async(e) => {
    e.preventDefault();
    // Handle form submission logic here
	try {
		const response = await axios.post(`${process.env.REACT_APP_BASE_URL}/api/v1/user/register`,data);

		
	} catch (error) {
		
	}

  };

  return (
      <form
        className='bg-white p-6 md:p-10  shadow-md '
        method="post"
        onSubmit={handleSubmission}
      >
        <h2 className='text-2xl font-bold mb-1 text-center'>Welcome</h2>
		<h2 className='text-xl font-semibold mb-6 text-center'>Sign up now to get started</h2>
		
        <div className='mb-4'>
          <label htmlFor="name" className='block text-gray-700 text-sm font-bold mb-2'>Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={data.name}
            onChange={handleInputChange}
            className='w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
            required
            placeholder='Your Name'
          />
        </div>
        <div className='mb-4'>
          <label htmlFor="email" className='block text-gray-700 text-sm font-bold mb-2'>Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={data.email}
            onChange={handleInputChange}
            className='w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
            required
            placeholder='Your Email'
          />
        </div>
        <div className='mb-4'>
          <label htmlFor="password" className='block text-gray-700 text-sm font-bold mb-2'>Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={data.password}
            onChange={handleInputChange}
            className='w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
            required
            placeholder='Your Password'
          />
        </div>
        <button
          type="submit"
          className='w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50'
        >
          Register
        </button>
      </form>
  );
}
