import React, { useState, useEffect } from 'react';
import { Avatar, Grid } from '@material-ui/core';
import './Forum.css';
import { Link } from 'react-router-dom';
import DeleteIcon from '@material-ui/icons/Delete';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

const useStyles = makeStyles((theme) => ({
    small: {
      width: theme.spacing(2.5),
      height: theme.spacing(2.5),
      color: '#A9A9A9',
      cursor: "pointer",
      "&:hover": { color: "#808080" },
    }
}));

const ForumPostPreview = ({ id, removePost }) => {

    const classes = useStyles();
    const [postId, setPostId] = useState('');
    const [user, setUser] = useState('');
    const [title, setTitle] = useState('');
    const [picture, setPicture] = useState(null);
    const [commentCount, setCommentCount] = useState('');
    const [timestamp, setTimestamp] = useState('');
    const [viewCount, setViewCount] = useState('');
    const [groupName, setGroupName] = useState('');
    const [ownself, setOwnself] = useState(false);
    const [openDelete, setOpenDelete] = useState(false);

    const handleClickOpenDelete = () => {
        setOpenDelete(true);
    }

    const handleCloseDelete = () => {
        setOpenDelete(false);
    };

    const handleDelete = () => {
        deletePost(id);
        setOpenDelete(false);
    }

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
            setGroupName(parseRes.group_name);
            setOwnself(parseRes.ownself);
            // setInfo(parseRes.profile_info);
        } catch (err) {
            console.error(err.message);
        }
    }

    async function deletePost(post_id) {
        try {
            const response = await fetch(
              "http://localhost:5000/forum/delete-post",
              {
                method: "POST",
                headers: {
                  token: localStorage.token,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ 
                    id: post_id 
                }),
              }
            );
      
            const parseRes = await response.json();
            removePost(parseRes.forum_post_id);
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
                <div style={{display: "flex", justifyContent: "space-between"}}>
                    <h3 style={{marginBottom: "5px"}}>
                        <Link to={{
                            pathname: '/forumPost',
                                idProps: {
                                    id: postId
                                }
                            }} style={{ textDecoration: 'none'}}>
                            {title}
                        </Link>
                    </h3>
                    {ownself &&
                        <DeleteIcon className={classes.small} style={{marginTop: "15px"}} onClick={handleClickOpenDelete}/>
                    }
                    <Dialog open={openDelete} onClose={handleCloseDelete} aria-labelledby="form-dialog-title" fullWidth maxWidth="sm">
                        <DialogTitle id="form-dialog-title">Are you sure you want to delete this post?</DialogTitle>
                            <DialogContent>
                                <DialogContentText>
                                    All comments to this post will be deleted as well.
                                </DialogContentText>                            
                            </DialogContent>
                            <DialogActions>
                                <Button onClick={handleCloseDelete} color="primary">
                                    Cancel
                                </Button>
                                <Button onClick={handleDelete} color="primary">
                                    Delete
                                </Button>
                        </DialogActions>
                    </Dialog>
                </div>
                <span className="forumPost__info">
                    submitted by {user} ({groupName}), {timestamp}
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