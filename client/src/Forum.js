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
import ForumPostPreview from './ForumPostPreview';

const Forum = ({ setAuth }) => {

    const [name, setName] = useState('');
    const [picture, setPicture] = useState(null);
    const [title, setTitle] = useState('');
    const [post, setPost] = useState('');
    const [postIds, setPostIds] = useState([]);
    const [open, setOpen] = React.useState(false);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleCreate = () => {
        setOpen(false);
        createPost(title, post)
    };

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

    async function getPostIDs() {
        try {
            const response = await fetch('http://localhost:5000/forum/get-ids', {
                method: "GET",
                headers: {token: localStorage.token}
            });
            
            const parseRes = await response.json();
            setPostIds(parseRes.forum_post_ids);
        } catch (err) {
            console.error(err.message);
        }
    }

    async function createPost(title, post) {
        try {
            const response = await fetch('http://localhost:5000/forum/create-post', {
                method: "POST",
                headers: {
                    token: localStorage.token,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ 
                    title: title,
                    post: post 
                })
            });
            const parseRes = await response.json();
            setPostIds([parseRes.new_post_id.forum_post_id, ...postIds])
        } catch (err) {
            console.error(err.message);
        }
    }

    useEffect(() => {
        getDetails();
        getPhoto();
        getPostIDs();
    }, []);

    return(
        <div style={{backgroundColor: '#FaFaFa'}}>
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
                        onChange={e => setPost(e.target.value)}
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
                {postIds.map(uid => (
                    <ForumPostPreview id={uid} />
                ))}
            </div>
        </div>
    );
}

export default Forum;
