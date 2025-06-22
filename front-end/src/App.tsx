import { useState } from 'react'
import './App.css'
import Nav from './component/Chat/Chat'
import Body from './component/body/Body'
import RegisterForm from './component/registation/RegisterForm'
import LoginForm from './component/Login/LoginForm'
import VerifyCode from './component/verification/VerifyCode'

function App() {
  const [auth, setAuth] = useState(true)

  return (
    <>
    {/* <VerifyCode /> */}
    {/* <LoginForm /> */}
      {/* <RegisterForm /> */}
     {/* <Body /> */}
    </>
  )
}

export default App
