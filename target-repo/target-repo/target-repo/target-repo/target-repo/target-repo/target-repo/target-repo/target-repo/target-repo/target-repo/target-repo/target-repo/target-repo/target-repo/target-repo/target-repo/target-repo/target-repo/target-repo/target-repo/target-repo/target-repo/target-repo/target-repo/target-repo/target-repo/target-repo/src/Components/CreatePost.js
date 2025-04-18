// src/components/CreatePost.js
import React, {useState} from 'react';
import axios from 'axios';
import {BaseUrl} from "../constants";
import "./CreatePost.css";

const CreatePost = () => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [status, setStatus] = useState('published');
    const [Err, setErr] = useState('');

    function handleStatusChange(event) {
        setStatus(event.target.value);
    }

    function handleSubmit(event) {
        event.preventDefault();
        let data = JSON.stringify({
            "title": title,
            "content": content,
            "status": status
        });

        let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: BaseUrl +'/api/posts/',
            headers: {
                'Authorization': 'Token ' + localStorage.getItem("Token"),
                'Content-Type': 'application/json'
            },
            data: data
        };

        axios.request(config)
            .then((response) => {
                console.log(JSON.stringify(response.data));
                setErr("✅ Post Created Successfully");
                setTitle('');
                setContent('');
            })
            .catch((error) => {
                console.log(error);
                setErr(error.response.data.error);
            });
    }

    return (
        <div className="form-container">
            <div className="form-card">
                <h1>Create Post</h1>
                <form onSubmit={(e) => handleSubmit(e)}>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Title"
                        required
                    />
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Content"
                        rows={6}
                        required
                    />
                    <div className="form-footer">
                        <select
                            value={status}
                            onChange={handleStatusChange}
                        >
                            <option value="published">Published</option>
                            <option value="draft">Draft</option>
                        </select>
                        <button type="submit">Create Post</button>

                    </div>
                    <p>{Err}</p>
                </form>

            </div>
        </div>

    );
};

export default CreatePost;
