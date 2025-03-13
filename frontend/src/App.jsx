import { useState } from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css'
import Login from './Components/Login/Login'
import CreateAccount from './Components/CreateAccount/CreateAccount'
import UploadPdf from './Components/UploadPdf/UploadPdf'
import VideoPreview from './Components/VideoPreview/VideoPreview';

function App() {
  const [count, setCount] = useState(0)

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/create-account" element={<CreateAccount />} />
        <Route path="/upload" element={<UploadPdf />} />
        <Route path="/upload-pdf" element={<UploadPdf />} />
        <Route path="/video-preview/:videoId" element={<VideoPreview />} />
      </Routes>
    </Router>
  )
}

export default App
