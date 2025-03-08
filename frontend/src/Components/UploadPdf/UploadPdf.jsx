import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router-dom';
import './UploadPdf.css';

const UploadPdf = () => {
    const navigate = useNavigate();
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState(null);
    
    const onDrop = useCallback(async (acceptedFiles) => {
        if (acceptedFiles.length === 0) return;
        
        const file = acceptedFiles[0];
        setUploading(true);
        setUploadError(null);
        
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
            
            // Navigate to video preview with the generated video ID
            navigate(`/video-preview/${data.videoId}`);
        } catch (error) {
            console.error('Error uploading PDF:', error);
            setUploadError(error.message);
        } finally {
            setUploading(false);
        }
    }, [navigate]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {'application/pdf': ['.pdf']},
        maxFiles: 1
    });

    return (
        <div>
            <div className='back-button'><button className='back-button' onClick={() => navigate(-1)}>Back</button></div>
            <div className='wrapper'>
                <form>
                    <h1>Upload PDF</h1>
                    <div {...getRootProps({ className: 'dropzone' })}>
                        <input {...getInputProps()} />
                        {
                            isDragActive ?
                                <h2>Drop the PDF here...</h2> :
                                <h2>Drag & drop a PDF here</h2>
                        }
                    </div>
                    {uploading && <p className="status-message">Uploading and processing PDF...</p>}
                    {uploadError && <p className="error-message">{uploadError}</p>}
                    <button 
                        type='button' 
                        className='upload-button' 
                        onClick={() => document.querySelector('input[type="file"]').click()}
                        disabled={uploading}
                    >
                        {uploading ? 'Processing...' : 'Upload PDF from Computer'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default UploadPdf;