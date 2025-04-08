import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {createBrowserRouter, RouterProvider} from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import LoginForm from './component/Login/LoginForm.tsx'
import RegisterForm from './component/registation/RegisterForm.tsx'
import Body from './component/body/Body.tsx'
import Notfound from './component/Notfoundpage/Notfound.tsx'
const router=createBrowserRouter([
  {path:'/',element:<LoginForm />},
  {path:'/registration',element:<RegisterForm />},
  {path:'/chats',element:<Body />},
  {path:'*',element:<Notfound />},
])
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* <App /> */}
    <RouterProvider router={router} />
  </StrictMode>,
)
