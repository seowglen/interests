import React, { useState, useEffect } from "react";
import Header from "./Header";
import "./OtherProfile.css";
import { Avatar } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { Button } from "@material-ui/core";
import EditIcon from '@material-ui/icons/Edit';
import IconButton from "@material-ui/core/IconButton";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    position: "relative",
    "& > *": {
      margin: theme.spacing(1),
    },
  },
  small: {
    width: theme.spacing(3),
    height: theme.spacing(3),
    position: "relative",
    bottom: "0",
    right: "0",
    backgroundColor: "#f0f0f0",
    "&:hover": { backgroundColor: "#dcdcdc" },
  },
  large: {
    width: theme.spacing(25),
    height: theme.spacing(25),
  },
  icon: {
    position: "absolute",
    bottom: "0",
    right: "0",
    backgroundColor: "#f0f0f0",
    "&:hover": { backgroundColor: "#dcdcdc" },
  },
}));

const OtherProfile = (props) => {
  // props.location.idProps.id returns id in string

  const classes = useStyles();
  const [groupProfileID, setGroupProfileID] = useState(null);
  const [name, setName] = useState("");
  const [picture, setPicture] = useState(null);
  const [groupName, setGroupName] = useState("");
  const [groupPicture, setGroupPicture] = useState(null);
  const [groupInfo, setGroupInfo] = useState("");
  const [editName, setEditName] = useState(0);
  const [inputName, setInputName] = useState("");
  const [editInfo, setEditInfo] = useState(0);
  const [inputInfo, setInputInfo] = useState("");
  const [groupJoined, setGroupJoined] = useState(null);

  const logout = (e) => {
    e.preventDefault();
    localStorage.removeItem("token");
    props.setAuth(false);
  };

  async function getDetails() {
    try {
      const response = await fetch("http://localhost:5000/profile/", {
        method: "GET",
        headers: { token: localStorage.token },
      });

      const parseRes = await response.json();
      setName(parseRes.profile_name);
      // setInfo(parseRes.profile_info);
    } catch (err) {
      console.error(err.message);
    }
  }

  async function getPhoto() {
    try {
      await fetch("http://localhost:5000/profile/get-photo", {
        method: "GET",
        headers: { token: localStorage.token },
      }).then((response) => {
        response.blob().then((blobResponse) => {
          setPicture(URL.createObjectURL(blobResponse));
        });
      });
    } catch (err) {
      console.error(err.message);
    }
  }

  async function getGroupDetails(data) {
    try {
      const response = await fetch(
        "http://localhost:5000/groupProfile/get-details",
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
      setGroupName(parseRes.group_name);
      setGroupInfo(parseRes.group_info);
      setGroupJoined(parseRes.group_joined);
      // setInfo(parseRes.profile_info);
    } catch (err) {
      console.error(err.message);
    }
  }

  async function getGroupPhoto(data) {
    try {
      await fetch("http://localhost:5000/groupProfile/get-photo", {
        method: "POST",
        headers: {
          token: localStorage.token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: data }),
      }).then((response) => {
        response.blob().then((blobResponse) => {
          setGroupPicture(URL.createObjectURL(blobResponse));
        });
      });
    } catch (err) {
      console.error(err.message);
    }
  }

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
    formData.append('id', groupProfileID);

    postImage(formData);

    setGroupPicture(URL.createObjectURL(e.target.files[0]))
    // console.log(URL.createObjectURL(e.target.files[0]))
  }

  async function postImage(data) {
    try {
        const response = await fetch('http://localhost:5000/groupProfile/upload-image', {
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
        postName(groupProfileID, inputName);
        setGroupName(inputName);
        setInputName("");
        setEditName(0);
    } catch (err) {
        console.error(err.message);
    }
  }

  async function postName(id, data) {
    try {
        const response = await fetch('http://localhost:5000/groupProfile/save-name', {
            method: "POST",
            headers: {
                token: localStorage.token,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ 
                id: id,
                name: data 
            })
        });
        const parseRes = await response.json();
    } catch (err) {
        console.error(err.message);
    }
  }

  function handleInfoSubmit(e) {
    try {
        e.preventDefault();
        postInfo(groupProfileID, inputInfo);
        setGroupInfo(inputInfo);
        setInputInfo("");
        setEditInfo(0);
    } catch (err) {
        console.error(err.message);
    }
  }

  async function postInfo(id, data) {
    try {
        const response = await fetch('http://localhost:5000/groupProfile/save-info', {
            method: "POST",
            headers: {
                token: localStorage.token,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                id: id, 
                info: data 
            })
        });
        const parseRes = await response.json();
    } catch (err) {
        console.error(err.message);
    }
  }

  async function join(id) {
    try {
        const response = await fetch('http://localhost:5000/groupProfile/join-group', {
            method: "POST",
            headers: {
                token: localStorage.token,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                id: id
            })
        });
        const parseRes = await response.json();
        setGroupJoined(true);
    } catch (err) {
        console.error(err.message);
    }
  }

  async function leave(id) {
    try {
        const response = await fetch('http://localhost:5000/groupProfile/leave-group', {
            method: "POST",
            headers: {
                token: localStorage.token,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                id: id
            })
        });
        const parseRes = await response.json();
        setGroupJoined(false);
    } catch (err) {
        console.error(err.message);
    }
  }

  useEffect(() => {
    getDetails();
    getPhoto();
    setGroupProfileID(props.location.idProps.id);
    getGroupDetails(props.location.idProps.id);
    getGroupPhoto(props.location.idProps.id);
  }, [props.location.idProps.id]);

  return (
    <div>
      <Header
        displayName={name}
        picture={picture}
        setAuth={props.setAuth}
        logout={logout}
        currentPage="asdf"
      />
      <div className="profile">
        <div>
            {groupJoined ? 
                <Button onClick={() => leave(groupProfileID)}>Leave Group</Button>
            :
                <Button onClick={() => join(groupProfileID)}>Join Group</Button>
            }
        </div>
        <div className={classes.root}>
          {groupPicture ? (
            <Avatar src={groupPicture} className={classes.large} />
          ) : (
            <Avatar className={classes.large} />
          )}
          <IconButton className={classes.icon} onClick={upload}>
            <EditIcon />
            <input id='selectImage' hidden type="file" onChange={handleImageChange}/>
          </IconButton>
        </div>
        {editName === 0 ?
            <div className={classes.root} style={{ marginLeft: "40px", marginTop: "20px"}}>
                <h1>{groupName}</h1>
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
                        placeholder={`Write your new group name here, ${name}.`}
                    ></textarea>
                    <button onClick={handleNameSubmit} type="submit">Submit</button>
                </form>
            </div>
        }
                
        {editInfo === 0 ?
            <div className={classes.root} style={{ marginLeft: "40px", marginTop: "20px"}}>
                <h3>{groupInfo}</h3>
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
                        placeholder={`Write your new group info here, ${name}.`}
                    ></textarea>
                    <button onClick={handleInfoSubmit} type="submit">Submit</button>
                </form>
            </div>
        }
      </div>
    </div>
  );
};

export default OtherProfile;