import axios from 'axios';
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';

const VerifyCode: React.FC = () => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const handleSubmit =async (e: React.FormEvent) => {
    e.preventDefault();
  
    if (code.length === 6) {
      // Call your backend verify API here
        try {
            const response = await axios.put(`${import.meta.env.VITE_API}/registration/verify`,{id,code} ,{
                withCredentials: true,
              });
              console.log(response.data);
              if(response.status===200)
              {
                console.log("gptt")
                // alert(response.data.txt);
                navigate('/');
              }
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
              console.log(error.response.data.error);
              toast(error.response.data.error)
            } else {
              console.error('An unexpected error occurred:', error);
            }
        }
    //   console.log('Verification code submitted:', code);
    } else {
      setError('Please enter a valid 6-digit code.');
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-r from-blue-200 to-teal-300">
    <ToastContainer />
      <div className="bg-white shadow-md rounded-xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-blue-600 mb-2">Verify Your Email</h2>
        <p className="text-center text-gray-600 mb-6">Enter the 6-digit code sent to your email</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            maxLength={6}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Enter 6-digit code"
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg"
          >
            Verify
          </button>
        </form>

        <div className="text-center mt-4">
          <p className="text-sm text-gray-500">Didn't receive a code? <button className="text-blue-600 hover:underline">Resend</button></p>
        </div>
      </div>
    </div>
  );
};

export default VerifyCode;
