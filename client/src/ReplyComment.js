import React, {useState} from 'react';
import ForumComment from './ForumComment';

const ReplyComment = (props) => { 

    const [displayRepliesFor, setDisplayRepliesFor] = useState([]);

    const handleToggle = (comment_id) => {
        if (displayRepliesFor.includes(comment_id)) {
            setDisplayRepliesFor(displayRepliesFor.filter(comment => comment !== comment_id));
        } else {
            setDisplayRepliesFor([...displayRepliesFor, comment_id]);
        }
    }

    return(
        <div style={{marginLeft:'30px'}}>
            {props.comments && props.comments.map((comment) => (
                <div>
                    {comment.parent_comment_id === props.parentCommentId &&
                        <div>
                            <ForumComment comments={props.comments} comment={comment} id={props.id} updateComment={props.updateComment} handleToggle={handleToggle}/>
                            {displayRepliesFor.includes(comment.forum_comment_id) && 
                                <ReplyComment comments={props.comments} id={props.id} parentCommentId={comment.forum_comment_id} updateComment={props.updateComment}/>
                            }
                        </div>
                    }
                </div>
            ))}
        </div>
    )
}

export default ReplyComment;