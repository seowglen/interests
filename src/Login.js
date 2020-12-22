import React, { useState } from 'react';
import { Link } from "react-router-dom";
import img from './Simplified Logo (font rasterized).png';
import './Login.css';
import { Button } from '@material-ui/core';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';

const Login = ({ setAuth }) => {

    const [inputs, setInputs] = useState({
        email: "",
        password: ""
    });

    const {email, password} = inputs;

    const onChange = (e) => {
        setInputs({ ...inputs, [e.target.name]: e.target.value});
    };

    const onSubmitForm = async (e) => {
        e.preventDefault()
        const body = {email, password};
        try {
            const response = await fetch("http://localhost:5000/auth/login", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(body)
            })
            
            const parseRes = await response.json();
            localStorage.setItem("token", parseRes.token);
            setAuth(true);
        } catch (err) {
            console.error(err.message);
        }
    }

    return (
        <div className="login">
            <div className='login__logo'>
                <img src={img} alt=''></img>
            </div>
            <form onSubmit={onSubmitForm}>
                <Typography component="h1" variant="h5">
                    Login
                </Typography>
                <TextField variant="outlined" margin="normal" required fullWidth autoFocus type="email" name="email" placeholder="email" value={email} onChange={e => onChange(e)} />
                <TextField variant="outlined" margin="normal" required fullWidth type="password" name="password" placeholder="password" value={password} onChange={e => onChange(e)}/>
                <Button fullWidth variant="contained" type="submit">Login</Button>
            </form>
            <Button fullWidth variant="contained">
                <Link to="/register">Register</Link>
            </Button>
        </div>        
    )
}

export default Login;