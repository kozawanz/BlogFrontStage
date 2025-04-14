// src/components/CreatePost.js
import React, {useState} from 'react';
import axios from 'axios';
import {BaseUrl} from "../constants";
import "./CreatePost.css";

const CreatePost = () => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [status, setStatus] = useState('')


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
alert(data);
        axios.request(config)
            .then((response) => {
                console.log(JSON.stringify(response.data));
                alert("Post created successfully");
                setTitle('');
                setContent('');
            })
            .catch((error) => {
                console.log(error);
                alert(error.response.data.error);
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
                            onChange={(e) => setStatus(e.target.value)}
                        >
                            <option value="published">Published</option>
                            <option value="private">Private</option>
                        </select>
                        <button type="submit">Create Post</button>
                    </div>
                </form>
            </div>
        </div>

    );
};

export default CreatePost;
