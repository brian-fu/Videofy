import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import './UploadPdf.css';

const UploadPdf = () => {
    const onDrop = useCallback((acceptedFiles) => {
        // Handle the uploaded files here
        console.log(acceptedFiles);
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: 'application/pdf'
    });

    return (
        <div className='wrapper'>
            <button className='back-button' onClick={() => navigate(-1)}>Back</button>
            
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
                <button type='button' className='upload-button' onClick={() => document.querySelector('input[type="file"]').click()}>
                    Upload PDF from Computer
                </button>
            </form>
        </div>
    );
}

export default UploadPdf;