import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "./Navbar";
import { setUserFromLocalStorage } from "./store/authSlice";
import WishButton from "./WishButton";

const getBearerToken = () => {
  const user = JSON.parse(window.localStorage.getItem("user"));
  return user?.token ? `Bearer ${user.token}` : null;
};

const Movies = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    dispatch(setUserFromLocalStorage());

    const token = getBearerToken();
    if (!token) {
      navigate("/"); // throw to home if no token
      return;
    }
    if (token) {
      setLoading(true);
      fetch("http://localhost:3000/api/retrieve_movie_api", {
        headers: {
          Authorization: token,
        },
      })
        .then((response) => response.json())
        .then((data) => {
          setMovies(data.data);
          setLoading(false);
        })
        .catch((err) => {
          setError("Failed to fetch movies");
          setLoading(false);
          console.error("Fetch error:", err);
        });
    }
  }, [dispatch, navigate]);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredMovies = (movies || [])
    .filter((movie) => movie?.canSee)
    .filter((movie) =>
      movie?.name?.toLowerCase().includes((searchTerm || "").toLowerCase())
    );

  const handleAddToWishlist = (movieId) => {
    // checking
    console.log("Added to wishlist", movieId);
  };

  return (
    <div>
      <Navbar />
      <div className="row"></div>
      <div className="container mt-1">
        <div className="row">
          <h1 className="my-4 text-light">Movie List</h1>
          <form className="d-flex mb-4" onSubmit={(e) => e.preventDefault()}>
            <input
              type="text"
              className="form-control me-2"
              placeholder="Search movies..."
              value={searchTerm}
              onChange={handleSearchChange}
            />
            <button type="submit" className="btn btn-primary">
              Search
            </button>
          </form>
          {loading && <div className="alert alert-info">Loading...</div>}
          {error && <div className="alert alert-danger">{error}</div>}
          <div className="row">
            {filteredMovies.length > 0 ? (
              filteredMovies.map((movieItem, index) => (
                <div className="col-md-4 mb-4" key={index}>
                  <div className="card h-100 shadow-sm">
                    <Link to={`/watch/${movieItem.id}`}>
                      {/* using Link to pass movieId */}
                      <img
                        src={`http://localhost:3000/images/${
                          movieItem.imagePath || "default-image.jpg"
                        }`}
                        alt={movieItem.name}
                        className="card-img-top"
                        style={{
                          cursor: "pointer",
                          height: "300px",
                          objectFit: "cover",
                        }}
                      />
                    </Link>
                    <div className="card-body d-flex flex-column justify-content-between">
                      <h5 className="card-title">{movieItem.name}</h5>
                      <WishButton movieId={movieItem.id} />
                      {/* passing  movieId to WishButton */}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-12">
                <p>No movies found matching your search.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Movies;
