import React, { useState, useEffect } from 'react';
import Header from './Header';

const Home = ({ setAuth }) => {

    const [name, setName] = useState("");

    async function getName() {
        try {
            const response = await fetch('http://localhost:5000/home/', {
                method: "GET",
                headers: {token: localStorage.token}
            });
            
            const parseRes = await response.json();
            setName(parseRes.user_name);
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
        getName()
    }, []);

    return (
        <div>
            <Header displayName={name}/>
            <h1>Welcome {name}</h1>
            <button onClick={(e) => logout(e)}>Logout</button>
        </div>
        
    )
}

export default Home;