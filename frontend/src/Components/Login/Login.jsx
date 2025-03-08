import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CiCircleInfo } from "react-icons/ci";
import About from '../About/About';
import './Login.css';

// React Icons
import { FaUser, FaLock, FaGithub } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { auth, googleProvider, githubProvider } from '../../firebaseConfig';
import { signInWithPopup, signInWithEmailAndPassword } from 'firebase/auth';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [showAbout, setShowAbout] = useState(false);

    const handleEmailLogin = async (e) => {
        e.preventDefault();
        try {
            await signInWithEmailAndPassword(auth, email, password);
            alert('Logged in successfully');
            setErrorMessage('');
        } catch (error) {
            console.error('Error logging in with email:', error);
            switch (error.code) {
                case 'auth/user-not-found':
                    setErrorMessage('The email address is not registered.');
                    break;
                case 'auth/wrong-password':
                    setErrorMessage('The password you entered is incorrect.');
                    break;
                case 'auth/invalid-email':
                    setErrorMessage('The email address is not valid.');
                    break;
                case 'auth/invalid-credential':
                    setErrorMessage('The credential is invalid or expired.');
                    break;
                default:
                    setErrorMessage('An unexpected error occurred. Please try again.');
            }
        }
    };

    const handleGoogleLogin = async () => {
        try {
            await signInWithPopup(auth, googleProvider);
            alert('Logged in with Google');
        } catch (error) {
            console.error('Error logging in with Google:', error);
            setErrorMessage('An error occurred while logging in with Google. Please try again.');
        }
    };

    const handleGithubLogin = async () => {
        try {
            await signInWithPopup(auth, githubProvider);
            alert('Logged in with GitHub');
        } catch (error) {
            console.error('Error logging in with GitHub:', error);
            setErrorMessage('An error occurred while logging in with GitHub. Please try again.');
        }
    };

    return (
        <div className='wrapper'>
            <form onSubmit={handleEmailLogin}>
                <div className='login-screen-header'>Videofy</div>
                <CiCircleInfo 
                        onClick={() => setShowAbout(true)} 
                        className='info-icon'/>

                <div className='input-box'>
                    <input type='text' placeholder='Email' value={email} onChange={(e) => setEmail(e.target.value)} required />
                    <FaUser className='icon'/>
                </div>
                <div className='input-box'>
                    <input type='password' placeholder='Password' value={password} onChange={(e) => setPassword(e.target.value)} required />
                    <FaLock className='icon'/>
                </div>

                <div className='remember-me'>
                    <label><input type='checkbox' />Remember me</label>
                </div>

                <button type='submit'>Login</button>

                <div className='separator'>
                    <span>or</span>
                </div>

                <button type='button' className='google-button' onClick={handleGoogleLogin}>
                    <FcGoogle className='other-icon' /> Continue with Google
                </button>

                <button type='button' className='google-button' onClick={handleGithubLogin}>
                    <FaGithub className='other-icon' /> Continue with GitHub
                </button>

                <div className='register-link'>
                    <p>Don't have an account? <Link to="/create-account">Register</Link></p>
                </div>

                {errorMessage && <p className='error-message'>{errorMessage}</p>}
            </form>

            {showAbout && <About onClose={() => setShowAbout(false)} />}
        </div>
    );
}

export default Login;