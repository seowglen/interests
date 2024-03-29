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
import { Menu, MenuItem } from '@material-ui/core';
import Select from '@material-ui/core/Select';
import InputLabel from '@material-ui/core/InputLabel';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(theme => ({
    root: {
        paddingLeft: theme.spacing(14),
        paddingRight: theme.spacing(14)
    },
}));

const Forum = ({ setAuth }) => {

    const classes = useStyles();
    const [name, setName] = useState('');
    const [picture, setPicture] = useState(null);
    const [title, setTitle] = useState('');
    const [post, setPost] = useState('');
    const [postIds, setPostIds] = useState([]);
    const [open, setOpen] = React.useState(false);
    const [groupNames, setGroupNames] = useState([]);
    const [category, setCategory] = useState('');
    const [err, setErr] = useState(false);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleCreate = () => {
        setOpen(false);
        if (category == null) {
            setErr(true)
        } else {
            createPost(title, post, category)
            setErr(false)
        }
    };

    const logout = (e) => {
        e.preventDefault();
        localStorage.removeItem("token");
        setAuth(false);
    }

    function removePost(post_id) {
        setPostIds(postIds.filter(postId => postId !== post_id));
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
            setGroupNames(parseRes.group_names);
            setCategory(parseRes.group_names[0]);
        } catch (err) {
            console.error(err.message);
        }
    }

    async function createPost(title, post, group) {
        try {
            const response = await fetch('http://localhost:5000/forum/create-post', {
                method: "POST",
                headers: {
                    token: localStorage.token,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ 
                    title: title,
                    post: post,
                    group: group 
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
            {err ? 
                <div className={classes.root}>
                    <h3 style={{marginBottom: '0px', display: 'flex', justifyContent: 'center', backgroundColor: '#d75b60', color: 'white'}}>
                        ERROR: Please join a group first!
                    </h3>
                </div> 
                : 
                    null
            }
            <div className="createPost">
                <Grid container justify="center">
                    <Button variant="contained" style={{backgroundColor: '#4A406C', color: "white"}} onClick={handleClickOpen}>
                        Create New Post
                    </Button>
                </Grid>
                <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
                    <DialogTitle id="form-dialog-title">New Post</DialogTitle>
                    <DialogContent>
                    <DialogContentText>
                        Create a Forum Post either to introduce yourself, or talk about anything!
                    </DialogContentText>
                    <Select
                        native
                        value={category} 
                        onChange={e => setCategory(e.target.value)}
                    >
                        {groupNames.map(name => (
                            <option>{name}</option>
                        ))}
                    </Select>
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
                    <ForumPostPreview id={uid} removePost={removePost}/>
                ))}
            </div>
        </div>
    );
}

export default Forum;
