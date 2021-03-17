import React, { useState, useEffect } from 'react';
import Header from './Header';
import "./Friends.css";
import { Grid, Avatar, Divider, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
// import img from './120814890_10218672723473169_5547970412948181102_o.jpg'
import EditIcon from '@material-ui/icons/Edit';
import IconButton from "@material-ui/core/IconButton";
import ProfileCard from './ProfileCard';
import Button from '@material-ui/core/Button';

const useStyles = makeStyles(theme => ({
    root: {
        paddingLeft: theme.spacing(14),
        paddingRight: theme.spacing(14)
    },
    active: {
        backgroundColor: "#E27B66",
        color: "white",
        "&:hover": {
            backgroundColor: "#E27B66",
            color: "white"
        }
    },
}));

const Friends = ({ setAuth }) => {

    const classes = useStyles();
    const [profileID, setProfileID] = useState([]);
    const [otherProfileID, setOtherProfileID] = useState([]);
    const [requestProfileID, setRequestProfileID] = useState([]);
    const [name, setName] = useState("");
    const [picture, setPicture] = useState(null);
    const [toggleRequest, setToggleRequest] = useState(false);
    const [toggleList, setToggleList] = useState(false);
    const [toggleConsider, setToggleConsider] = useState(false);

    const logout = (e) => {
        e.preventDefault();
        localStorage.removeItem("token");
        setAuth(false);
    }

    async function getDetails() {
        try {
            const response = await fetch('http://localhost:5000/friends/get-details', {
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
            await fetch('http://localhost:5000/friends/get-photo', {
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

    async function getProfileIds() {
        try {
            const response = await fetch('http://localhost:5000/friends/', {
                method: "GET",
                headers: {token: localStorage.token}
            });
            
            const parseRes = await response.json();
            setProfileID(parseRes.friends_profile_id);
            setOtherProfileID(parseRes.friends_to_consider);
            setRequestProfileID(parseRes.friends_requests);            
            // setPicture(parseRes.profile_picture);
        } catch (err) {
            console.error(err.message);
        }
    }

    function handleRequests() {
        setToggleRequest(true);
        setToggleList(false);
        setToggleConsider(false);
    }

    function handleList() {
        setToggleRequest(false);
        setToggleList(true);
        setToggleConsider(false);
    }

    function handleConsider() {
        setToggleRequest(false);
        setToggleList(false);
        setToggleConsider(true);
    }

    useEffect(() => {
        getDetails();
        getPhoto();
        getProfileIds();
        setToggleList(true);
    }, []);

    return (
        <div>
            <Header displayName={name} picture={picture} setAuth={setAuth} logout={logout} currentPage='friends'/>
            {/* <h1>This is the Friends Page</h1> */}
            <div className="friends__bar">
                <Button variant="contained" className={(toggleRequest ? classes.active : '')} onClick={() => handleRequests()}>
                    Friend Requests ({requestProfileID.length})
                </Button>
                <Button variant="contained" className={(toggleList ? classes.active : '')} onClick={() => handleList()}>
                    Friends List ({profileID.length})
                </Button>
                <Button variant="contained" className={(toggleConsider ? classes.active : '')} onClick={() => handleConsider()}>
                    Friends To Consider ({otherProfileID.length})
                </Button>
            </div>

            {toggleRequest ? 
                <div className={classes.root}>
                    {/* <Typography variant="h5">Friend Requests:</Typography> */}
                    <Grid container spacing={3}>
                        {requestProfileID.map(uid => (
                            <ProfileCard id={uid}/>
                        ))}
                    </Grid>
                </div>
            : null
            }
            
            {toggleList ?
                <div className={classes.root}>
                    {/* <Typography variant="h5">My Friends:</Typography> */}
                    <Grid container spacing={3}>
                        {profileID.map(uid => (
                            <ProfileCard id={uid}/>
                        ))}
                    </Grid>
                </div>
            : 
                null
            }
            
            {toggleConsider ?
                <div className={classes.root}>
                    {/* <Typography variant="h5">Friends To Consider:</Typography> */}
                    <Grid container spacing={3}>
                        {otherProfileID.map(uid => (
                            <ProfileCard id={uid}/>
                        ))}
                    </Grid>
                </div>
            : null
            }    
        </div>
    );
}

export default Friends;