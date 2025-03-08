import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getUserFile } from '../../utils/firebaseUtils';
import './VideoPreview.css';

function VideoPreview() {
  const [videoData, setVideoData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { videoId } = useParams();

  useEffect(() => {
    const fetchVideoData = async () => {
      try {
        setLoading(true);
        // Fetch the video file using the utility function
        const data = await getUserFile(null, videoId);
        setVideoData(data);
      } catch (err) {
        console.error('Error fetching video:', err);
        setError('Failed to load video. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchVideoData();
  }, [videoId]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleDownload = () => {
    if (videoData?.url) {
      window.open(videoData.url, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="wrapper">
        <h1 className="video-preview-screen-header">Loading...</h1>
      </div>
    );
  }

  if (error) {
    return (
      <div className="wrapper">
        <h1 className="video-preview-screen-header">Error</h1>
        <p>{error}</p>
        <button onClick={handleBack}>Go Back</button>
      </div>
    );
  }

  return (
    <div className="wrapper">
      <button className="back-button" onClick={handleBack}>
        <span className="arrow">←</span> Back
      </button>
      <h1 className="video-preview-screen-header">Video Preview</h1>
      
      {videoData && (
        <>
          <div className="video-container">
            <video controls src={videoData.url}></video>
          </div>
          
          <div className="video-info">
            <h3>Video Information</h3>
            <p>Filename: {videoData.name}</p>
            <p>Path: {videoData.fullPath}</p>
          </div>
          
          <button 
            className="download-button"
            onClick={handleDownload}
          >
            Download Video
          </button>
          
          <div className="share-options">
            <button onClick={() => navigator.clipboard.writeText(videoData.url)}>
              Copy Link
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default VideoPreview; 