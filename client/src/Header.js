import React from 'react';
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


function Header(props) {

    // const [{ user }, dispatch] = useLoginValue();

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
                <div className="header__option">
                    <ForumIcon />
                </div>
                <div className="header__option">
                    <ChatIcon/>
                </div>                
            </div>
            <div className="header__right">
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
