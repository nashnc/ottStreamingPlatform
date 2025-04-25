import axios from "axios";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConf, setPasswordConf] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  function registerUser(e) {
    e.preventDefault(); // Prevent form reload

    // Check for empty fields
    if (!name || !email || !password || !passwordConf) {
      setErrorMessage("All fields are required.");
      return;
    }

    // Check if passwords match
    if (password !== passwordConf) {
      setErrorMessage("Passwords do not match");
      return;
    }

    const user = {
      name,
      email,
      password,
      confirmPassword: passwordConf,
    };

    axios
      .post("http://localhost:3000/api/signupapi", user)
      .then((response) => {
        setErrorMessage("");
        navigate("/login"); // Redirect to the login page after success
      })
      .catch((error) => {
        console.error("Error response:", error.response); // Log error for debugging
        if (error.response?.data?.message) {
          setErrorMessage(error.response.data.message); // Handle password mismatch or email already taken
        } else if (error.response?.data?.error) {
          // This will handle validation errors
          setErrorMessage(Object.values(error.response.data.error).join(" "));
        } else if (error.message.includes("Network Error")) {
          setErrorMessage(
            "Network error. Please check your server or internet connection."
          );
        } else {
          setErrorMessage("Failed to connect to API. Please try again.");
        }
      });
  }

  return (
    
    <div className="container ">
      
      <div className="row justify-content-center text text-light">
      <h1 className="text-center mb-4 text text-light mt-5">Sign Up</h1>
        <div className="mt-5"></div>
        <div className="mt-5"></div>
        <div className="mt-5"></div>
        <div className="col-md-6">
          <form onSubmit={registerUser}>
            {errorMessage && (
              <div className="alert alert-danger">{errorMessage}</div>
            )}
            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                className="form-control"
                placeholder="Enter your Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                className="form-control"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                className="form-control"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Confirm Password</label>
              <input
                type="password"
                className="form-control"
                placeholder="Confirm your password"
                value={passwordConf}
                onChange={(e) => setPasswordConf(e.target.value)}
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
            <Link to="/login" className="btn btn-link text-light">
              Already have an account? Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
