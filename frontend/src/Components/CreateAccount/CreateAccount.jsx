import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUser, FaLock } from "react-icons/fa";
import { auth } from '../../firebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import './CreateAccount.css';

const CreateAccount = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();

    const handleCreateAccount = async (e) => {
        e.preventDefault();
        if (password.length < 6) {
            setErrorMessage('Password must be at least 6 characters long');
            return;
        }
        if (password !== confirmPassword) {
            setErrorMessage('Passwords do not match');
            return;
        }
        try {
            await createUserWithEmailAndPassword(auth, email, password);    
            setErrorMessage('');
            navigate('/');
        } catch (error) {
            console.error('Error creating account:', error);
            if (error.code === 'auth/email-already-in-use') {
                setErrorMessage('Email already in use');
            } else {
                setErrorMessage(error.message);
            }
        }
    };

    const handleConfirmPasswordChange = (e) => {
        const value = e.target.value;
        setConfirmPassword(value);
        if (password === value) {
            setErrorMessage('');
        } else {
            setErrorMessage('Passwords do not match');
        }
    };

    return (
        <div className='wrapper'>
            <form onSubmit={handleCreateAccount}>
                <h1>Videofy</h1>

                <div className='input-box'>
                    <input type='text' placeholder='Email' value={email} onChange={(e) => setEmail(e.target.value)} required />
                    <FaUser className='icon'/>
                </div>

                <div className='input-box'>
                    <input type='password' placeholder='Password' value={password} onChange={(e) => setPassword(e.target.value)} required />
                    <FaLock className='icon'/>
                </div>

                <div className='input-box'>
                    <input type='password' placeholder='Re-type Password' value={confirmPassword} onChange={handleConfirmPasswordChange} required />
                    <FaLock className='icon'/>
                </div>

                <button type='submit'>Create Account</button>

                <div className='already-registered-link'>
                    <p>Already have an account? <Link to="/">Login</Link></p>
                </div>

                {errorMessage && <p className='error-message'>{errorMessage}</p>}
            </form>
        </div>
    );
}

export default CreateAccount;