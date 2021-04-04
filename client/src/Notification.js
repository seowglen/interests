import React, {useState, useEffect} from 'react';
import { Avatar } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import './Notifications.css';

const useStyles = makeStyles(theme => ({
    pic: {
        width: theme.spacing(7),
        height: theme.spacing(7),
    },
}));

function Notification(props) {

    const classes = useStyles();
    const [name, setName] = useState('');
    const [picture, setPicture] = useState(null);

    async function getUserDetails(data) {
        try {
            const response = await fetch(
                "http://localhost:5000/notifications/get-name",
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
            setName(parseRes.profile_name);
          // setInfo(parseRes.profile_info);
        } catch (err) {
            console.error(err.message);
        }
    }
    
    async function getUserPhoto(data) {
        try {
            await fetch("http://localhost:5000/notifications/get-photo", {
                method: "POST",
                headers: {
                    token: localStorage.token,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ id: data }),
            }).then((response) => {
                response.blob().then((blobResponse) => {
                    setPicture(URL.createObjectURL(blobResponse));
                });
            });
        } catch (err) {
            console.error(err.message);
        }
    }

    useEffect(() => {
        getUserDetails(props.notification.other_user_id);
        getUserPhoto(props.notification.other_user_id);
    }, [props]);

    return(
        <div className={props.notification.seen ? "notifications" : "notifications__unseen"}>
            <Avatar className={classes.pic} src={picture}/>
            <div className="notification">
                <p className="message">{name} {props.notification.notification}</p>
            </div>
        </div>
    )
}

export default Notification;