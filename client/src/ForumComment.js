import React, { useState, useEffect } from 'react';
import './ForumComment.css';
import { Avatar } from "@material-ui/core";

const ForumComment = (props) => {

    const [userPicture, setUserPicture] = useState(null);
    const [userName, setUserName] = useState("");

    async function getNameUser(data) {
        try {
          const response = await fetch(
            "http://localhost:5000/forum/get-name-user",
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
          setUserName(parseRes.profile_name);
          // setInfo(parseRes.profile_info);
        } catch (err) {
          console.error(err.message);
        }
    }

    async function getPhotoUser(data) {
        try {
          await fetch("http://localhost:5000/forum/get-comment-photo", {
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

    useEffect(() => {
        getNameUser(props.comment.user_id);
        getPhotoUser(props.comment.user_id);
    }, [props]);

    return(
        <div>
            <div className="forumComment">
                {/* <div className="forumPost__left"></div> */}
                <div className="forumComment__left">
                    <Avatar src={userPicture}/>
                </div>
                <div className="forumComment__center">
                    <h3>
                        {userName}
                    </h3>
                    <span className="forumComment__info">
                        {new Date(props.comment.time_stamp).toString()}
                    </span>
                    <pre>
                        {props.comment.forum_comment}
                    </pre>
                </div>
                {/* <div className="forumPost__right"></div> */}
            </div>
        </div>
    )
}

export default ForumComment;