import React, { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "./Navbar";
import { useNavigate, Link } from "react-router-dom"; //

// Function to get the Bearer token from localStorage
const getBearerToken = () => {
  const user = JSON.parse(window.localStorage.getItem("user"));
  return user?.token ? `Bearer ${user.token}` : null;
};

const History = () => {
  const [list, setList] = useState([]); // State to hold the movie data
  const [error, setError] = useState(null); // State to hold error messages

  useEffect(() => {
    // Fetch the data when the component mounts
    const token = getBearerToken(); // Get the token

    if (!token) {
      setError("User not authenticated");
      return; // Exit if no token is found
    }

    // Make the API call with the Bearer token
    axios
      .get("http://localhost:3000/api/retrieve_user_watched", {
        headers: {
          Authorization: token, // Add the token to the Authorization header
        },
      })
      .then((response) => {
        // Log the response to inspect the data structure
        console.log("API Response:", response);

        // Check if data exists in response
        if (response.data && response.data.data) {
          setList(response.data.data); // Set the movie data to state
        } else {
          setError("No data found in response");
        }
      })
      .catch((error) => {
        console.error("Error fetching data", error);
        setError("Failed to fetch data from the server");
      });
  }, []); // Empty dependency array ensures this runs only once when the component mounts

  // If error exists, display it
  if (error) {
    return <div>{error}</div>;
  }

  return (
    <>
      <Navbar />
      <div className="container">
        <div className="row" id="imageGallery">
          {list.length === 0 ? (
            <div>Your wishlist is empty. Start adding some movies!</div>
          ) : (
            list.map((item) => {
              const imageClass = item.canSee ? "" : "disabled-link";
              const cardClass = item.canSee ? "" : "disabled";

              return (
                <div key={item.id} className="col-md-4 mb-4">
                  <div
                    className={`card ${cardClass}`}
                    style={{ maxWidth: "230px", marginBottom: "20px" }}
                  >
                    <Link
                      to={item.canSee ? `/watch/${item.id}` : "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={imageClass}
                      style={{
                        position: "relative",
                        display: "block",
                        overflow: "hidden",
                      }}
                    >
                      <img
                        src={`http://localhost:3000/images/${
                          item.imagePath || "default-image.jpg"
                        }`}
                        alt={item.name}
                        style={{
                          width: "100%",
                          height: "200px",
                          objectFit: "cover",
                        }}
                      />
                      {/* Disabled Overlay */}
                      {!item.canSee && (
                        <div className="card-img-overlay">
                          <div className="disabled-text">Disabled</div>
                        </div>
                      )}

                      {/* Red Diagonal Overlays for disabled images */}
                      {!item.canSee && (
                        <>
                          <div className="red-diagonal-1"></div>
                          <div className="red-diagonal-2"></div>
                        </>
                      )}
                    </Link>
                    <div className="card-body">
                      <h5 className="card-title">{item.name}</h5>
                      <b>
                        Last Watched{" "}
                        {new Date(item.watchedOn).toLocaleDateString("en-GB")}
                      </b>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
};

export default History;
