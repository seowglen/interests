import React, { useState, useEffect } from 'react';
import './Comment.css';
import { Avatar } from '@material-ui/core';
import { Link } from 'react-router-dom';
import ThumbUpIcon from '@material-ui/icons/ThumbUp';
import ChatBubbleOutlineIcon from '@material-ui/icons/ChatBubbleOutline';


const Comment = (props) => {

    const [name, setName] = useState('');
    const [picture, setPicture] = useState(null);
    const [comment, setComment] = useState('');
    const [timeStamp, setTimeStamp] = useState('');
    const [userProfileID, setUserProfileID] = useState('');

    async function getPhoto(data) {
        try {
            await fetch('http://localhost:5000/comment/get-photo', {
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

    async function getComment(data) {
        try {
            const response = await fetch('http://localhost:5000/comment/get-comment', {
                method: "POST",
                headers: {
                    token: localStorage.token,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ id: data })
            });
            
            const parseRes = await response.json();
            const date = new Date(parseRes.time_stamp).toString();
            setTimeStamp(date);
            setComment(parseRes.comment);
            setUserProfileID(parseRes.profile_id);
            setName(parseRes.profile_name);
            // setInfo(parseRes.profile_info);
        } catch (err) {
            console.error(err.message);
        }
    }

    useEffect(() => {
        getPhoto(props.id);
        getComment(props.id);
    }, [props.id]);

    return (
        <div>
            <div className="comment">
                    <div className="inviteSender__top">
                        <Avatar src={picture}/>
                        <div className="inviteSender__input">
                            <div className="comment__bubble">
                                <Link to={{
                                    pathname: '/otherProfile',
                                    idProps: {
                                        id: userProfileID
                                    }
                                }} style={{ textDecoration: 'none', color: 'black', fontWeight: 'bold'}}>
                                    {name}
                                </Link>
                                <h4>{timeStamp}</h4>
                                <pre>{comment}</pre>
                            </div>
                        </div>
                    </div>
                </div>
        </div>
    );
}

export default Comment;