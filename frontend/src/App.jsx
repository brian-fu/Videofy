import { useState } from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css'
import LoginForm from './Components/LoginForm/LoginForm'
import CreateAccount from './Components/CreateAccountForm/CreateAccount'

function App() {
  const [count, setCount] = useState(0)

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginForm />} />
        <Route path="/create-account" element={<CreateAccount />} />
      </Routes>
    </Router>
  )
}

export default App
