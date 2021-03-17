import React, { useState, useEffect } from 'react';
import Header from './Header';
import "./Profile.css";
import { Avatar } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
// import img from './120814890_10218672723473169_5547970412948181102_o.jpg'
import EditIcon from '@material-ui/icons/Edit';
import IconButton from "@material-ui/core/IconButton";

const useStyles = makeStyles((theme) => ({
    root: {
      display: 'flex',
      position: 'relative',
      '& > *': {
        margin: theme.spacing(1),
      },
    },
    small: {
      width: theme.spacing(3),
      height: theme.spacing(3),
      position: 'relative',
      bottom: '0',
      right: '0',
      backgroundColor: '#f0f0f0',
      "&:hover": { backgroundColor: "#dcdcdc" },
    },
    medium: {
        width: theme.spacing(18),
        height: theme.spacing(18),
    },
    large: {
      width: theme.spacing(25),
      height: theme.spacing(25),
    },
    icon: {
      position: 'absolute',
      bottom: '0',
      right: '0',
      backgroundColor: '#f0f0f0',
      "&:hover": { backgroundColor: "#dcdcdc" },
    }
}));

const Profile = ({ setAuth }) => {

    const classes = useStyles();

    const [name, setName] = useState("");
    const [picture, setPicture] = useState(null);
    const [info, setInfo] = useState("");
    const [editName, setEditName] = useState(0);
    const [inputName, setInputName] = useState("");
    const [editInfo, setEditInfo] = useState(0);
    const [inputInfo, setInputInfo] = useState("");

    async function getDetails() {
        try {
            const response = await fetch('http://localhost:5000/profile/', {
                method: "GET",
                headers: {token: localStorage.token}
            });
            
            const parseRes = await response.json();
            setName(parseRes.profile_name);
            // setPicture(parseRes.profile_picture);
            setInfo(parseRes.profile_info);
        } catch (err) {
            console.error(err.message);
        }
    }

    async function getPhoto() {
        try {
            await fetch('http://localhost:5000/profile/get-photo', {
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

    const logout = (e) => {
        e.preventDefault();
        localStorage.removeItem("token");
        setAuth(false);
    }

    useEffect(() => {
        getDetails();
        getPhoto();
    }, []);
    
    function upload() {
        document.getElementById("selectImage").click()
    }

    function handleEditName() {
        setEditName(1);
    }

    function handleEditInfo() {
        setEditInfo(1);
    }

    function handleImageChange(e) {
        const files = Array.from(e.target.files);
        const file = files[0];
        const formData = new FormData();
        formData.append('file', file);

        postImage(formData);

        setPicture(URL.createObjectURL(e.target.files[0]))
        // console.log(URL.createObjectURL(e.target.files[0]))
    }

    async function postImage(data) {
        try {
            const response = await fetch('http://localhost:5000/profile/upload-image', {
                method: "POST",
                headers: {token: localStorage.token},
                body: data 
            });
            const parseRes = await response.json();
        } catch (err) {
            console.error(err.message);
        }
    }

    function handleNameSubmit(e) {
        try {
            e.preventDefault();
            postName(inputName);
            setName(inputName);
            setInputName("");
            setEditName(0);
        } catch (err) {
            console.error(err.message);
        }
    }

    async function postName(data) {
        try {
            const response = await fetch('http://localhost:5000/profile/save-name', {
                method: "POST",
                headers: {
                    token: localStorage.token,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ name: data })
            });
            const parseRes = await response.json();
        } catch (err) {
            console.error(err.message);
        }
    }

    function handleInfoSubmit(e) {
        try {
            e.preventDefault();
            postInfo(inputInfo);
            setInfo(inputInfo);
            setInputInfo("");
            setEditInfo(0);
        } catch (err) {
            console.error(err.message);
        }
    }

    async function postInfo(data) {
        try {
            const response = await fetch('http://localhost:5000/profile/save-info', {
                method: "POST",
                headers: {
                    token: localStorage.token,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ info: data })
            });
            const parseRes = await response.json();
        } catch (err) {
            console.error(err.message);
        }
    }

    return (
        <div>
            <Header displayName={name} picture={picture} setAuth={setAuth} logout={logout} currentPage='profile'/>
            <div className='profile'>
                <div className={classes.root}>
                    {picture ? <Avatar src={picture} className={classes.medium}/> : <Avatar className={classes.medium}/>}
                    <IconButton className={classes.icon} onClick={upload}>
                        <EditIcon />
                        <input id='selectImage' hidden type="file" onChange={handleImageChange}/>
                    </IconButton>
                </div>
                
                {editName === 0 ?
                    <div className={classes.root} style={{ marginLeft: "40px", marginTop: "20px"}}>
                        <h1>{name}</h1>
                            {/* <IconButton className={classes.small} onClick={upload}> */}
                        <IconButton id="name" className={classes.small} onClick={handleEditName}>
                            <EditIcon />
                        </IconButton>
                    </div>
                    : 
                    <div className="inviteSender__top">                
                        <form>
                            <textarea
                                value={inputName}
                                onChange={e => setInputName(e.target.value)} 
                                className="inviteSender__input" 
                                rows="1" 
                                cols="50" 
                                placeholder={`Write your new name here, ${name}.`}
                            ></textarea>
                            <button onClick={handleNameSubmit} type="submit">Submit</button>
                        </form>
                    </div>
                }
                
                {editInfo === 0 ?
                    <div className={classes.root} style={{ marginLeft: "40px", marginTop: "20px"}}>
                        <h3>{info}</h3>
                            {/* <IconButton className={classes.small} onClick={upload}> */}
                        <IconButton id="name" className={classes.small} onClick={handleEditInfo}>
                            <EditIcon />
                        </IconButton>
                    </div>
                    : 
                    <div className="inviteSender__top">                
                        <form>
                            <textarea
                                value={inputInfo}
                                onChange={e => setInputInfo(e.target.value)} 
                                className="inviteSender__input" 
                                rows="1" 
                                cols="50" 
                                placeholder={`Write your new info here, ${name}.`}
                            ></textarea>
                            <button onClick={handleInfoSubmit} type="submit">Submit</button>
                        </form>
                    </div>
                }
                
            </div>
        </div>
    );
};

export default Profile;
