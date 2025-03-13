const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { exec } = require('child_process');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Serve static files from the output directory
app.use('/videos', express.static(path.join(__dirname, 'output')));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'input');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Save the file with its original name for easier processing
    cb(null, file.originalname);
  }
});

const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// PDF upload endpoint
app.post('/api/upload-pdf', upload.single('pdf'), async (req, res) => {
  try {
    console.log('PDF upload request received');
    
    if (!req.file) {
      console.log('No PDF file in request');
      return res.status(400).json({ error: 'No PDF file uploaded' });
    }

    console.log('PDF file received:', req.file.originalname);
    const pdfPath = req.file.path;
    const pdfFilename = req.file.originalname;
    const videoId = uuidv4();
    const outputFilename = `${videoId}.mp4`;
    
    console.log('Generated videoId:', videoId);
    console.log('Output filename:', outputFilename);
    
    // Run the Python script to process the PDF and generate a video
    const pythonScript = path.join(__dirname, 'processing', 'video_generator.py');
    const command = `python "${pythonScript}" "${pdfFilename}" "${outputFilename}"`;
    
    console.log('Executing command:', command);
    
    // Execute the command asynchronously
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing Python script: ${error}`);
        console.error(`stderr: ${stderr}`);
        return res.status(500).json({ error: 'Failed to generate video' });
      }
      
      console.log(`Python script output: ${stdout}`);
      
      if (stderr) {
        console.log(`Python script stderr: ${stderr}`);
      }
      
      // Check if the video file was created
      const videoPath = path.join(__dirname, 'output', outputFilename);
      console.log('Checking for video file at:', videoPath);
      
      if (!fs.existsSync(videoPath)) {
        console.log('Video file was not generated');
        return res.status(500).json({ error: 'Video file was not generated' });
      }
      
      console.log('Video file was successfully generated');
      
      // Return the URL to access the video
      const videoUrl = `/videos/${outputFilename}`;
      console.log('Video URL:', videoUrl);
      
      res.json({ 
        success: true, 
        message: 'Video generated successfully',
        videoUrl,
        videoId
      });
    });
  } catch (error) {
    console.error('Error processing PDF:', error);
    res.status(500).json({ error: 'Failed to process PDF' });
  }
});

// Endpoint to check video generation status
app.get('/api/video-status/:videoId', (req, res) => {
  const videoId = req.params.videoId;
  console.log('Checking video status for videoId:', videoId);
  
  const videoPath = path.join(__dirname, 'output', `${videoId}.mp4`);
  console.log('Looking for video file at:', videoPath);
  
  if (fs.existsSync(videoPath)) {
    console.log('Video file found, status: completed');
    res.json({ 
      status: 'completed',
      videoUrl: `/videos/${videoId}.mp4`
    });
  } else {
    console.log('Video file not found, status: processing');
    res.json({ status: 'processing' });
  }
});

app.get('/', (req, res) => {
  res.send('Hello, World!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`)); 
