import React, { useState } from 'react';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import Link from '@material-ui/core/Link';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import img from './Simplified Logo (font rasterized).png';
import './Login.css';

function Copyright() {
  return (
    <Typography variant="body2" color="textSecondary" align="center">
      {'Copyright © CoFriends'}
      {' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}

const useStyles = makeStyles((theme) => ({
  paper: {
    marginTop: theme.spacing(8),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing(1),
    display: 'flex',
    flexDirection: 'column',
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
    backgroundColor: "#ffb6c1",
    color: "#ffffff",
    "&:hover": {
        backgroundColor: "#f7196e"
    }
  },
}));

export default function Login({ setAuth }) {

  const classes = useStyles();
  const [inputs, setInputs] = useState({
    email: "",
    password: ""
  });
  const [err, setErr] = useState("");

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
        if (response.ok) {
          localStorage.setItem("token", parseRes.token);
          setAuth(true);
        } else {
          setErr(parseRes);
        }
        
    } catch (err) {
        console.error(err.message);
    }
  }

  return (
    <Container maxWidth="xs">
      <CssBaseline />
      <div className={classes.paper}>
        {/* <Avatar className={classes.avatar}>
          <LockOutlinedIcon />
        </Avatar> */}
        <img src={img} alt='' style={{objectFit: "contain", height: "100px", marginBottom: "25px"}}></img>
        <Typography component="h1" variant="h5">
          Login
        </Typography>
        {err &&
          <div>
            <h3 style={{marginBottom: '0px', display: 'flex', justifyContent: 'center', backgroundColor: '#d75b60', color: 'white'}}>
              ERROR: {err}    
            </h3>
          </div> 
        }
        <form className="login__form" noValidate onSubmit={onSubmitForm}>
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            value={email}
            autoComplete="email"
            autoFocus
            onChange={e => onChange(e)}
          />
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            name="password"
            value={password}
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            onChange={e => onChange(e)}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            // color="primary"
            className={classes.submit}
          >
            Sign In
          </Button>
          <Grid container style={{justifyContent: "space-between"}}>
            {/* <Grid item xs>
              <Link href="#" variant="body2">
                Forgot password?
              </Link>
            </Grid> */}
            <Grid item>
              <Link href="/register" variant="body2">
                {"Register here"}
              </Link>
            </Grid>
            <Grid item>
              <Link href="https://drive.google.com/file/d/100jKlhO0P7Tii9c41ND81MRfdDZ4MNnE/view?usp=sharing" target="_blank" variant="body2">
                {"New here? Click me"}
              </Link>
            </Grid>
          </Grid>
        </form>
      </div>
      <Box mt={8}>
        <Copyright />
      </Box>
    </Container>
  );
}