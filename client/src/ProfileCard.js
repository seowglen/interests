import React, { useState, useEffect } from 'react';
// import Header from './Header';
import "./ProfileCard.css";
import { Avatar, Grid, Typography, Button } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { Link } from 'react-router-dom';
// import img from './120814890_10218672723473169_5547970412948181102_o.jpg'
// import EditIcon from '@material-ui/icons/Edit';
// import IconButton from "@material-ui/core/IconButton";

const useStyles = makeStyles(theme => ({
    root: {
        border: `1.2px solid ${theme.palette.grey[300]}`,
        padding: theme.spacing(2),
        borderRadius: "3px",
        maxWidth: 200,
        margin: theme.spacing(3) 
    },
    avatar: {
        width: theme.spacing(7),
        height: theme.spacing(7)
    },
    photoContainer: {
        marginBottom: theme.spacing(2)
    },
    profileName: {
        fontWeight: theme.typography.fontWeightBold,
        textAlign: "center"
    },
    otherName: {
        marginBottom: theme.spacing(1)
    },
    profileButton: {
        backgroundColor: "#E27B66",
        color: "white",
        textTransform: "none",
        paddingLeft: theme.spacing(6),
        paddingRight: theme.spacing(6),
        fontWeight: theme.typography.fontWeightMedium
    }
}));

const ProfileCard = ({ id }) => {

    const classes = useStyles();
    const [name, setName] = useState("");
    const [groups, setGroups] = useState(0);
    const [picture, setPicture] = useState(null);

    async function getName(id) {
        try {
            const response = await fetch('http://localhost:5000/profileCard/get-name', {
                method: "POST",
                headers: {
                    token: localStorage.token,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ id: id })
            });
            
            const parseRes = await response.json();
            console.log(parseRes);
            setName(parseRes.profile_name);
            setGroups(parseRes.number_groups);
            // setPicture(parseRes.profile_picture);
            // setInfo(parseRes.profile_info);
        } catch (err) {
            console.error(err.message);
        }
    }

    async function getPhoto(id) {
        try {
            await fetch('http://localhost:5000/profileCard/get-photo', {
                method: "POST",
                headers: {
                    token: localStorage.token,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ id: id })
            }).then(response => {
                response.blob().then(blobResponse => {
                    setPicture(URL.createObjectURL(blobResponse));
                });
            });
        } catch (err) {
            console.error(err.message);
        }
    }

    useEffect(() => {
        getName(id);
        getPhoto(id);
    }, [id]);

    return (
        <Grid container direction="column" alignItems="center" className={classes.root}>
            <div className={classes.photoContainer}>
                <Avatar src={picture} className={classes.avatar}/>
            </div>
            <Typography variant="h6" className={classes.profileName}>{name}</Typography>
            <div className={classes.otherName}>
                <Typography variant="caption" color="textSecondary">{groups} Mutual Groups</Typography>
            </div>
            <Button className={classes.profileButton} disableElevation variant="contained" size="small">
                <Link to={{
                    pathname: '/otherProfile',
                    idProps: {
                        id: id
                    }
                }} style={{ textDecoration: 'none', color: 'white' }}>
                    Profile
                </Link>
            </Button>
        </Grid>
    )
}

export default ProfileCard;