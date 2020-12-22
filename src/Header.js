import React from 'react';
import "./Header.css";
import img from './logo_navbar (font rasterized).png';
import HomeIcon from '@material-ui/icons/Home';
import PeopleIcon from '@material-ui/icons/People';
import ChatIcon from '@material-ui/icons/Chat';
import { Avatar, IconButton } from '@material-ui/core';
import ForumIcon from '@material-ui/icons/Forum';
import NotificationsIcon from '@material-ui/icons/Notifications';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import GroupWorkIcon from '@material-ui/icons/GroupWork';


function Header(props) {

    // const [{ user }, dispatch] = useLoginValue();

    return (
        <div className="header">
            <div className="header__left">
                <img src={img} alt=""></img>
            </div>
            <div className="header__middle">
                <div className="header__option header__option--active">
                    <HomeIcon />
                </div>
                <div className="header__option">
                    <PeopleIcon />
                </div>
                <div className="header__option">
                    <GroupWorkIcon />
                </div>
                <div className="header__option">
                    <ForumIcon />
                </div>
                <div className="header__option">
                    <ChatIcon/>
                </div>                
            </div>
            <div className="header__right">
                <div className="header__option">
                    <Avatar />
                    <h4>{props.displayName}</h4>
                </div>

                <IconButton>
                    <NotificationsIcon/>
                </IconButton>

                <IconButton>
                    <ExitToAppIcon />
                </IconButton>
            </div>
        </div>
    );
}

export default Header
