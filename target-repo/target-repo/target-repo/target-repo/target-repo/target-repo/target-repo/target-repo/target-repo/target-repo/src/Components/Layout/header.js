import React from 'react';
import { Link } from 'react-router-dom';
import './header.css';

const Header: React.FC = () => {
  return (
    <header className="header">
      <div className="header-container">
        <nav className="nav-left">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/posts" className="nav-link">Posts</Link>
        </nav>
        <div className="nav-right">
          <Link to="/login" className="btn btn-login">Login</Link>
        </div>
      </div>
    </header>
  );
};

export {Header};