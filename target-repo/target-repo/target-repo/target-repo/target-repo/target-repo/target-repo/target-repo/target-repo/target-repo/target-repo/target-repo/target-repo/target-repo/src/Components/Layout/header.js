import React, {useEffect, useState} from 'react';
import { Link } from 'react-router-dom';
import './header.css';

const Header: React.FC = () => {
  const [token, setToken] = useState(null);

  useEffect(() => {
    setToken(localStorage.getItem("Token"));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("Token");
    setToken(null);
    window.location.href = "/login";
  };
  return (
    <header className="header">
      <div className="header-container">
        <nav className="nav-left">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/posts" className="nav-link">Posts</Link>
        </nav>
        {token ? (
                 <>
                    <li className="nav-right"><a href="/login" onClick={(e) => { e.preventDefault(); handleLogout(); }} className="btn btn-login">Logout</a></li>
                </>
              ) : (
                <>
                  <li className="nav-right"><Link to="/register" className="btn btn-login">Register</Link>&nbsp;<Link to="/login" className="btn btn-login">Login</Link></li>
                </>
        )}
      </div>
    </header>
  );
};

export {Header};