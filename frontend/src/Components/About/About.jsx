import React from 'react';
import './About.css';

const About = ({ onClose }) => {
    return (
        <div className='about-overlay'>
            <div className='about-content'>
                <h2>About Videofy</h2>
                <p>Videofy instantly transforms your boring textbooks / slideshow PDFs into a brainrot video with the click of a button!</p>
                <button onClick={onClose}>Close</button>
            </div>
        </div>
    );
};

export default About; 