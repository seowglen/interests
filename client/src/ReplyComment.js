import React from 'react';
import ForumComment from './ForumComment';

const ReplyComment = (props) => { 

    return(
        <div>
        {
            props.comments && props.comments.map((comment) => (
                <div>
                    {comment.parent_comment_id === props.parentCommentId &&
                        <div className="forumReply" style={{marginLeft:'70px', width: "90%"}}>
                            <ForumComment comment={comment} id={props.id} updateComment={props.updateComment}/>
                            <ReplyComment comments={props.comments} id={props.id} parentCommentId={comment.forum_comment_id} updateComment={props.updateComment}/>
                        </div>
                    }
                </div>
            ))
        }
        </div>
    )
}

export default ReplyComment;