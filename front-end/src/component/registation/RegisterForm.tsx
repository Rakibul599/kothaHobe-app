import axios from "axios";
import React, { useState } from "react";
import { data, Link, useNavigate } from "react-router-dom";

const RegisterForm: React.FC = () => {
  const [avatar, setAvatar] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const navigate = useNavigate();
  const [errorMsg, setErrorMsg] = useState<{
    name: string;
    email: string;
    password: string;
    avatar: string;
  }>({
    name: "",
    email: "",
    password: "",
    avatar: "",
  });

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatar(file);
      setPreview(URL.createObjectURL(file));
    }
  };
  const formHandler = async (event) => {
    event.preventDefault();
    const file = event.target.avatar.files[0];
    // console.log(file.name);
    const form = event.target;
    const name = form.name.value;
    const email = form.email.value;
    const password = form.password.value;
    const remember = form.remember.checked;
    let formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    formData.append("password", password);
    formData.append("remember", remember);
    formData.append("avaters", file);
    // send the request to server
    // let na={name:"fdhf"}
    
    try {
      const response = await axios.post(`${import.meta.env.VITE_API}/registration`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
    
      const result = response.data;
      const uid=result.id;
      console.log(response.data)
      // let response = await fetch("http://localhost:5000//registration", {
      //   method: "POST",
      //   body: formData,
      // });

      // // get response
      // let result = await response.json();
      if (response.status !== 200) {
        setErrorMsg({
          name: result.errors.name?.msg || "",
          email: result.errors.email?.msg || "",
          password: result.errors.password?.msg || "",
          avatar: result.errors.avatar?.msg || "",
        });
      } else {
        navigate(`/verify/${uid}`);
        // alert("Registration successfully");
      }
      // console.log(result.errors.password.msg)
      console.log(errorMsg.password);
    } catch (error) {
      console.log(error);
      alert(error);
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-200 to-teal-300 flex items-center justify-center">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
        <h2 className="text-3xl font-bold text-blue-600 text-center">
          Register
        </h2>
        <p className="text-center text-gray-600 mt-1 mb-6">
          Create your account
        </p>

        <form onSubmit={formHandler}>
          {/* Avatar Upload */}
          <div className="mb-4 text-center">
            {preview ? (
              <img
                src={preview}
                alt="Avatar Preview"
                className="w-24 h-24 mx-auto rounded-full object-cover mb-2"
              />
            ) : (
              <div className="w-24 h-24 mx-auto rounded-full bg-gray-200 flex items-center justify-center mb-2">
                <span className="text-gray-400 text-sm">No Image</span>
              </div>
            )}
            <label
              htmlFor="avatar"
              className="cursor-pointer text-blue-500 hover:underline text-sm"
            >
              Upload Avatar
            </label>
            <input
              type="file"
              id="avatar"
              accept="image/*"
              name="avatars"
              onChange={handleAvatarChange}
              className="hidden"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="name" className="block text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              id="name"
              placeholder="Your full name"
              className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              placeholder="example@domain.com"
              className={`w-full border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2
                 
                 ${
                   errorMsg.email
                     ? "border-red-500 focus:ring-red-500"
                     : "border-gray-300 focus:ring-blue-500"
                 }
                 `}
              required
            />
            <p className={`${errorMsg.email ? "" : "hidden"} text-red-500`}>
              {errorMsg.email}
            </p>
          </div>

          <div className="mb-4">
            <label htmlFor="password" className="block text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              placeholder="••••••••"
              className={`w-full border rounded-xl px-4 py-2 focus:outline-none focus:ring-2 ${
                errorMsg.password
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:ring-blue-500"
              }`}
              required
            />
            <p className={`${errorMsg.password ? "" : "hidden"} text-red-500`}>
              {errorMsg.password}
            </p>
          </div>

          <div className="flex items-center mb-6">
            <input type="checkbox" id="remember" className="mr-2" />
            <label htmlFor="remember" className="text-sm text-gray-700">
              Remember me
            </label>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-xl hover:bg-blue-700 transition duration-200"
          >
            Register
          </button>

          <div className="mt-4 text-center">
            <p>
              Already have an account?{" "}
              <Link to="/" className="text-blue-500">
                Login
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterForm;
