import React, { useState, useEffect } from 'react';
import './Home.css';
import Header from './Header';
import { Avatar } from '@material-ui/core';
import Post from './Post';

const Home = ({ setAuth }) => {

    const [name, setName] = useState("");
    const [picture, setPicture] = useState(null);
    const [input, setInput] = useState('');
    const [postIDs, setPostIDs] = useState([]);
    const [category, setCategory] = useState('');
    const [groupNames, setGroupNames] = useState([]);
    const [placeholder, setPlaceHolder] = useState(null);

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

            setGroupNames(parseRes[2].group_names);
            setCategory(parseRes[2].group_names[0]);

        } catch (err) {
            console.error(err.message);
        }
    }

    async function getPostIDs() {
        try {
            const response = await fetch('http://localhost:5000/home/get-posts', {
                method: "GET",
                headers: {token: localStorage.token}
            });
            
            const parseRes = await response.json();
            setPostIDs(parseRes.arr);

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

    async function createPost(data, group_name) {
        try {
            const response = await fetch('http://localhost:5000/home/create-post', {
                method: "POST",
                headers: {
                    token: localStorage.token,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ 
                    post: data,
                    group: group_name 
                })
            });
            const parseRes = await response.json();
            setPostIDs([parseRes.new_post_id.post_id, ...postIDs])
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
        console.log(category);
        console.log(typeof(category));
        if (input === '') {
            setPlaceHolder('ERROR: Please do not leave your post blank!');
        } else if (category == null) {
            setPlaceHolder('ERROR: You do not have any groups joined, join a group first!');
        } else {
            createPost(input, category);
            setPlaceHolder(null);
        }
        setInput("");
    }

    function handleCategoryChange(category) {
        console.log(category)
        setCategory(category);
    }

    function deletePostId(post_id) {
        setPostIDs(postIDs.filter(postID => postID !== post_id));
    }

    useEffect(() => {
        getName();
        getPhoto();
        getPostIDs();
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
                                placeholder={placeholder ? `${placeholder}` : `Post an invite, or write what's on your mind here, ${name}.`}
                            ></textarea>
                            
                            <select value={category} onChange={e => handleCategoryChange(e.target.value)}>
                                {groupNames.map(item => (
                                    <option>{item}</option>
                                ))}
                            </select>
                            
                            <button onClick={handleSubmit} type="submit">Submit</button>
                        </form>
                    </div>
                </div>
                {postIDs.map(uid => (
                    <Post id={uid} picture={picture} name={name} deletePostId={deletePostId}/>
                ))}    
            </div>
        </div>
        
    )
}

export default Home;