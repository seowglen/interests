import React, { useState, useEffect } from 'react';
import './Post.css';
import { Avatar } from '@material-ui/core';
import ThumbUpIcon from '@material-ui/icons/ThumbUp';
import ChatBubbleOutlineIcon from '@material-ui/icons/ChatBubbleOutline';
import Comment from './Comment';


const Post = (props) => {

    const [input, setInput] = useState('');
    const [comments, setComments] = useState([]);
    const [userName, setUserName] = useState('');
    const [userPicture, setUserPicture] = useState(null);
    const [userProfileID, setUserProfileID] = useState('');
    const [timeStamp, setTimeStamp] = useState('');
    const [post, setPost] = useState('');

    async function getName(data) {
        try {
            const response = await fetch('http://localhost:5000/post/get-name', {
                method: "POST",
                headers: {
                    token: localStorage.token,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ id: data })
            });
            
            const parseRes = await response.json();
            setUserName(parseRes.profile_name);
            // setInfo(parseRes.profile_info);
        } catch (err) {
            console.error(err.message);
        }
    }

    async function getPhoto(data) {
        try {
            await fetch('http://localhost:5000/post/get-photo', {
                method: "POST",
                headers: {
                    token: localStorage.token,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ id: data })
            }).then(response => {
                response.blob().then(blobResponse => {
                    setUserPicture(URL.createObjectURL(blobResponse));
                });
            });
        } catch (err) {
            console.error(err.message);
        }
    }

    async function getPost(data) {
        try {
            const response = await fetch('http://localhost:5000/post/get-post', {
                method: "POST",
                headers: {
                    token: localStorage.token,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ id: data })
            });
            
            const parseRes = await response.json();
            setTimeStamp(parseRes.time_stamp);
            setPost(parseRes.post);
            setUserProfileID(parseRes.profile_id);
            setComments(parseRes.comment_ids);
            // setInfo(parseRes.profile_info);
        } catch (err) {
            console.error(err.message);
        }
    }

    useEffect(() => {
        getName(props.id);
        getPhoto(props.id);
        getPost(props.id);
    }, [props.id]);

    function handleSubmit(e) {
        e.preventDefault();
        console.log(input);
        // setComments([...comments, input]);
        setInput('');
    }

    function handleCommentClick() {
        if (document.getElementById(props.id).style.display === "block") {
            document.getElementById(props.id).style.display = "none";
        } else {
            document.getElementById(props.id).style.display = "block";
        }
    }

    return (
        <div className="post">
            <div className="post__top">
                <Avatar src={userPicture} className="post__avatar"/>
                <div className="post__topInfo">
                    <h3>{userName}</h3>
                    <p>{timeStamp}</p>
                </div>
            </div>
            <div className="post__bottom">
                <p>{post}</p>
            </div>
            <div className="post__options">
                <div className="post__option">
                    <ThumbUpIcon />
                    <p>Like</p>
                </div>
                <div className="post__option" onClick={handleCommentClick}>
                    <ChatBubbleOutlineIcon />
                    <p>Comment</p>
                </div>
            </div>
            <div className="post__comments" id={props.id} style={{display: "none"}}>
                {comments.map(uid => <Comment id={uid}/>)}
                <div className="commentSender">
                    <div className="inviteSender__top">
                        <Avatar src={props.picture}/>
                        <form>
                            <textarea
                                value={input}
                                onChange={e => setInput(e.target.value)} 
                                className="inviteSender__input" 
                                rows="1" 
                                cols="50" 
                                placeholder='Write a comment...'
                            ></textarea>
                            <button onClick={handleSubmit} type="submit">Submit</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Post;