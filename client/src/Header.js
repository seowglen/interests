import React, { useState } from 'react';
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

const useStyles = makeStyles(theme => ({
    notifications: {
        width: theme.spacing(3.2),
        height: theme.spacing(3.2),
        color: "gray"
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

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    
    const handleClose = () => {
        setAnchorEl(null);
    };

    const open = Boolean(anchorEl);
    const id = open ? 'simple-popover' : undefined;

    return (
        <div className="header">
            <div className="header__left">
                <img src={img} alt=""></img>
            </div>
            <div className="header__middle">
                <div className={"header__option" + (props.currentPage === 'home' ? ' header__option--active' : '')}>
                    <Link to='/home' style={{ textDecoration: 'none', color: 'gray' }}>
                        <HomeIcon />
                    </Link>
                </div>                    
                <div className={"header__option" + (props.currentPage === 'friends' ? ' header__option--active' : '')}>
                    <Link to='/friends' style={{ textDecoration: 'none', color: 'gray' }}>
                        <PeopleIcon />
                    </Link>
                </div>
                <div className={"header__option" + (props.currentPage === 'groups' ? ' header__option--active' : '')}>
                    <Link to='/groups' style={{ textDecoration: 'none', color: 'gray' }}>
                        <GroupWorkIcon />
                    </Link>
                </div>
                <div className={"header__option" + (props.currentPage === 'forum' ? ' header__option--active' : '')}>
                    <Link to='/forum' style={{ textDecoration: 'none', color: 'gray' }}>
                        <ChatIcon />
                    </Link>
                </div>
                <div className={"header__option" + (props.currentPage === 'chat' ? ' header__option--active' : '')}>
                    <Link to='/chat' style={{ textDecoration: 'none', color: 'gray' }}>
                        <ForumIcon />
                    </Link>
                </div>               
            </div>
            <div className="header__right">
                <div className="header__option" aria-describedby={id} onClick={handleClick}>
                    <Badge
                        anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'right',
                        }}
                        color="secondary"
                        badgeContent={2}
                        classes={{ badge: classes.customBadge }}
                    >
                        <NotificationsIcon className={classes.notifications}/>
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
                    <Notifications />
                    <Notifications />
                    <Notifications />
                    <Notifications />
                    <Notifications />
                    <Notifications />
                    <Notifications />
                    <Notifications />
                    <Notifications />
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
