import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router-dom';
import './UploadPdf.css';

const UploadPdf = () => {
    const navigate = useNavigate();
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadStage, setUploadStage] = useState('');
    
    const onDrop = useCallback(async (acceptedFiles) => {
        if (acceptedFiles.length === 0) return;
        
        const file = acceptedFiles[0];
        setUploading(true);
        setUploadError(null);
        setUploadProgress(0);
        setUploadStage('Uploading file');
        
        // Simulate a more realistic upload/processing progress with moderate speed
        const progressInterval = setInterval(() => {
            setUploadProgress(prev => {
                // Different stages of processing with balanced speeds
                if (prev < 20) {
                    // Initial upload - quick
                    setUploadStage('Uploading file');
                    return prev + (Math.random() * 3.0);
                } else if (prev < 40) {
                    // Text extraction
                    setUploadStage('Extracting text from PDF');
                    return prev + (Math.random() * 2.5);
                } else if (prev < 60) {
                    // Text summarization
                    setUploadStage('Summarizing content');
                    return prev + (Math.random() * 2.0);
                } else if (prev < 80) {
                    // Text to speech
                    setUploadStage('Converting text to speech');
                    return prev + (Math.random() * 1.5);
                } else if (prev < 95) {
                    // Video generation
                    setUploadStage('Generating video with subtitles');
                    return prev + (Math.random() * 1.0);
                }
                
                // Cap at 95% until actual completion
                clearInterval(progressInterval);
                return 95;
            });
        }, 400); // Faster interval
        
        try {
            // Create FormData object to send file
            const formData = new FormData();
            formData.append('pdf', file);
            
            // Send to backend
            const response = await fetch('http://localhost:5000/api/upload-pdf', {
                method: 'POST',
                body: formData,
            });
            
            if (!response.ok) {
                throw new Error('Failed to upload PDF');
            }
            
            const data = await response.json();
            
            // Set progress to 100% when complete
            clearInterval(progressInterval);
            setUploadProgress(100);
            setUploadStage('Processing complete');
            
            // short delay to show 100% completion before navigating
            setTimeout(() => {
                navigate(`/video-preview/${data.videoId}`);
            }, 500);
            
        } catch (error) {
            clearInterval(progressInterval);
            console.error('Error uploading PDF:', error);
            setUploadError(error.message);
            setUploading(false);
        }
    }, [navigate]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {'application/pdf': ['.pdf']},
        maxFiles: 1,
        disabled: uploading
    });

    return (
        <div>
            <div className='wrapper'>
                <form>
                    <h1>Upload PDF</h1>
                    <div {...getRootProps({ className: `dropzone ${uploading ? 'disabled' : ''}` })} style={{ opacity: uploading ? 0.6 : 1 }}>
                        <input {...getInputProps()} />
                        {
                            isDragActive ?
                                <h2>Drop the PDF here...</h2> :
                                <h2>Drag & drop a PDF here</h2>
                        }
                    </div>
                    
                    {uploading && (
                        <div className="upload-animation-container">
                            <div className="upload-icon"></div>
                            <div className="upload-progress">
                                <div 
                                    className="upload-progress-bar" 
                                    style={{ 
                                        width: `${uploadProgress}%`,
                                        animation: uploadProgress >= 100 ? 'none' : undefined
                                    }}
                                ></div>
                            </div>
                            <p className="status-message">
                                {uploadProgress < 100 
                                    ? `${uploadStage}... ${Math.round(uploadProgress)}%` 
                                    : 'Processing complete! Redirecting...'}
                            </p>
                        </div>
                    )}
                    
                    {uploadError && <p className="error-message">{uploadError}</p>}
                    <button 
                        type='button' 
                        className='upload-button' 
                        onClick={() => document.querySelector('input[type="file"]').click()}
                        disabled={uploading}
                        style={{ opacity: uploading ? 0.7 : 1 }}
                    >
                        {uploading ? 'Processing...' : 'Upload PDF from Computer'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default UploadPdf;