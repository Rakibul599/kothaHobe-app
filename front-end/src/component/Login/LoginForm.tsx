import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const LoginForm: React.FC = () => {
  const [formdata, setFormdata] = useState<{
    email: string;
    password: string;
    remember: boolean;
  }>({
    email: "",
    password: "",
    remember: false,
  });
  const [errr, setEroor] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API}/chats`, {
          withCredentials: true,
        });
        navigate("/chats");
        console.log("Auto-logged in!", response.data);
      } catch (error) {
        console.log("Error fetching chats:", error);
        navigate("/"); // Not logged in
      }
    };

    fetchChats();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormdata((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const formHandler = async (event: React.FormEvent) => {
    event.preventDefault();
    setEroor("");
    setLoading(true);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API}/login`,
        formdata,
        {
          withCredentials: true,
        }
      );
      if (response.data.success) {
        navigate("/chats");
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setEroor(error.response?.data.msg || "Login failed");
      } else {
        setEroor("Login failed");
      }
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-200 to-teal-300 flex place-content-center items-center gap-6 p-4">
      <div className="md:block hidden">
        <p className="text-black text-6xl font-bold">KothaHobe!</p>
        <p className="text-4xl w-[60%] mt-1">KothaHobe connects to Each other!</p>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
        <h1 className="text-black text-4xl font-bold text-center md:hidden">
          KothaHobe!
        </h1>
        <h2 className="text-3xl font-bold text-blue-600 text-center">Login</h2>
        <p className="text-center text-gray-600 mt-1 mb-6">
          Welcome back! Please login to your account
        </p>

        <form onSubmit={formHandler}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="example@domain.com"
              onChange={handleChange}
              value={formdata.email}
              className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="password" className="block text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              onChange={handleChange}
              value={formdata.password}
              placeholder="••••••••"
              className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="flex items-center mb-6">
            <input
              type="checkbox"
              id="remember"
              onChange={handleChange}
              className="mr-2 cursor-pointer"
              name="remember"
            />
            <label
              htmlFor="remember"
              className="text-sm text-gray-700 cursor-pointer"
            >
              Remember me
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2.5 rounded-xl hover:bg-blue-700 transition duration-200 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 font-semibold flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Logging in...</span>
              </>
            ) : (
              "Login"
            )}
          </button>

          {errr && (
            <p className="text-red-500 text-sm mt-3 text-center font-medium">
              {errr}
            </p>
          )}

          <div className="mt-4 text-center">
            <p className="text-sm">
              Not Registered?{" "}
              <Link to={"/registration"} className="text-blue-600 font-semibold hover:underline">
                Register
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;
