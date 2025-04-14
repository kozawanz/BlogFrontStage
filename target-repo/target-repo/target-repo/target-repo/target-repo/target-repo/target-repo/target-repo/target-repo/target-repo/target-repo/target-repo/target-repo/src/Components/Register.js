import React, { useState } from 'react';
import './Register.css';
import axios from 'axios';
import {BaseUrl} from "../constants";


const Register: React.FC = () => {
  const [Err, setErr] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [first_name, setFirstName] = useState("");
  const [last_name, setLastName] = useState("");


  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const handleFirstNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFirstName(e.target.value);
  };

  const handleLastNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLastName(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        BaseUrl +'/api/register/',
        {
          username: username,
          email: email,
          password: password,
          first_name: first_name,
          last_name: last_name
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      console.log(response.data);
      setErr('✅ Registration successful!');
    } catch (error) {

    if (error.response) {
      console.error('Error response:', error.response.data);
      setErr(`❌ Server error ${error.response.status}: ${JSON.stringify(error.response.data)}`);
    } else if (error.request) {
      console.error('No response received:', error.request);
      setErr('❌ No response from server.');
    } else {
      console.error('Unexpected error:', error.message);
      setErr(`❌ Unexpected error: ${error.message}`);
    }
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <h1>Create an account</h1>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              placeholder="Insert a username"
              id="username"
              name="username"
              onChange={handleUsernameChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Create a password"
              onChange={handlePasswordChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Insert an email"
              onChange={handleEmailChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="first_name">First Name</label>
            <input
              type="text"
              id="first_name"
              name="first_name"
              placeholder="Insert your first name"
              onChange={handleFirstNameChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="last_name">Last Name</label>
            <input
              type="text"
              id="last_name"
              name="last_name"
              placeholder="Insert your last name"
              onChange={handleLastNameChange}
              required
            />
          </div>

          <button type="submit" className="submit-btn">
            Create Account
          </button>
          <p>{Err}</p>
        </form>
      </div>
    </div>
  );
};

export { Register };
