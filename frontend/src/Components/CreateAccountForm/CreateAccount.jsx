import React from 'react';
import { Link } from 'react-router-dom';
import './CreateAccount.css';

// React Icons
import { FaUser, FaLock } from "react-icons/fa";


const CreateAccount = () => {
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

                <div className='input-box'>
                    <input type='password' placeholder='Re-type Password' required />
                    <FaLock className='icon'/>
                </div>

                <button type='submit'>Create Account</button>

                <div className='already-registered-link'>
                    <p>Already have an account? <Link to="/">Login</Link></p>
                </div>
            </form>
        </div>
    );
}

export default CreateAccount;