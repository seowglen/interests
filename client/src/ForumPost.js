import React, { useState, useEffect } from "react";
import Header from "./Header";
import "./ForumPost.css";
import { Avatar } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { Button } from "@material-ui/core";
import ForumComments from './ForumComments';

const ForumPost = (props) => {
    // props.location.idProps.id returns id in string
    const [id, setId] = useState('');
    const [name, setName] = useState('');
    const [picture, setPicture] = useState(null);
    const [user, setUser] = useState('');
    const [title, setTitle] = useState('');
    const [post, setPost] = useState('');
    const [userPicture, setUserPicture] = useState(null);
    const [timestamp, setTimestamp] = useState('');
    const [commentIds, setCommentIds] = useState([]);

    const logout = (e) => {
        e.preventDefault();
        localStorage.removeItem("token");
        props.setAuth(false);
    };

    async function getDetails() {
        try {
          const response = await fetch("http://localhost:5000/profile/", {
            method: "GET",
            headers: { token: localStorage.token },
          });
    
          const parseRes = await response.json();
          setName(parseRes.profile_name);
          // setInfo(parseRes.profile_info);
        } catch (err) {
          console.error(err.message);
        }
      }
    
    async function getPhoto() {
        try {
          await fetch("http://localhost:5000/profile/get-photo", {
            method: "GET",
            headers: { token: localStorage.token },
          }).then((response) => {
            response.blob().then((blobResponse) => {
              setPicture(URL.createObjectURL(blobResponse));
            });
          });
        } catch (err) {
          console.error(err.message);
        }
      }

    async function getUserPost(data) {
        try {
          const response = await fetch(
            "http://localhost:5000/forum/get-post-details",
            {
              method: "POST",
              headers: {
                token: localStorage.token,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ id: data }),
            }
          );
    
          const parseRes = await response.json();
          const date = new Date(parseRes.time_stamp).toString();
          setTimestamp(date);
          setUser(parseRes.profile_name);
          setTitle(parseRes.forum_title);
          setPost(parseRes.forum_post);
          setCommentIds(parseRes.comment_ids);
          // setInfo(parseRes.profile_info);
        } catch (err) {
          console.error(err.message);
        }
    }

    async function getUserPhoto(data) {
        try {
          await fetch("http://localhost:5000/forum/get-forum-photo", {
            method: "POST",
            headers: {
              token: localStorage.token,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ id: data }),
          }).then((response) => {
            response.blob().then((blobResponse) => {
              setUserPicture(URL.createObjectURL(blobResponse));
            });
          });
        } catch (err) {
          console.error(err.message);
        }
    }

    function updateComment(newComment) {
      setCommentIds(commentIds.concat(newComment));
    }

    useEffect(() => {
        getDetails();
        getPhoto();
        setId(props.location.idProps.id);
        getUserPost(props.location.idProps.id);
        getUserPhoto(props.location.idProps.id);
      }, [props.location.idProps.id]);
    
    return(
        <div>
            <Header
                displayName={name}
                picture={picture}
                setAuth={props.setAuth}
                logout={logout}
                currentPage="forum"
            />
            <div className="forumPost">
                {/* <div className="forumPost__left"></div> */}
                <div className="forumPost__left">
                    <Avatar src={userPicture}/>
                </div>
                <div className="forumPost__center">
                    <h3>
                        {title}
                    </h3>
                    <span className="forumPost__info">
                        submitted by {user}, {timestamp}
                    </span>
                    <pre>
                        {post}
                    </pre>
                </div>
                {/* <div className="forumPost__right"></div> */}
            </div>

            <ForumComments id={id} comments={commentIds} updateComment={updateComment}/>
        </div>
    )
}

export default ForumPost;
