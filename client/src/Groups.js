import React, { useState, useEffect } from 'react';
import './Groups.css';
import Header from './Header';
import { Grid, Avatar, Divider, Typography, Button } from '@material-ui/core';
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
    const [createGroup, setCreateGroup] = useState(0);
    const [newGroupName, setNewGroupName] = useState('');
    const [errorInput, setErrorInput] = useState(0);

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

    async function postGroupName(data) {
        try {
            const response = await fetch('http://localhost:5000/groups/postName/', {
                method: "POST",
                headers: {
                    token: localStorage.token,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name: data 
                })
            });

            const parseRes = await response.json();
            if (parseRes.err) {
                setErrorInput(2);
                setNewGroupName("");
            } else {
                setGroupID([parseRes.group_id, ...groupID]);
                setErrorInput(0);
                setCreateGroup(0);
                setNewGroupName("");
            }
        } catch (err) {
            console.error(err.message);
        }
    }

    function handleGroupNameSubmit(e) {
        e.preventDefault();
        if (newGroupName.length > 20) {
            setErrorInput(1);
            setNewGroupName("");
        }
        else {
            console.log(newGroupName);
            postGroupName(newGroupName);
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
            {/* <Button onClick={() => accept(userProfileID)}>Accept</Button> */}
            {errorInput === 1 ? 
                    <div className={classes.root}>
                        <h3>Your group name must NOT be more than 20 characters!</h3>
                    </div> 
                : 
                    null
            }
            {errorInput === 2 ? 
                    <div className={classes.root}>
                        <h3>Group already exists! Please enter a new group name.</h3>
                    </div> 
                : 
                    null
            }
            <div className={classes.root}>
                {createGroup === 0 ?
                    <Button onClick={() => setCreateGroup(1)}>Create New Group</Button>
                :   
                    <div className="newGroup__top">                
                        <form>
                            <textarea
                                value={newGroupName}
                                onChange={e => setNewGroupName(e.target.value)} 
                                className="newGroup__input" 
                                rows="1" 
                                cols="50" 
                                placeholder={`Write group name here, ${name}. Group name must be less than 20 characters`}
                            ></textarea>
                            <button onClick={handleGroupNameSubmit} type="submit">Submit</button>
                        </form>
                    </div>
                }
            </div>
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