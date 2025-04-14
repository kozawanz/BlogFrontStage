import React from 'react';
import { Link } from 'react-router-dom';


const Home: React.FC = () => {
    return (
        <div className="home-container">
            <div className="hero-section">
                <h1>Welcome to AIS - BuzzFeed!</h1>
                <p>Your personal notes and todo management application</p>
                <div className="hero-buttons">
                    <Link to="/Register" className="btn" style={{ marginLeft: '10px' }}>Register</Link>
                </div>
            </div>
        </div>
    );
};

export { Home };
