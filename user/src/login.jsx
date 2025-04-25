import axios from "axios";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux"; // Import useDispatch from react-redux
import { setUser } from "./store/authSlice"; // Import setUser action

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch(); // Initialize dispatch function

  const attemptLogin = async (event) => {
    event.preventDefault(); // Prevent page refresh on form submission

    try {
      const response = await axios.post("http://localhost:3000/api/loginapi", {
        email: email,
        password: password,
      });

      setErrorMessage(""); // Clear error message on successful login
      const token = response.data.token;
      console.log(token);

      // Set user in Redux store (assuming user info is available with token)
      dispatch(setUser({ token, email })); // Dispatching user data to Redux

      // Redirect to home page
      navigate("/");

      // Here you would typically store the token if needed
      // localStorage.setItem('token', token); // Example of storing the token
    } catch (error) {
      // Error handling
      if (error.response && error.response.data) {
        if (error.response.data.errors) {
          setErrorMessage(Object.values(error.response.data.errors).join(" "));
        } else if (error.response.data.message) {
          setErrorMessage(error.response.data.message);
        } else {
          setErrorMessage("Failed to login user. Please contact admin");
        }
      } else {
        setErrorMessage("An unexpected error occurred. Please try again.");
      }
    }
  };

  return (
    <div className="container text text-light">
      {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}

      <div className="row justify-content-center">
      <h1 className="text-center mb-4 mt-5">Login</h1>
        <div className="mt-5"></div>
        <div className="mt-5"></div>
        <div className="mt-5"></div>
        <div className="col-md-6">
          <form onSubmit={attemptLogin}>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                className="form-control"
                id="email"
                placeholder="Enter your email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                className="form-control"
                id="password"
                placeholder="Enter your password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-primary btn-block mt-3">
              Submit
            </button>
          </form>
          <div className="mt-3 text-center">
            <Link to="/" className="btn btn-link text-light">
              Go Home
            </Link>
            <Link to="/signup" className="btn btn-link text-light">
              New? Sign Up here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
