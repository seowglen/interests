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
        paddingLeft: theme.spacing(15),
        paddingRight: theme.spacing(15)
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
    const [filterProfileID, setFilterProfileID] = useState([]);
    const [filterOtherProfileID, setFilterOtherProfileID] = useState([]);
    const [filterRequestProfileID, setFilterRequestProfileID] = useState([]);
    const [search, setSearch] = useState("");
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

    function handleSearch(e) {
        // console.log(e.target.value)
        setSearch(e.target.value.toLowerCase())
        setFilterProfileID(profileID.filter(profile => profile.profile_name.toLowerCase().includes(e.target.value.toLowerCase())))
        setFilterOtherProfileID(otherProfileID.filter(profile => profile.profile_name.toLowerCase().includes(e.target.value.toLowerCase())))
        setFilterRequestProfileID(requestProfileID.filter(profile => profile.profile_name.toLowerCase().includes(e.target.value.toLowerCase())))
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
                    Friend Requests ({filterRequestProfileID ? filterRequestProfileID.length : search.length === 0 ? requestProfileID.length : 0})
                </Button>
                <Button variant="contained" className={(toggleList ? classes.active : '')} onClick={() => handleList()}>
                    Friends List ({filterProfileID ? filterProfileID.length : search.length === 0 ? profileID.length : 0})
                </Button>
                <Button variant="contained" className={(toggleConsider ? classes.active : '')} onClick={() => handleConsider()}>
                    Friends To Consider ({filterOtherProfileID ? filterOtherProfileID.length : search.length === 0 ? otherProfileID.length : 0})
                </Button>
            </div>

            <div className="groups__bar" style={{paddingTop: '0px'}}>
                <input style={{width: "200px", height: "30px"}} placeholder="Search for a user here" value={search} onChange={(e) => handleSearch(e)}></input>
            </div>

            {toggleRequest ? 
                <div className={classes.root}>
                    {/* <Typography variant="h5">Friend Requests:</Typography> */}
                    <Grid container spacing={3}>
                        {filterRequestProfileID.length !== 0 ?
                            requestProfileID.map(uid => (
                                <ProfileCard id={uid.profile_id}/>
                            ))
                        :
                            search.length === 0 ?
                                requestProfileID.map(uid => (
                                    <ProfileCard id={uid.profile_id}/>
                                ))
                            :
                                null
                        }
                    </Grid>
                </div>
            : null
            }
            
            {toggleList ?
                <div className={classes.root}>
                    {/* <Typography variant="h5">My Friends:</Typography> */}
                    <Grid container spacing={3}>
                        {filterProfileID.length !== 0 ? 
                            filterProfileID.map(uid => (
                                <ProfileCard id={uid.profile_id}/>
                            ))
                        :
                            search.length === 0 ?
                                profileID.map(uid => (
                                    <ProfileCard id={uid.profile_id}/>
                                ))
                            :
                                null
                        }
                    </Grid>
                </div>
            : 
                null
            }
            
            {toggleConsider ?
                <div className={classes.root}>
                    {/* <Typography variant="h5">Friends To Consider:</Typography> */}
                    <Grid container spacing={3}>
                        {filterOtherProfileID.length !== 0 ? 
                            filterOtherProfileID.map(uid => (
                                <ProfileCard id={uid.profile_id}/>
                            ))
                        :
                            search.length === 0 ?
                                otherProfileID.map(uid => (
                                    <ProfileCard id={uid.profile_id}/>
                                ))
                            :
                                null
                        }
                    </Grid>
                </div>
            : null
            }    
        </div>
    );
}

export default Friends;