


import './Navigation.css';
import * as sessionActions from '../../store/session';

import React from 'react';
import { NavLink } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import ProfileButton from './ProfileButton';

function Navigation({ isLoaded }){
  const sessionUser = useSelector(state => state.session.user);
  const dispatch = useDispatch();

  const logout = (e) => {
    e.preventDefault();
    dispatch(sessionActions.logout());
  };

  let sessionLinks;

  if (sessionUser) {

    sessionLinks = (
      <li>
        <ProfileButton user={sessionUser} />
        <NavLink to="/newSpot"><button>Create a New Spot</button></NavLink>
        {/* <button onClick={logout}>Log Out</button> */}
      </li>
    );

  } else {
    sessionLinks = (
      <li>
        <NavLink to="/login">Log In</NavLink>
        <NavLink to="/signup">Sign Up</NavLink>
      </li>
    );
  }

  return (
    <ul>
      <li>
      <NavLink to='/manageSpots'>Manage Spots</NavLink>
      <NavLink exact to="/">Home</NavLink>
      </li>
      {isLoaded && sessionLinks}
    </ul>
  );
}

export default Navigation;