import React, { useState, useEffect } from 'react';
import './App.css';

import {BrowserRouter as Router, Switch, Route, Redirect} from 'react-router-dom';
import Home from './Home';
import Login from './Login';
import Register from './Register';
import Profile from './Profile';
import Friends from './Friends';
import OtherProfile from './OtherProfile';
import Groups from './Groups';
import GroupProfile from './GroupProfile';
import Chat from './Chat';

function App() {

  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const setAuth = bool => {
    setIsAuthenticated(bool)
  };

  async function isAuth() {
    try {
      const response = await fetch("http://localhost:5000/auth/is-verify", {
        method: "GET",
        headers: {token: localStorage.token }
      });
      const parseRes = await response.json()
      
      parseRes === true ? setIsAuthenticated(true) : setIsAuthenticated(false);
    } catch (err) {
      console.error(err.message);
    }
  }

  // this is a test

  useEffect(() =>  {
    isAuth()
  }, []);

  return (
    <Router>
      <Switch>
        <Route exact path='/' render={props => !isAuthenticated ? <Login {...props} setAuth={setAuth} /> : <Redirect to='./home'/>}/>
        <Route exact path='/login' render={props => !isAuthenticated ? <Login {...props} setAuth={setAuth}/> : <Redirect to='./home'/>}/>
        <Route exact path='/register' render={props => !isAuthenticated ? <Register {...props} setAuth={setAuth}/> : <Redirect to='./login'/>}/>
        <Route exact path='/home'render={props => isAuthenticated ? <Home {...props} setAuth={setAuth}/> : <Redirect to='./login' />}/>
        <Route exact path='/profile' render={props => isAuthenticated ? <Profile {...props} setAuth={setAuth}/> : <Redirect to='./login'/>}/>
        <Route exact path='/friends' render={props => isAuthenticated ? <Friends {...props} setAuth={setAuth}/> : <Redirect to='./login'/>}/>
        <Route exact path='/otherProfile' render={props => isAuthenticated ? <OtherProfile {...props} setAuth={setAuth}/> : <Redirect to='./login'/>}/>
        <Route exact path='/groups' render={props => isAuthenticated ? <Groups {...props} setAuth={setAuth}/> : <Redirect to='./login'/>}/>
        <Route exact path='/groupProfile' render={props => isAuthenticated ? <GroupProfile {...props} setAuth={setAuth}/> : <Redirect to='./login'/>}/>
        <Route exact path='/chat' render={props => isAuthenticated ? <Chat {...props} setAuth={setAuth}/> : <Redirect to='./login'/>}/>
      </Switch>
    </Router>
  );
}

export default App;
