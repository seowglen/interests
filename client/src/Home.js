import React, { useState, useEffect } from 'react';
import './Home.css';
import Header from './Header';
import { Avatar } from '@material-ui/core';
import Post from './Post';

const Home = ({ setAuth }) => {

    const [name, setName] = useState("");
    const [picture, setPicture] = useState(null);
    const [input, setInput] = useState('');

    async function getName() {
        try {
            const response = await fetch('http://localhost:5000/home/', {
                method: "GET",
                headers: {token: localStorage.token}
            });
            
            const parseRes = await response.json();

            if (parseRes[1].profile_name === null) {
                setName(parseRes[0].user_name);
            }
            else {
                setName(parseRes[1].profile_name);
            }
        } catch (err) {
            console.error(err.message);
        }
    }

    async function getPhoto() {
        try {
            await fetch('http://localhost:5000/home/get-photo', {
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

    function handleSubmit(e) {
        e.preventDefault();
        console.log(input);
        setInput("");
    }

    useEffect(() => {
        getName();
        getPhoto();
    }, []);

    return (
        <div>
            <Header displayName={name} setAuth={setAuth} logout={logout} picture={picture} currentPage='home'/>
            <div className="feed">
                <div className="inviteSender">
                    <div className="inviteSender__top">
                        <Avatar src={picture}/>
                        <form>
                            <textarea
                                value={input}
                                onChange={e => setInput(e.target.value)} 
                                className="inviteSender__input" 
                                rows="1" 
                                cols="50" 
                                placeholder={`Write what's on your mind here, ${name}.`}
                            ></textarea>
                            <button onClick={handleSubmit} type="submit">Submit</button>
                        </form>
                    </div>
                </div>
                <Post />
                <Post />
                <Post />     
            </div>
        </div>
        
    )
}

export default Home;