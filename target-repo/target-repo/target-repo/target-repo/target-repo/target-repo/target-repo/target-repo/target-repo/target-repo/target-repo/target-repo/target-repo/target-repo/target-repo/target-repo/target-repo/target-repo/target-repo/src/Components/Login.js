import React, {useEffect, useState} from 'react';
import axios from "axios";
import {BaseUrl} from "../constants";
import "../App.css";

function Login(props) {
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [Err, setErr] = useState("")

    useEffect(() => {
        if(localStorage.getItem("Token") !== null) {
            window.location.href = "/";
        }
    }, []);


    function login(event) {
        event.preventDefault();
        let data = JSON.stringify({
          "username": username,
          "password": password
        });

        let config = {
          method: 'post',
          maxBodyLength: Infinity,
          url: BaseUrl + '/api/login/',
          headers: {
            'Content-Type': 'application/json'
          },
          data : data
        };

        axios.request(config)
        .then((response) => {
          console.log(JSON.stringify(response.data));
          localStorage.setItem("Token", response.data.token);
          setErr("Login Successful");
          window.location.href = "/";
        })
        .catch((error) => {
          console.log(error.response.data.error);
          setErr(error.response.data.error);
        });
    }

    return (
            <div className="form-container">
              <div className="form-card">
                <h1>Login</h1>
                <form onSubmit={login}>
                    <div className="form-group">
                        <label htmlFor="username">Username</label>
                        <input
                          type="username"
                          id="username"
                          name="username"
                          placeholder="Username"
                          onChange={(e) => setUsername(e.target.value)}
                          required
                        />
                      </div>
                  <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      placeholder="Password"
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <button type="submit" className="submit-btn">
                    Login
                  </button>
                  <p>{Err}</p>
                </form>
              </div>
            </div>
    );
}

export default Login;