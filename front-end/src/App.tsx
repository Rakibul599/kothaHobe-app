import { useState } from 'react'
import './App.css'
import Nav from './component/Chat/Chat'
import Body from './component/body/Body'
import RegisterForm from './component/registation/RegisterForm'
import LoginForm from './component/Login/LoginForm'

function App() {
  const [auth, setAuth] = useState(true)

  return (
    <>
    <LoginForm />
      {/* <RegisterForm /> */}
     {/* <Body /> */}
    </>
  )
}

export default App
