import React, { useState, useEffect } from 'react';
import Header from './Header';
import './Forum.css';
import { Avatar, Grid } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

const Forum = ({ setAuth }) => {

    const [name, setName] = useState('');
    const [picture, setPicture] = useState(null);
    const [title, setTitle] = useState('');

    const [open, setOpen] = React.useState(false);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleCreate = () => {
        setOpen(false);
        setPosts([
            {
                id: 123,
                title: title,
                user: "Glen Seow",
                timestamp: "Sat Jan 30 2021 17:03:19 GMT+0800 (Singapore Standard Time)",
                comment_count: 0,
                view_count: 0
            },
            ...posts
        ])
    };

    const [posts, setPosts] = useState([
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
    ])

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
            <div className="createPost">
                <Grid container justify="center">
                    <Button variant="outlined" color="primary" onClick={handleClickOpen}>
                        Create New Post
                    </Button>
                </Grid>
                <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
                    <DialogTitle id="form-dialog-title">New Post</DialogTitle>
                    <DialogContent>
                    <DialogContentText>
                        Create a Forum Post either to introduce yourself, or talk about anything!
                    </DialogContentText>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="name"
                        label="Title"
                        type="text"
                        fullWidth
                        onChange={e => setTitle(e.target.value)}
                    />
                    <br/>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="name"
                        label="Post"
                        type="text"
                        fullWidth
                        multiline
                        rows={4}
                        rowsMax={4}
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
                                {post.view_count} views, {post.comment_count} comments
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
