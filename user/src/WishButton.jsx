import React, { useState, useEffect } from "react";
import axios from "axios";

const getBearerToken = () => {
  const user = JSON.parse(window.localStorage.getItem("user"));
  return user?.token ? `Bearer ${user.token}` : null;
};

const WishButton = ({ movieId }) => {
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch the user's wishlist when the component mounts
  useEffect(() => {
    const token = getBearerToken();
    if (!token) {
      setLoading(false);
      return;
    }

    // Fetch the wishlist data from the backend
    axios
      .get("http://localhost:3000/api/retrieve_user_wishlist", {
        headers: { Authorization: token },
      })
      .then((response) => {
        const wishlist = response.data.data; // Array of movies in the wishlist
        const movieExists = wishlist.some(
          (movie) => movie.id.toString() === movieId.toString()
        );
        setIsInWishlist(movieExists);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching wishlist:", error);
        setLoading(false);
      });
  }, [movieId]);

  const handleAddToWishlist = async () => {
    const token = getBearerToken();
    if (!token) {
      alert("You must be logged in to add to wishlist");
      return;
    }

    try {
      const response = await axios.patch(
        "http://localhost:3000/api/toggle_movie_wishlist",
        { movieId },
        {
          headers: {
            Authorization: token,
          },
        }
      );
      setIsInWishlist(!isInWishlist); // Toggle the status
      alert(response.data.message); // Show success message
    } catch (error) {
      console.error("Error updating wishlist:", error);
      alert("Failed to update wishlist. Please try again.");
    }
  };

  return (
    <button
      className={`btn btn-sm mt-auto ${
        loading ? "btn-secondary" : isInWishlist ? "btn-danger" : "btn-success"
      }`}
      onClick={handleAddToWishlist}
      disabled={loading} // Disable the button while loading
    >
      {loading
        ? "Loading..."
        : isInWishlist
        ? "Remove from Wishlist"
        : "Add to Wishlist"}
    </button>
  );
};

export default WishButton;
