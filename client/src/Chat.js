import React, { useState, useEffect } from 'react';
import './Chat.css';
import Header from './Header';
import ChatRoom from './ChatRoom';

const Chat = ({ setAuth }) => {

    const [userName, setUserName] = useState('');
    const [picture, setPicture] = useState(null);
    const [groups, setGroups] = useState([]);
    const [room, setRoom] = useState('');
    const [toggle, setToggle] = useState(false);

    const toggleChat = bool => {
        setToggle(bool)
    };

    async function getDetails() {
        try {
            const response = await fetch('http://localhost:5000/chat/get-details', {
                method: "GET",
                headers: {token: localStorage.token}
            });
            
            const parseRes = await response.json();
            setUserName(parseRes.profile_name);
            // setPicture(parseRes.profile_picture);
            // setInfo(parseRes.profile_info);
        } catch (err) {
            console.error(err.message);
        }
    }

    async function getPhoto() {
        try {
            await fetch('http://localhost:5000/chat/get-photo', {
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

    useEffect(() => {
        getDetails();
        getPhoto();
    }, []);

    const logout = (e) => {
        e.preventDefault();
        localStorage.removeItem("token");
        setAuth(false);
    }

    function handleClick() {
        toggleChat(true);
    }

    return (
        <div>
            <Header displayName={userName} picture={picture} setAuth={setAuth} logout={logout} currentPage='chat'/>
            <div className="joinOuterContainer">
                <div className="joinInnerContainer">
                    {!toggle ? 
                        <div className="chatIntro">
                            <h1>This is the Chat page</h1>
                            <div>
                                <input placeholder="Room" className="joinInput" type="text" onChange={(e) => setRoom(e.target.value)} />
                            </div>
                            <button className="button mt-20" type="submit" onClick={handleClick}>Join Room</button>
                        </div>
                    :
                        <ChatRoom roomName={room} userName={userName} toggleChat={toggleChat}/>
                    }
                </div>
            </div>
        </div>
    )
}

export default Chat;