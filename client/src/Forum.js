import React, { useState, useEffect } from 'react';
import Header from './Header';
import './Forum.css';
import { Avatar } from '@material-ui/core';

const Forum = ({ setAuth }) => {

    const [name, setName] = useState('');
    const [picture, setPicture] = useState(null);

    const posts = [
        {
            id: 123,
            title: "Finding new friends to play mahjong!",
            user: "Bryan Lim",
            timestamp: "Sat Jan 30 2021 17:03:19 GMT+0800 (Singapore Standard Time)",
            comment_count: 10,
            view_count: 34
        },
        {
            id: 124,
            title: "Hello everyone!",
            user: "Glen Seow",
            timestamp: "Sat Jan 30 2021 17:03:19 GMT+0800 (Singapore Standard Time)",
            comment_count: 12,
            view_count: 34
        },
        {
            id: 125,
            title: "Looking forward to meeting new people!",
            user: "Austen Ng",
            timestamp: "Sat Jan 30 2021 17:03:19 GMT+0800 (Singapore Standard Time)",
            comment_count: 42,
            view_count: 34
        },
        {
            id: 126,
            title: "Finding people with the same interests as me! Yay!",
            user: "Shiva Guetta",
            timestamp: "Sat Jan 30 2021 17:03:19 GMT+0800 (Singapore Standard Time)",
            comment_count: 12,
            view_count: 100
        },
    ]

    const logout = (e) => {
        e.preventDefault();
        localStorage.removeItem("token");
        setAuth(false);
    }

    async function getDetails() {
        try {
            const response = await fetch('http://localhost:5000/forum/get-details', {
                method: "GET",
                headers: {token: localStorage.token}
            });
            
            const parseRes = await response.json();
            setName(parseRes.profile_name);
            // setPicture(parseRes.profile_picture);
            // setInfo(parseRes.profile_info);
        } catch (err) {
            console.error(err.message);
        }
    }

    async function getPhoto() {
        try {
            await fetch('http://localhost:5000/forum/get-photo', {
                method: "GET",
                headers: {token: localStorage.token}
            }).then(response => {
                response.blob().then(blobResponse => {
                    setPicture(URL.createObjectURL(blobResponse));
                });
            });
        } catch (err) {
            console.error(err.message);
        }
    }

    useEffect(() => {
        getDetails();
        getPhoto();
    }, []);

    return(
        <div>
            <Header displayName={name} picture={picture} setAuth={setAuth} logout={logout} currentPage='forum'/>
            <div className="forumPost__group">
                {posts.map(post => (
                    <div className="forumPost">
                        {/* <div className="forumPost__left"></div> */}
                        <div className="forumPost__left">
                            <Avatar />
                        </div>
                        <div className="forumPost__center">
                            <h3>{post.title}</h3>
                            <span className="forumPost__info">
                                submitted by {post.user}, {post.timestamp}
                            </span>
                            <p>
                                {post.comment_count} comments, {post.view_count} views
                            </p>
                        </div>
                        {/* <div className="forumPost__right"></div> */}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Forum;
