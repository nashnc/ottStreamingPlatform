import React, { useState } from "react";
import Navbar from "./Navbar";
import axios from "axios";

// Function to retrieve the Bearer token from localStorage
const getBearerToken = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  return user?.token ? `Bearer ${user.token}` : null;
};

const ChangePass = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate if new password and confirm password match
    if (newPassword !== confirmPassword) {
      setErrorMessage("New password and confirmation password don't match.");
      return;
    }

    try {
      // Send PATCH request to the backend API to change the password
      const response = await axios.patch(
        "http://localhost:3000/api/changpwordapi",
        {
          password: currentPassword,
          newPassword,
          confirmNewPassword: confirmPassword,
        },
        {
          headers: {
            Authorization: getBearerToken(), // Use the getBearerToken helper
          },
        }
      );

      // Handle successful response
      setSuccessMessage(response.data.message);
      setErrorMessage(""); // Clear any error messages
      // Clear form fields after successful submission
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      // Handle error response
      setErrorMessage(
        error.response ? error.response.data.message : "Something went wrong!"
      );
      setSuccessMessage(""); // Clear any success messages
    }
  };

  // Handle the cancel button action (reset form fields)
  const handleCancel = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setErrorMessage("");
    setSuccessMessage("");
  };

  return (
    <>
      <Navbar />

      <div className="container mt-5">
        <h2>Change Password</h2>
        <div className="row">
          <div className="col-sm-3"></div>
          <div className="col-sm-6">
            <form onSubmit={handleSubmit}>
              {/* Display error and success messages */}
              {errorMessage && (
                <div className="alert alert-danger">{errorMessage}</div>
              )}
              {successMessage && (
                <div className="alert alert-success">{successMessage}</div>
              )}

              <div className="mb-3">
                <label htmlFor="currentPassword" className="form-label">
                  Current Password
                </label>
                <input
                  type="password"
                  className="form-control"
                  id="currentPassword"
                  placeholder="Enter your current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <label htmlFor="newPassword" className="form-label">
                  New Password
                </label>
                <input
                  type="password"
                  className="form-control"
                  id="newPassword"
                  placeholder="Enter your new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <label htmlFor="confirmPassword" className="form-label">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  className="form-control"
                  id="confirmPassword"
                  placeholder="Confirm your new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <div className="d-flex justify-content-between">
                <button type="submit" className="btn btn-primary">
                  Submit
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleCancel}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
          <div className="col-sm-3"></div>
        </div>
      </div>
    </>
  );
};

export default ChangePass;
