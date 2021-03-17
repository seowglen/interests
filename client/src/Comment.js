import React, { useState, useEffect } from 'react';
import './Comment.css';
import { Avatar } from '@material-ui/core';
import { Link } from 'react-router-dom';
import ThumbUpIcon from '@material-ui/icons/ThumbUp';
import ChatBubbleOutlineIcon from '@material-ui/icons/ChatBubbleOutline';
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
      width: theme.spacing(2),
      height: theme.spacing(2),
      color: '#A9A9A9',
      cursor: "pointer",
      "&:hover": { color: "#808080" },
    },
    edit: {
        paddingLeft: '25px',
        paddingRight: '25px'
    }
}));

const Comment = (props) => {

    const classes = useStyles();

    const [name, setName] = useState('');
    const [picture, setPicture] = useState(null);
    const [comment, setComment] = useState('');
    const [timeStamp, setTimeStamp] = useState('');
    const [userProfileID, setUserProfileID] = useState('');
    const [openEdit, setOpenEdit] = React.useState(false);
    const [openDelete, setOpenDelete] = React.useState(false);
    const [currentUserComment, setCurrentUserComment] = useState(false);
    const [original, setOriginal] = useState("");

    const handleClickOpenEdit = () => {
        setOpenEdit(true);
        setOriginal(comment);
    }

    const handleClickOpenDelete = () => {
        setOpenDelete(true);
    }

    const handleCloseEdit = () => {
        setOpenEdit(false);
        setComment(original);
    };

    const handleCloseDelete = () => {
        setOpenDelete(false);
    };

    const handleCreateEdit = () => {
        setOpenEdit(false);
        editComment(props.id, comment);
    }

    const handleCreateDelete = () => {
        setOpenDelete(false);
        deleteComment(props.id);
    }

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
            setCurrentUserComment(parseRes.user_comment);
            // setInfo(parseRes.profile_info);
        } catch (err) {
            console.error(err.message);
        }
    }

    async function editComment(id, data) {
        try {
            const response = await fetch('http://localhost:5000/comment/edit-comment', {
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
        } catch (err) {
            console.error(err.message);
        }
    }

    async function deleteComment(id) {
        try {
            const response = await fetch('http://localhost:5000/comment/delete-comment', {
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
            props.deleteCommentId(parseRes.comment_id);
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
                                <div style={{display: 'flex', justifyContent: 'space-between'}}>
                                    <Link to={{
                                        pathname: '/otherProfile',
                                        idProps: {
                                            id: userProfileID
                                        }
                                    }} style={{ textDecoration: 'none', color: 'black', fontWeight: 'bold'}}>
                                        {name}
                                    </Link>
                                    { currentUserComment && 
                                    <div style={{display: 'flex'}}>
                                        <div style={{marginRight: '15px'}}>
                                            <EditIcon className={classes.small} onClick={handleClickOpenEdit} />
                                            <Dialog open={openEdit} onClose={handleCloseEdit} aria-labelledby="form-dialog-title" fullWidth maxWidth="sm">
                                                <DialogTitle id="form-dialog-title">Edit your Comment here.</DialogTitle>
                                                <TextField
                                                    autoFocus
                                                    margin="dense"
                                                    id="name"
                                                    type="text" 
                                                    fullWidth
                                                    multiline
                                                    rows={5}
                                                    rowsMax={5}
                                                    onChange={e => setComment(e.target.value)}
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
                                                <DialogTitle id="form-dialog-title">Are you sure you want to delete this comment?</DialogTitle>
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