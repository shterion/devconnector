import axios from 'axios';
import setAuthToken from '../utils/setAuthToken';
import jwt_decode from 'jwt-decode';


import {
  GET_ERRORS, SET_CURRENT_USER
} from './types';

// Register User
export const registerUser = (userData, history) => async dispatch => {

  // axios
  //   .post('/api/users/register', userData)
  //   .then(res => history.push('/login'))
  //   .catch(err =>
  //     dispatch({
  //       type: GET_ERRORS,
  //       payload: err.response.data
  //     })
  //   );

  try {
    await axios.post('/api/users/register', userData);
    history.push('/login');
  } catch (e) {
    dispatch({
      type: GET_ERRORS,
      payload: e.response.data
    });
  }
};

// Login - Get User token
export const loginUser = (userData) => async dispatch => {
  try {
    const user = await axios.post('/api/users/login', userData);
    // Save to local storage
    const { token } = user.data;
    // Set token to localstorage
    localStorage.setItem('jwt', token);
    // Set token to Auth header
    setAuthToken(token);
    // Decode token to get user data
    const decoded = jwt_decode(token);
    // Set current user
    dispatch(setCurrentUser(decoded));
  } catch (e) {
    dispatch({
      TYPE: GET_ERRORS,
      payload: e.response.data
    });
  }
};

// Set current logged in user
export const setCurrentUser = (decoded) => {
  return {
    type: SET_CURRENT_USER,
    payload: decoded
  }
};