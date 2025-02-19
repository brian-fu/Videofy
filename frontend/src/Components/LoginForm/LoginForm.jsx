import React from 'react';
import { Link } from 'react-router-dom';
import './LoginForm.css';

// React Icons
import { FaUser, FaLock } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";


const LoginForm = () => {
    return (
        <div className='wrapper'>
            <form action=''>
                <h1>Videofy</h1>

                <div className='input-box'>
                    <input type='text' placeholder='Email' required />
                    <FaUser className='icon'/>
                </div>

                <div className='input-box'>
                    <input type='password' placeholder='Password' required />
                    <FaLock className='icon'/>
                </div>

                <div className='remember-me'>
                    <label><input type='checkbox' />Remember me</label>
                </div>

                <button type='submit'>Login</button>

                <div className='separator'>
                    <span>or</span>
                </div>

                <button type='button' className='google-button'>
                    <FcGoogle className='google-icon' /> Continue with Google
                </button>

                <div className='register-link'>
                    <p>Don't have an account? <Link to="/create-account">Register</Link></p>
                </div>
            </form>
        </div>
    );
}

export default LoginForm;