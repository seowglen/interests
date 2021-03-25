import React, { useState } from 'react';
import './ForumComments.css';
import { Avatar, Grid } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import ForumComment from './ForumComment';
import ReplyComment from './ReplyComment';

const ForumComments = (props) => {

    const [open, setOpen] = React.useState(false);
    const [comment, setComment] = useState("");
    const [displayRepliesFor, setDisplayRepliesFor] = useState([]);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleCreate = () => {
        setOpen(false);
        createComment(props.id, comment);
    };

    const handleToggle = (comment_id) => {
        if (displayRepliesFor.includes(comment_id)) {
            setDisplayRepliesFor(displayRepliesFor.filter(comment => comment !== comment_id));
        } else {
            setDisplayRepliesFor([...displayRepliesFor, comment_id]);
        }
    }

    async function createComment(id, data) {
        try {
            const response = await fetch(
                "http://localhost:5000/forum/create-comment",
                {
                    method: "POST",
                    headers: {
                        token: localStorage.token,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ 
                        id: id,
                        comment: data
                    }),
                }
            );
            const parseRes = await response.json();
            setComment("");
            props.updateComment(parseRes.new_comment_id);

        } catch (err) {
            console.error(err.message);
        }
    }

    return(
        <div>
            <div className="createComment">

                {props.comments && props.comments.map((comment) => (
                    (!comment.parent_comment_id &&
                        <div>
                            <ForumComment comments={props.comments} comment={comment} id={props.id} updateComment={props.updateComment} handleToggle={handleToggle} deleteComment={props.deleteComment}/>
                            {displayRepliesFor.includes(comment.forum_comment_id) && 
                                <ReplyComment comments={props.comments} id={props.id} parentCommentId={comment.forum_comment_id} updateComment={props.updateComment} deleteComment={props.deleteComment}/>
                            }
                        </div>
                    )
                ))}

                <Grid container justify="center">
                    <Button variant="outlined" color="primary" onClick={handleClickOpen}>
                        Create Comment
                    </Button>
                </Grid>
                <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title" fullWidth maxWidth="sm">
                    <DialogTitle id="form-dialog-title">Create Comment</DialogTitle>
                    <DialogContent>
                    <DialogContentText>
                        Create a Comment to this forum post here.
                    </DialogContentText>
                    <br/>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="name"
                        label="Comment"
                        type="text"
                        fullWidth
                        multiline
                        rows={5}
                        rowsMax={5}
                        onChange={e => setComment(e.target.value)}
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
        </div>
    )
}

export default ForumComments;