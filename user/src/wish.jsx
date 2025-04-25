import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom"; // Updated imports

import Navbar from "./Navbar";
import WishButton from "./WishButton";
import "./disable.css"; // Assuming your CSS is correctly imported

const getBearerToken = () => {
  const user = JSON.parse(window.localStorage.getItem("user"));
  return user?.token ? `Bearer ${user.token}` : null;
};

const Wishlist = () => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getBearerToken();
    if (!token) {
      setLoading(false);
      return;
    }

    axios
      .get("http://localhost:3000/api/retrieve_user_wishlist", {
        headers: { Authorization: token },
      })
      .then((response) => {
        const wishlistData = response.data.data;
        setWishlist(wishlistData);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching wishlist:", error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div>Loading wishlist...</div>;
  }

  return (
    <>
      <Navbar />
      <div className="container mt-4">
        <div className="row" id="imageGallery">
          {wishlist.length === 0 ? (
            <div>Your wishlist is empty. Start adding some movies!</div>
          ) : (
            wishlist.map((item) => {
              const imageClass = item.canSee ? "" : "disabled-link";
              const cardClass = item.canSee ? "" : "disabled";

              return (
                <div key={item.id} className="col-md-4 mb-4">
                  <div
                    className={`card ${cardClass}`}
                 
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
                      <WishButton movieId={item.id} />
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

export default Wishlist;
