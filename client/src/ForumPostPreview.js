import React, { useState, useEffect } from 'react';
import { Avatar, Grid } from '@material-ui/core';
import './Forum.css';

const ForumPostPreview = ({ id }) => {

    const [postId, setPostId] = useState('');
    const [user, setUser] = useState('');
    const [title, setTitle] = useState('');
    const [picture, setPicture] = useState(null);
    const [commentCount, setCommentCount] = useState('');
    const [timestamp, setTimestamp] = useState('');
    const [viewCount, setViewCount] = useState('');

    async function getPhoto(data) {
        try {
            await fetch('http://localhost:5000/forum/get-forum-photo', {
                method: "POST",
                headers: {
                    token: localStorage.token,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ id: data })
            }).then(response => {
                response.blob().then(blobResponse => {
                    setPicture(URL.createObjectURL(blobResponse));
                });
            });
        } catch (err) {
            console.error(err.message);
        }
    }

    async function getPostPreview(data) {
        try {
            const response = await fetch('http://localhost:5000/forum/get-forum-details', {
                method: "POST",
                headers: {
                    token: localStorage.token,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ id: data })
            });
            
            const parseRes = await response.json();
            const date = new Date(parseRes.time_stamp).toString();
            setTimestamp(date);
            setCommentCount(parseRes.comment_count);
            setViewCount(parseRes.view_count);
            setUser(parseRes.profile_name);
            setTitle(parseRes.forum_title);
            // setInfo(parseRes.profile_info);
        } catch (err) {
            console.error(err.message);
        }
    }

    useEffect(() => {
        setPostId(id);
        getPhoto(id);
        getPostPreview(id);
    }, [id]);

    return(
        <div className="forumPost">
            {/* <div className="forumPost__left"></div> */}
            <div className="forumPost__left">
                <Avatar src={picture}/>
            </div>
            <div className="forumPost__center">
                <h3>{title}</h3>
                <span className="forumPost__info">
                    submitted by {user}, {timestamp}
                </span>
                <p>
                    {viewCount} views, {commentCount} comments
                </p>
            </div>
            {/* <div className="forumPost__right"></div> */}
        </div>
    )
}

export default ForumPostPreview;