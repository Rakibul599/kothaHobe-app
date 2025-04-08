import React from "react";
import { Link } from "react-router-dom";

const LoginForm: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-200 to-teal-300 flex items-center justify-center">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
        <h2 className="text-3xl font-bold text-blue-600 text-center">Login</h2>
        <p className="text-center text-gray-600 mt-1 mb-6">
          Welcome back! Please login to your account
        </p>

        <form>
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              placeholder="example@domain.com"
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
              placeholder="••••••••"
              className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
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
            Login
          </button>
          <div className="mt-4">
            <p>Not Registered? <Link to={'/registration'} className="text-blue-500">Register</Link></p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;
