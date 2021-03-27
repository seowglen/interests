import React, { useState, useEffect } from "react";
import Header from "./Header";
import "./OtherProfile.css";
import { Avatar } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { Button, Grid, Typography } from "@material-ui/core";
import GroupCard from './GroupCard';

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
  medium: {
    width: theme.spacing(17),
    height: theme.spacing(17),
  },
  icon: {
    position: "absolute",
    bottom: "0",
    right: "0",
    backgroundColor: "#f0f0f0",
    "&:hover": { backgroundColor: "#dcdcdc" },
  },
  groups: {
    paddingLeft: theme.spacing(14),
    paddingRight: theme.spacing(14),
    backgroundColor: "#fffffb",
  }
}));

const OtherProfile = (props) => {
  // props.location.idProps.id returns id in string

  const classes = useStyles();
  const [userProfileID, setUserProfileID] = useState(null);
  const [name, setName] = useState("");
  const [picture, setPicture] = useState(null);
  const [userName, setUserName] = useState("");
  const [userPicture, setUserPicture] = useState(null);
  const [userInfo, setUserInfo] = useState("");
  const [request, setRequest] = useState("");
  const [groupIDs, setGroupIDs] = useState([]);
  const [ownself, setOwnself] = useState(false);
  const [mutualGroups, setMutualGroups] = useState(0);

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

  async function getUserDetails(data) {
    try {
      const response = await fetch(
        "http://localhost:5000/userProfile/get-details",
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
      setUserName(parseRes.profile_name);
      setUserInfo(parseRes.profile_info);
      setRequest(parseRes.friend_request);
      setGroupIDs(parseRes.group_ids);
      setOwnself(parseRes.ownself);
      setMutualGroups(parseRes.number_groups);
      // setInfo(parseRes.profile_info);
    } catch (err) {
      console.error(err.message);
    }
  }

  async function getUserPhoto(data) {
    try {
      await fetch("http://localhost:5000/userProfile/get-photo", {
        method: "POST",
        headers: {
          token: localStorage.token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: data }),
      }).then((response) => {
        response.blob().then((blobResponse) => {
          setUserPicture(URL.createObjectURL(blobResponse));
        });
      });
    } catch (err) {
      console.error(err.message);
    }
  }

  async function acceptRequest(data) {
    try {
      const response = await fetch("http://localhost:5000/userProfile/accept", {
        method: "POST",
        headers: {
          token: localStorage.token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: data }),
      });

      const parseRes = await response.json();
      console.log(data);
      setRequest("accepted");
    } catch (err) {
      console.error(err.message);
    }
  }

  async function rejectRequest(data) {
    try {
      const response = await fetch("http://localhost:5000/userProfile/reject", {
        method: "POST",
        headers: {
          token: localStorage.token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: data }),
      });

      const parseRes = await response.json();
      console.log(data);
      setRequest(null);
    } catch (err) {
      console.error(err.message);
    }
  }

  async function sendRequest(data) {
    try {
      const response = await fetch("http://localhost:5000/userProfile/send", {
        method: "POST",
        headers: {
          token: localStorage.token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: data }),
      });

      const parseRes = await response.json();
      console.log(data);
      setRequest("sender");
    } catch (err) {
      console.error(err.message);
    }
  }

  async function removeFriend(data) {
    try {
      const response = await fetch("http://localhost:5000/userProfile/remove", {
        method: "POST",
        headers: {
          token: localStorage.token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: data }),
      });

      const parseRes = await response.json();
      console.log(data);
      setRequest(null);
    } catch (err) {
      console.error(err.message);
    }
  }

  function accept(id) {
    console.log(id);
    acceptRequest(id);
  }

  function reject(id) {
    rejectRequest(id);
  }

  function send(id) {
    sendRequest(id);
  }

  function remove(id) {
    removeFriend(id);
  }

  useEffect(() => {
    getDetails();
    getPhoto();
    setUserProfileID(props.location.idProps.id);
    getUserDetails(props.location.idProps.id);
    getUserPhoto(props.location.idProps.id);
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
          {!ownself && request === "receiver" && (
            <div style={{display: 'flex', justifyContent: 'space-evenly'}}>
              <Button variant="contained" style={{backgroundColor: "#ffa6a6", color: "white", marginRight: '20px'}} onClick={() => accept(userProfileID)}>✓ Accept</Button>
              <Button variant="contained" style={{backgroundColor: "#E27B66", color: "white", marginLeft: '20px'}} onClick={() => reject(userProfileID)}>X Reject</Button>
            </div>
          )}
          {!ownself && request === "sender" && <Button variant="contained" style={{backgroundColor: "#b3b3b3", color: "white"}}>⧗ REQUEST PENDING</Button>}
          {!ownself && request === "accepted" && <Button variant="contained" style={{backgroundColor: "#ffa6a6", color: "white"}} onClick={() => remove(userProfileID)}>X Remove Friend</Button>}
          {!ownself && request === null && mutualGroups !== 0 && (
            <Button variant="contained" style={{backgroundColor: "#E27B66", color: "white"}} onClick={() => send(userProfileID)}>
              ⮞ Send friend request
            </Button>
          )}
        </div>
        <div className={classes.root}>
          {userPicture ? (
            <Avatar style={{marginTop: '20px'}} src={userPicture} className={classes.medium} />
          ) : (
            <Avatar style={{marginTop: '20px'}} className={classes.medium} />
          )}
        </div>
        <div className={classes.root}>
          <h1>{userName}</h1>
        </div>
        <div className={classes.root} style={{ marginTop: "10px" }}>
          <h3>{userInfo}</h3>
        </div>
      </div>
      <div className={classes.groups}>
        <Typography variant="h5" style={{marginBottom: '15px'}}>{groupIDs.length} {groupIDs.length === 1 ? 'group' : 'groups'}</Typography>
        <Grid container spacing={3} style={{borderTop: "5px solid #DCDCDC", borderTopWidth: "thin"}}>
            {groupIDs.map(uid => (
              <GroupCard id={uid}/>
            ))}
        </Grid>
      </div>
    </div>
  );
};

export default OtherProfile;
