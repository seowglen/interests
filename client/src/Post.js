import React, { useState, useEffect } from 'react';
import './Post.css';
import { Avatar } from '@material-ui/core';
import ThumbUpIcon from '@material-ui/icons/ThumbUp';
import ChatBubbleOutlineIcon from '@material-ui/icons/ChatBubbleOutline';
import Comment from './Comment';
import { Link } from 'react-router-dom';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
    small: {
      width: theme.spacing(2.5),
      height: theme.spacing(2.5),
      color: '#A9A9A9',
      cursor: "pointer",
      "&:hover": { color: "#808080" },
    },
    edit: {
        paddingLeft: '25px',
        paddingRight: '25px'
    }
}));

const Post = (props) => {

    const classes = useStyles();

    const [input, setInput] = useState('');
    const [comments, setComments] = useState([]);
    const [likes, setLikes] = useState([]);
    const [userName, setUserName] = useState('');
    const [userPicture, setUserPicture] = useState(null);
    const [userProfileID, setUserProfileID] = useState('');
    const [timeStamp, setTimeStamp] = useState('');
    const [post, setPost] = useState('');
    const [groupName, setGroupName] = useState('');
    const [liked, setLiked] = useState(false);
    const [open, setOpen] = React.useState(false);
    const [openEdit, setOpenEdit] = React.useState(false);
    const [openDelete, setOpenDelete] = React.useState(false);
    const [likesNames, setLikesNames] = useState([]);
    const [currentUserPost, setCurrentUserPost] = useState(false);
    const [original, setOriginal] = useState("");

    const handleClickOpen = () => {
        setOpen(true);
        getLikesNames(props.id);
    };

    const handleClickOpenEdit = () => {
        setOpenEdit(true);
        setOriginal(post);
    }

    const handleClickOpenDelete = () => {
        setOpenDelete(true);
    }

    const handleClose = () => {
        setOpen(false);
    };

    const handleCloseEdit = () => {
        setOpenEdit(false);
        setPost(original);
    };

    const handleCloseDelete = () => {
        setOpenDelete(false);
    };

    const handleCreateEdit = () => {
        setOpenEdit(false);
        editPost(props.id, post);
    }

    const handleCreateDelete = () => {
        setOpenDelete(false);
        deletePost(props.id);
    }

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
            const date = new Date(parseRes.time_stamp).toString();
            setTimeStamp(date);
            setPost(parseRes.post);
            setUserProfileID(parseRes.profile_id);
            setComments(parseRes.comment_ids);
            setLikes(parseRes.likes);
            setLiked(parseRes.liked);
            setGroupName(parseRes.group_name);
            setCurrentUserPost(parseRes.user_post);
            // setInfo(parseRes.profile_info);
        } catch (err) {
            console.error(err.message);
        }
    }

    async function createComment(id, data) {
        try {
            const response = await fetch('http://localhost:5000/comment/create-comment', {
                method: "POST",
                headers: {
                    token: localStorage.token,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ 
                    id: id,
                    comment: data 
                })
            });

            const parseRes = await response.json();
            setComments([...comments, parseRes.new_comment_id.comment_id])
        } catch (err) {
            console.error(err.message);
        }
    }

    async function createLike(data) {
        try {
            const response = await fetch('http://localhost:5000/post/create-like', {
                method: "POST",
                headers: {
                    token: localStorage.token,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ 
                    id: data
                })
            });

            const parseRes = await response.json();
            setLikes([...likes, parseRes.new_like_id.like_id]);
            setLiked(true);
        } catch (err) {
            console.error(err.message);
        }
    }

    async function createUnlike(data) {
        try {
            const response = await fetch('http://localhost:5000/post/create-unlike', {
                method: "POST",
                headers: {
                    token: localStorage.token,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ 
                    id: data
                })
            });

            const parseRes = await response.json();
            setLikes(parseRes.likes);
            setLiked(false);
        } catch (err) {
            console.error(err.message);
        }
    }

    async function getLikesNames(data) {
        try {
            const response = await fetch('http://localhost:5000/post/get-likes-names', {
                method: "POST",
                headers: {
                    token: localStorage.token,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ 
                    id: data
                })
            });

            const parseRes = await response.json();
            setLikesNames(parseRes.likes_names);
        } catch (err) {
            console.error(err.message);
        }
    }

    async function editPost(id, data) {
        try {
            const response = await fetch('http://localhost:5000/post/edit-post', {
                method: "POST",
                headers: {
                    token: localStorage.token,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ 
                    id: id,
                    post: data
                })
            });

            const parseRes = await response.json();
        } catch (err) {
            console.error(err.message);
        }
    }

    async function deletePost(id) {
        try {
            const response = await fetch('http://localhost:5000/post/delete-post', {
                method: "POST",
                headers: {
                    token: localStorage.token,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ 
                    id: id,
                })
            });

            const parseRes = await response.json();
            props.deletePostId(parseRes.post_id);
        } catch (err) {
            console.error(err.message);
        }
    }

    function deleteCommentId(comment_id) {
        setComments(comments.filter(comment => comment !== comment_id));
    }

    useEffect(() => {
        getName(props.id);
        getPhoto(props.id);
        getPost(props.id);
    }, [props.id]);

    function handleSubmit(e) {
        e.preventDefault();
        createComment(props.id, input)
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

    function handleLikeClick() {
        createLike(props.id);
    }

    function handleUnlikeClick() {
        createUnlike(props.id);
    }

    return (
        <div className="post">
            <div className="post__top">
                <Avatar src={userPicture} className="post__avatar"/>
                <div className="post__topInfo">
                    <Link to={{
                        pathname: '/otherProfile',
                        idProps: {
                            id: userProfileID
                        }
                    }} style={{ textDecoration: 'none', color: 'black', fontWeight: 'bold'}}>
                        {userName}
                    </Link>
                    <p>{groupName}</p>
                    <p>{timeStamp}</p>
                </div>
                { currentUserPost && 
                    <div style={{position: 'absolute', right: '15px', top: '15px', display: 'flex'}}>
                        <div style={{marginRight: '15px'}}>
                            <EditIcon className={classes.small} onClick={handleClickOpenEdit} />
                            <Dialog open={openEdit} onClose={handleCloseEdit} aria-labelledby="form-dialog-title" fullWidth maxWidth="sm">
                                <DialogTitle id="form-dialog-title">Edit your post here.</DialogTitle>
                                <TextField
                                    autoFocus
                                    margin="dense"
                                    id="name"
                                    type="text" 
                                    fullWidth
                                    multiline
                                    rows={5}
                                    rowsMax={5}
                                    onChange={e => setPost(e.target.value)}
                                    className={classes.edit}
                                />
                                <DialogActions>
                                    <Button onClick={handleCloseEdit} color="primary">
                                        Cancel
                                    </Button>
                                    <Button onClick={handleCreateEdit} color="primary">
                                        Done
                                    </Button>
                                </DialogActions>
                            </Dialog>
                        </div>
                        <div>
                            <DeleteIcon className={classes.small} onClick={handleClickOpenDelete}/>
                            <Dialog open={openDelete} onClose={handleCloseDelete} aria-labelledby="form-dialog-title" fullWidth maxWidth="sm">
                                <DialogTitle id="form-dialog-title">Are you sure you want to delete this post?</DialogTitle>
                                    <DialogContent>
                                        <DialogContentText>
                                            All subsequent likes and comments will be deleted.
                                        </DialogContentText>                            
                                    </DialogContent>
                                    <DialogActions>
                                        <Button onClick={handleCloseDelete} color="primary">
                                            Cancel
                                        </Button>
                                        <Button onClick={handleCreateDelete} color="primary">
                                            Delete
                                        </Button>
                                </DialogActions>
                            </Dialog>
                        </div>
                    </div>
                }
            </div>
            <div className="post__bottom">
                <pre>{post}</pre>
            </div>
            <div>
                <div className="post__details">
                    <p className="align__left" onClick={handleClickOpen}>{likes !== undefined ? likes.length : 0} likes</p>
                    <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
                        <DialogTitle id="form-dialog-title">People who liked this post</DialogTitle>
                        <DialogContent>
                            {likesNames.map(names => (
                                <DialogContentText>
                                    {names}
                                </DialogContentText>
                            ))}
                        </DialogContent>
                        <DialogActions>
                        <Button onClick={handleClose} color="primary">
                            Cancel
                        </Button>
                        </DialogActions>
                    </Dialog>
                    <p className="align__right" onClick={handleCommentClick}>{comments !== undefined ? comments.length : 0} comments</p>
                </div>
                <div className="post__options">
                    {liked ?
                        <div className="post__option" onClick={handleUnlikeClick}>
                            <ThumbUpIcon style={{color: "#E27B66"}}/>
                            <p style={{color: "#E27B66"}}>Liked</p>
                        </div>
                    :
                        <div className="post__option" onClick={handleLikeClick}>
                            <ThumbUpIcon />
                            <p>Like</p>
                        </div>
                    }
                    <div className="post__option" onClick={handleCommentClick}>
                        <ChatBubbleOutlineIcon />
                        <p>Comment</p>
                    </div>
                </div>
            </div>
            
            <div className="post__comments" id={props.id} style={{display: "none"}}>
                {comments !== undefined ? comments.map(uid => <Comment id={uid} deleteCommentId={deleteCommentId}/>) : null}
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