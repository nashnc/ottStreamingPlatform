import axios from "axios";
import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "./Navbar";

// Helper function to get Bearer token from localStorage (consistent with Movies.js)
const getBearerToken = () => {
  const user = JSON.parse(window.localStorage.getItem("user"));
  return user?.token ? `Bearer ${user.token}` : null;
};

function ViewMovie() {
  const { movieId } = useParams();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const videoRef = useRef(null); // Reference for the video element
  const storedMovieId = useRef(null); // Store the movie ID on click
  const [hasLogged10Percent, setHasLogged10Percent] = useState(false); // Flag to track if 10% has been logged
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    setError(null);

    const token = getBearerToken();
    if (!token) {
      navigate("/login"); // throw to home if no token
      return;
    }
    axios
      .get(`http://localhost:3000/api/view_movies/${movieId}`, {
        headers: {
          Authorization: token,
        },
      })
      .then((response) => {
        setMovie(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching movie:", error);
        setError(
          error.response?.data?.message || "Failed to fetch movie details."
        );
        setLoading(false);
      });
  }, [movieId]);

  // Handle video progress tracking (e.g., 10% watched)
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const currentTime = videoRef.current.currentTime;
      const duration = videoRef.current.duration;
      const percentage = (currentTime / duration) * 100;

      // Check if 10% of the video has been watched, and ensure we haven't logged it already
      if (percentage >= 10 && !hasLogged10Percent) {
        console.log("10% of the video watched. Movie ID:", movieId);
        storedMovieId.current = movieId; // Store the movie ID
        setHasLogged10Percent(true); // Set the flag to avoid logging multiple times

        // Send PATCH request to backend to add/update watch history
        const token = getBearerToken();
        if (token) {
          axios
            .patch(
              "http://localhost:3000/api/add_to_watch_history",
              { movieId },
              {
                headers: {
                  Authorization: token,
                },
              }
            )
            .then((response) => {
              console.log("Watch history updated:", response.data);
            })
            .catch((error) => {
              console.error("Error updating watch history:", error);
            });
        }
      }
    }
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="container text-center mt-5">
          <h3>Loading movie details...</h3>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Navbar />
        <div className="container text-center mt-5">
          <h3>{error}</h3>
        </div>
      </div>
    );
  }

  // Mapped data
  const image = `http://localhost:3000/images/${
    movie.imagePath || "default-image.jpg"
  }`;
  const list = {
    movie: movie.name,
    desc: movie.description,
  };
  const video = `http://localhost:3000/videos/${movie.videoPath}`;

  return (
    <>
      <Navbar />
      <div>
        {/* Stretched image as banner with cropping */}
        <img
          src={image}
          alt="Movie"
          className="w-100"
          style={{
            height: "75px",
            objectFit: "cover",
          }}
        />
        <div className="mt-5">
          <div className="row-sm">
            {/* Responsive card using Bootstrap grid */}
            <div className="col-12 col-md-8 col-lg-6 mx-auto">
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  color: "#ffffff",
                  backdropFilter: "blur(10px)",
                  width: "100%", // Full width of the column
                  borderRadius: "5px",
                  backgroundColor: "#11111120", // Translucent black
                  boxShadow: "0 0 8px #ffffff25",
                }}
              >
                <h1 className="mt-3 text-light text-center">{list.movie}</h1>
                <div className="d-flex justify-content-center mt-3">
                  <div className="position-relative w-100 w-md-75 w-sm-100">
                    <video
                      ref={videoRef}
                      controls
                      className="w-100 w-md-75 w-sm-100" // Responsive video width
                      onTimeUpdate={handleTimeUpdate} // Track video progress
                    >
                      <source src={video} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Description outside the card */}
          <div className="row">
            <div className="col-12">
              <p className="mt-3 text-light text-center">{list.desc}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ViewMovie;
