import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './VideoPreview.css';

function VideoPreview() {
  const [videoUrl, setVideoUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingStatus, setProcessingStatus] = useState('processing');
  const navigate = useNavigate();
  const { videoId } = useParams();

  console.log('VideoPreview component rendered with videoId:', videoId);

  useEffect(() => {
    const checkVideoStatus = async () => {
      try {
        console.log('Checking video status...');
        const response = await fetch(`http://localhost:5000/api/video-status/${videoId}`);
        
        if (!response.ok) {
          console.error('Video status response not OK:', response.status);
          throw new Error('Failed to check video status');
        }
        
        const data = await response.json();
        console.log('Video status response:', data);
        
        setProcessingStatus(data.status);
        
        if (data.status === 'completed') {
          const fullVideoUrl = `http://localhost:5000${data.videoUrl}`;
          console.log('Video is ready, setting URL:', fullVideoUrl);
          setVideoUrl(fullVideoUrl);
          setLoading(false);
        }
      } catch (err) {
        console.error('Error checking video status:', err);
        setError('Failed to check video status. Please try again.');
        setLoading(false);
      }
    };

    // Check immediately
    checkVideoStatus();
    
    // Then check every 5 seconds if still processing
    const intervalId = setInterval(() => {
      if (processingStatus === 'processing') {
        console.log('Video still processing, checking again...');
        checkVideoStatus();
      } else {
        console.log('Video processing complete, stopping interval checks');
        clearInterval(intervalId);
      }
    }, 5000);

    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, [videoId, processingStatus]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleDownload = () => {
    if (videoUrl) {
      window.open(videoUrl, '_blank');
    }
  };

  console.log('Current component state:', { 
    videoUrl, 
    loading, 
    error, 
    processingStatus 
  });

  return (
    <div className="wrapper">
      <h1 className="video-preview-screen-header">Video Preview</h1>
      
      {loading && processingStatus === 'processing' && (
        <div className="processing-container">
          <h2>Processing Your Video</h2>
          <p>This may take a few minutes depending on the size of your PDF.</p>
          <div className="loading-spinner"></div>
        </div>
      )}
      
      {error && (
        <div className="error-container">
          <h2>Error</h2>
          <p>{error}</p>
        </div>
      )}
      
      {videoUrl && (
        <>
          <div className="video-container">
            <video controls src={videoUrl}></video>
          </div>
          
          <div className="video-info">
            <h3>Your Video is Ready!</h3>
            <p>You can download or share this video using the buttons below.</p>
          </div>
          
          <button 
            className="download-button"
            onClick={handleDownload}
          >
            Download Video
          </button>
          
          <div className="share-options">
            <button onClick={() => navigator.clipboard.writeText(videoUrl)}>
              Copy Link
            </button>
          </div>
          <div className="back-button-container">
            <button className="back-button" onClick={handleBack}>
              <span className="arrow">←</span> Upload Another PDF
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default VideoPreview; 