import React, { useState, useEffect } from 'react';
import './Groups.css';
import Header from './Header';
import { Grid, Avatar, Divider, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import GroupCard from './GroupCard';

const useStyles = makeStyles(theme => ({
    root: {
        paddingLeft: theme.spacing(5),
        paddingRight: theme.spacing(5)
    }
}));

const Groups = ({ setAuth }) => {

    const classes = useStyles();
    const [name, setName] = useState("");
    const [picture, setPicture] = useState(null);
    const [groupID, setGroupID] = useState([]);
    const [otherGroupID, setOtherGroupID] = useState([]);

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

    async function getGroupIds() {
        try {
            const response = await fetch('http://localhost:5000/groups/', {
                method: "GET",
                headers: {token: localStorage.token}
            });
            
            const parseRes = await response.json();
            setGroupID(parseRes.user_groups);
            setOtherGroupID(parseRes.groups_to_consider);            
            // setPicture(parseRes.profile_picture);
        } catch (err) {
            console.error(err.message);
        }
    }

    useEffect(() => {
        getDetails();
        getPhoto();
        getGroupIds();
    }, []);

    return (
        <div>
            <Header displayName={name} picture={picture} setAuth={setAuth} logout={logout} currentPage='groups'/>
            <h3>These are my groups:</h3>
            <div className={classes.root}>
                {/* <Typography variant="h5">My Friends:</Typography> */}
                <Grid container spacing={3}>
                    {groupID.map(uid => (
                        <GroupCard id={uid}/>
                    ))}
                </Grid>
            </div>
            <h3>Groups to consider:</h3>
            <div className={classes.root}>
                {/* <Typography variant="h5">Friends To Consider:</Typography> */}
                <Grid container spacing={3}>
                    {otherGroupID.map(uid => (
                        <GroupCard id={uid}/>
                    ))}
                </Grid>
            </div>
        </div>
    );
}

export default Groups;