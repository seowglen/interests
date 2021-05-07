import React, { useState, useEffect } from 'react';
import './Groups.css';
import Header from './Header';
import { Grid, Avatar, Divider, Typography, Button } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import GroupCard from './GroupCard';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

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
    head: {
        backgroundColor: '#ffa6a6',
        color: "white",
        "&:hover": {
            backgroundColor: "#f7196e",
            color: "white"
        }
    },
    edit: {
        paddingLeft: '25px',
        paddingRight: '25px'
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
    const [newGroupInfo, setNewGroupInfo] = useState('');
    const [errorInput, setErrorInput] = useState(0);
    const [toggleList, setToggleList] = useState(false);
    const [toggleConsider, setToggleConsider] = useState(false);
    const [filterGroupID, setFilterGroupID] = useState([]);
    const [filterOtherGroupID, setFilterOtherGroupID] = useState([]);
    const [search, setSearch] = useState("");

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

    async function postGroupDetails(name, info) {
        try {
            const response = await fetch('http://localhost:5000/groups/postName/', {
                method: "POST",
                headers: {
                    token: localStorage.token,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name: name,
                    info: info 
                })
            });

            const parseRes = await response.json();
            if (parseRes.err) {
                setErrorInput(2);
                setCreateGroup(0);
                setNewGroupName("");
                setNewGroupInfo("");
            } else {
                setGroupID([parseRes, ...groupID]);
                setErrorInput(0);
                setCreateGroup(0);
                setNewGroupName("");
                setNewGroupInfo("");
                if (toggleConsider) {
                    setToggleConsider(false);
                    setToggleList(true);
                }
                setSearch("");
                setFilterGroupID([]);
                setFilterOtherGroupID([]);
            }
        } catch (err) {
            console.error(err.message);
        }
    }

    function handleGroupSubmit() {
        
        if (newGroupName.length > 20) {
            setErrorInput(1);
            setCreateGroup(0);
            setNewGroupName("");
            setNewGroupInfo("");
        } else if (newGroupName.length < 1) {
            setErrorInput(3);
            setCreateGroup(0);
            setNewGroupName("");
            setNewGroupInfo("");
        } else {
            postGroupDetails(newGroupName, newGroupInfo);
        }
    }

    function handleGroupClose() {
        setCreateGroup(0);
        setNewGroupName("");
        setNewGroupInfo("");
    }

    function handleList() {
        setToggleList(true);
        setToggleConsider(false);
    }

    function handleConsider() {
        setToggleList(false);
        setToggleConsider(true);
    }

    function handleSearch(e) {
        // console.log(e.target.value)
        setSearch(e.target.value.toLowerCase())
        setFilterGroupID(groupID.filter(group => group.group_name.toLowerCase().includes(e.target.value.toLowerCase())))
        setFilterOtherGroupID(otherGroupID.filter(group => group.group_name.toLowerCase().includes(e.target.value.toLowerCase())))
    }

    useEffect(() => {
        getDetails();
        getPhoto();
        getGroupIds();
        setToggleList(true);
    }, []);

    return (
        <div>
            <Header displayName={name} picture={picture} setAuth={setAuth} logout={logout} currentPage='groups'/>
            {/* <Button onClick={() => accept(userProfileID)}>Accept</Button> */}
            {errorInput === 1 ? 
                    <div className={classes.root}>
                        <h3 style={{marginBottom: '0px', display: 'flex', justifyContent: 'center', backgroundColor: '#d75b60', color: 'white'}}>
                            ERROR: Group Name has more than 20 Characters
                        </h3>
                    </div> 
                : 
                    null
            }
            {errorInput === 2 ? 
                    <div className={classes.root}>
                        <h3 style={{marginBottom: '0px', display: 'flex', justifyContent: 'center', backgroundColor: '#d75b60', color: 'white'}}>
                            ERROR: Group Name already exists!
                        </h3>
                    </div> 
                : 
                    null
            }
            {errorInput === 3 ? 
                    <div className={classes.root}>
                        <h3 style={{marginBottom: '0px', display: 'flex', justifyContent: 'center', backgroundColor: '#d75b60', color: 'white'}}>
                            ERROR: Your Group Name cannot be BLANK!
                        </h3>
                    </div> 
                : 
                    null
            }

            <div className="groups__bar">
                <Button variant="contained" className={classes.head} onClick={() => setCreateGroup(1)}>Create New Group</Button>
                <Dialog open={createGroup} onClose={handleGroupClose} aria-labelledby="form-dialog-title" fullWidth maxWidth="sm">
                    <DialogTitle id="form-dialog-title">Create Group Here.</DialogTitle>
                    <div className={classes.edit}>
                    <DialogContentText>
                        Your Group Name is required and must not be more than 20 characters.
                    </DialogContentText>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="name"
                        type="text"
                        label="Name" 
                        fullWidth
                        required
                        onChange={e => setNewGroupName(e.target.value)}
                    />
                    <TextField
                        autoFocus
                        margin="dense"
                        id="info"
                        type="text"
                        label="Info" 
                        fullWidth
                        multiline
                        required
                        rows={5}
                        rowsMax={5}
                        onChange={e => setNewGroupInfo(e.target.value)}
                    />
                    </div>
                    <DialogActions>
                        <Button onClick={handleGroupClose} color="primary">
                            Cancel
                        </Button>
                        <Button onClick={handleGroupSubmit} color="primary">
                            Create
                        </Button>
                    </DialogActions>
                </Dialog>
            </div>

            <div className="groups__bar__options">
                <Button variant="contained" className={(toggleList ? classes.active : '')} onClick={() => handleList()}>
                    Groups List ({filterGroupID.length !== 0 ? filterGroupID.length : search.length === 0 ? groupID.length : 0})
                </Button>
                <Button variant="contained" className={(toggleConsider ? classes.active : '')} onClick={() => handleConsider()}>
                    Groups To Consider ({filterOtherGroupID.length !== 0 ? filterOtherGroupID.length : search.length === 0 ? otherGroupID.length : 0})
                </Button>
            </div>

            <div className="groups__bar" style={{paddingTop: '0px'}}>
                <input style={{width: "200px", height: "30px"}} placeholder="Search for a group here" value={search} onChange={(e) => handleSearch(e)}></input>
            </div>
            
            {toggleList ? 
                <div className={classes.root}>
                    {/* <Typography variant="h5">My Friends:</Typography> */}
                    <Grid container spacing={3}>
                        {filterGroupID.length !== 0 ?
                            filterGroupID.map(uid => (
                                <GroupCard id={uid.group_id}/>
                            ))
                        :
                            search.length === 0 ?
                                groupID.map(uid => (
                                    <GroupCard id={uid.group_id}/>
                                ))
                            :
                                null
                        }
                    </Grid>
                </div>
            : null
            }
            
            {toggleConsider ? 
                <div className={classes.root}>
                    {/* <Typography variant="h5">Friends To Consider:</Typography> */}
                    <Grid container spacing={3}>
                        {filterOtherGroupID.length !== 0 ?
                            filterOtherGroupID.map(uid => (
                                <GroupCard id={uid.group_id}/>
                            ))
                        :
                            search.length === 0 ?
                                otherGroupID.map(uid => (
                                    <GroupCard id={uid.group_id}/>
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

export default Groups;