import React from 'react';
import './Post.css';
import { Avatar } from '@material-ui/core';
import ThumbUpIcon from '@material-ui/icons/ThumbUp';
import ChatBubbleOutlineIcon from '@material-ui/icons/ChatBubbleOutline';

const Post = () => {
    return (
        <div className="post">
            <div className="post__top">
                <Avatar className="post__avatar"/>
                <div className="post__topInfo">
                    <h3>username</h3>
                    <p>Timestamp...</p>
                </div>
            </div>
            <div className="post__bottom">
                <p>This is my message...</p>
            </div>
            <div className="post__options">
                <div className="post__option">
                    <ThumbUpIcon />
                    <p>Like</p>
                </div>
                <div className="post__option">
                    <ChatBubbleOutlineIcon />
                    <p>Comment</p>
                </div>
            </div>
        </div>
    );
}

export default Post;