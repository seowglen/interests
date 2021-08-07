import React, { useState, useEffect } from 'react';
import "./Header.css";
import img from './logo_navbar (font rasterized).png';
import HomeIcon from '@material-ui/icons/Home';
import PeopleIcon from '@material-ui/icons/People';
import ChatIcon from '@material-ui/icons/Chat';
import { Avatar, IconButton } from '@material-ui/core';
import ForumIcon from '@material-ui/icons/Forum';
// import NotificationsIcon from '@material-ui/icons/Notifications';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import GroupWorkIcon from '@material-ui/icons/GroupWork';
import { Link } from 'react-router-dom';
import { Badge } from '@material-ui/core';
import NotificationsIcon from '@material-ui/icons/Notifications';
import { makeStyles } from '@material-ui/core/styles';
import Popover from '@material-ui/core/Popover';
import Notifications from './Notifications';
import HelpIcon from '@material-ui/icons/Help';

const useStyles = makeStyles(theme => ({
    notifications: {
        width: theme.spacing(3.2),
        height: theme.spacing(3.2),
        color: "gray"
    },
    notificationsActive: {
        width: theme.spacing(3.2),
        height: theme.spacing(3.2),
        color: "#E27B66"
    },
    popHeight: {
        maxHeight: "500px"
    },
    customBadge: {
        backgroundColor: "#E27B66",
        color: "white"
    }
}));

function Header(props) {

    // const [{ user }, dispatch] = useLoginValue();
    const classes = useStyles();
    const [anchorEl, setAnchorEl] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [newNotifications, setNewNotifications] = useState(0);

    async function getNotifications() {
        try {
            const response = await fetch('http://localhost:5000/notifications/', {
                method: "GET",
                headers: {token: localStorage.token}
            });
            
            const parseRes = await response.json();
            setNotifications(parseRes);
            if (parseRes.length !== 0) {
                setNewNotifications(parseRes.filter(notification => notification.seen === false).length)
            }
        } catch (err) {
            console.error(err.message);
        }
    }

    async function makeNotificationsSeen() {
        try {
            const response = await fetch('http://localhost:5000/notifications/see-notifications', {
                method: "POST",
                headers: {
                    token: localStorage.token,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ data: "foo" })
            });
            const parseRes = await response.json();
        } catch (err) {
            console.error(err.message);
        }
    }

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
        if (newNotifications !== 0) {
            makeNotificationsSeen()
            setNewNotifications(0);
        }
    };
    
    const handleClose = () => {
        setAnchorEl(null);
    };

    const open = Boolean(anchorEl);
    const id = open ? 'simple-popover' : undefined;

    useEffect(() => {
        getNotifications();
    }, []);

    return (
        <div className="header">
            <div className="header__left">
                <img src={img} alt=""></img>
                <a href="https://drive.google.com/file/d/100jKlhO0P7Tii9c41ND81MRfdDZ4MNnE/view?usp=sharing" target="_blank" style={{ textDecoration: 'none', color: 'gray' }}>
                    <div className={"header__option"} style={{height: "100%"}}>
                        <HelpIcon />                    
                    </div> 
                </a> 
            </div>
            <div className="header__middle">
                <Link to='/home' style={{ textDecoration: 'none', color: 'gray' }}>
                    <div className={"header__option" + (props.currentPage === 'home' ? ' header__option--active' : '')} style={{height: "100%"}}>
                        <HomeIcon />                    
                    </div> 
                </Link>     
                <Link to='/friends' style={{ textDecoration: 'none', color: 'gray' }}>             
                    <div className={"header__option" + (props.currentPage === 'friends' ? ' header__option--active' : '')} style={{height: "100%"}}>
                        <PeopleIcon />
                    </div>
                </Link> 
                <Link to='/groups' style={{ textDecoration: 'none', color: 'gray' }}>
                    <div className={"header__option" + (props.currentPage === 'groups' ? ' header__option--active' : '')} style={{height: "100%"}}>
                        <GroupWorkIcon />
                    </div>
                </Link>
                <Link to='/forum' style={{ textDecoration: 'none', color: 'gray' }}>
                    <div className={"header__option" + (props.currentPage === 'forum' ? ' header__option--active' : '')} style={{height: "100%"}}>
                        <ChatIcon />
                    </div>
                </Link>
                <Link to='/chat' style={{ textDecoration: 'none', color: 'gray' }}>
                    <div className={"header__option" + (props.currentPage === 'chat' ? ' header__option--active' : '')} style={{height: "100%"}}>
                        <ForumIcon />
                    </div>
                </Link>               
            </div>
            <div className="header__right">
                <div className={"header__option" + (open ? ' header__option--active' : '')} aria-describedby={id} onClick={handleClick}>
                    <Badge
                        anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'right',
                        }}
                        color="secondary"
                        badgeContent={newNotifications}
                        classes={{ badge: classes.customBadge }}
                    >
                        <NotificationsIcon className={open ? classes.notificationsActive : classes.notifications}/>
                    </Badge>
                </div>
                <Popover
                    id={id}
                    open={open}
                    anchorEl={anchorEl}
                    onClose={handleClose}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'left',
                    }}
                    transformOrigin={{
                        vertical: 'top',
                        horizontal: 'left',
                    }}
                    className={classes.popHeight}
                >
                    {notifications.length !== 0 ?
                        <Notifications notifications={notifications} />
                    :
                        <div style={{display: "flex", alignItems:"center", justifyContent: "center", width:"350px", height: "75px"}}>No Notifications Found</div>
                    }
                </Popover>

                <Link to="/profile" style={{ textDecoration: 'none', color: 'black' }}>
                    <div className={"header__option" + (props.currentPage === 'profile' ? ' header__option--active' : '')}>
                        <Avatar src={props.picture}/>
                        <h4>{props.displayName}</h4>        
                    </div>
                </Link>

                <IconButton>
                    <div onClick={(e) => props.logout(e)}>
                        <ExitToAppIcon />
                    </div>
                </IconButton>
            </div>
        </div>        
    );
}

export default Header
