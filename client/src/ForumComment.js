import React, { useState, useEffect } from 'react';
import './ForumComment.css';
import { Avatar } from "@material-ui/core";
import { Divider } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

const ForumComment = (props) => {

    const [open, setOpen] = React.useState(false);
    const [userPicture, setUserPicture] = useState(null);
    const [userName, setUserName] = useState("");
    const [reply, setReply] = useState("");
    const [numReplies, setNumReplies] = useState(0);
    const [ownself, setOwnself] = useState(false);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleCreate = () => {
        setOpen(false);
        createReply(props.comment.forum_post_id, reply, props.comment.forum_comment_id);
    };

    function getNumberReplies(comments, current_comment_id) {
        let replyCount = 0;
        comments.map((comment) => {
            if (comment.parent_comment_id === current_comment_id) {
                replyCount = replyCount + 1;
            }
        })
        setNumReplies(replyCount);
    }

    async function createReply(post_id, data, comment_id) {
        try {
            const response = await fetch(
              "http://localhost:5000/forum/create-reply",
              {
                method: "POST",
                headers: {
                  token: localStorage.token,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ 
                    post_id: post_id,
                    reply: data,
                    comment_id: comment_id 
                }),
              }
            );
      
            const parseRes = await response.json();
            setReply("");
            props.updateComment(parseRes.new_comment_id);
        } catch (err) {
            console.error(err.message);
        }
    }

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
          setOwnself(parseRes.ownself);
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
        getNumberReplies(props.comments, props.comment.forum_comment_id);
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
                    <div className="forum__width">
                        <pre>
                            {props.comment.forum_comment}
                        </pre>
                    </div>
                    <div className="forum__reply">
                        {ownself &&
                            <p style={{cursor: "pointer"}} onClick={handleClickOpen}>
                                EDIT
                            </p>
                        }
                        {ownself &&    
                            <p style={{cursor: "pointer", marginLeft: "30px"}} onClick={handleClickOpen}>
                                DELETE
                            </p>
                        }
                        <p style={ownself ? {cursor: "pointer", marginLeft: "30px"} : {cursor: "pointer"}} onClick={handleClickOpen}>
                            REPLY
                        </p>
                        {numReplies > 0 &&
                            <p style={{cursor: "pointer", marginLeft: "30px", color: "#E27B66"}} onClick={() => props.handleToggle(props.comment.forum_comment_id)}>
                                {numReplies} {numReplies === 1 ? 'REPLY' : 'REPLIES'}
                            </p>
                        }
                    </div>
                    <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title" fullWidth maxWidth="sm">
                        <DialogTitle id="form-dialog-title">Create Reply</DialogTitle>
                        <DialogContent>
                            <DialogContentText>
                                Reply to this forum comment here.
                            </DialogContentText>
                            <br/>
                            <TextField
                                autoFocus
                                margin="dense"
                                id="name"
                                label="Reply"
                                type="text" 
                                fullWidth
                                multiline
                                rows={5}
                                rowsMax={5}
                                onChange={e => setReply(e.target.value)}
                            />
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleClose} color="primary">
                                Cancel
                            </Button>
                            <Button onClick={handleCreate} color="primary">
                                Create
                            </Button>
                        </DialogActions>
                    </Dialog>
                </div>
                {/* <div className="forumPost__right"></div> */}
            </div>
        </div>
    )
}

export default ForumComment;