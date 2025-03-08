import React, { useState } from 'react';
import './VideoPreview.css';

const VideoPreview = ({ videoSrc, videoName }) => {
    const [videoUrl, setVideoUrl] = useState(videoSrc);

    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = videoUrl;
        /* TO DO
            - Change video file name
            - Change the source of the video
         */
        link.download = videoName || 'video.mp4';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className='video-preview-wrapper'>
            <video width="600" controls>
                <source src={videoUrl} type="video/mp4" />
                Your browser does not support the video tag.
            </video>
            <button onClick={handleDownload} className='download-button'>
                Download Video
            </button>
        </div>
    );
};

export default VideoPreview; 