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

    async function getDetails() {
        try {
            const response = await fetch('http://localhost:5000/profile/', {
                method: "GET",
                headers: {token: localStorage.token}
            });
            
            const parseRes = await response.json();
            setName(parseRes.profile_name);
            setPicture(parseRes.profile_picture);
            setInfo(parseRes.profile_info);
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
        getDetails()
    }, []);
    
    function upload() {
        document.getElementById("selectImage").click()
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
                body: data 
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
                    {picture ? <Avatar src={picture} className={classes.large}/> : <Avatar className={classes.large}/>}
                    <IconButton className={classes.icon} onClick={upload}>
                        <EditIcon />
                        <input id='selectImage' hidden type="file" onChange={handleImageChange}/>
                    </IconButton>
                </div>
                <h1>{name}</h1>
                <textarea
                    className="inviteSender__input" 
                    rows="1" 
                    cols="50" 
                    placeholder={`Write your invite here, ${name}.`}
                ></textarea>
                <h3>{info}</h3>
            </div>
        </div>
    );
};

export default Profile;
