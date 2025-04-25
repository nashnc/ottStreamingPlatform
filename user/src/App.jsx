import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "./Navbar"; // Assuming you have a Navbar component
import { Link } from "react-router-dom";

function App() {
  const [list, setList] = useState([]);

  // Fetch the top 5 movies on component mount
  useEffect(() => {
    axios
      .get("http://localhost:3000/api/topmovies")
      .then((response) => {
        setList(response.data); // Set the response data to the state
      })
      .catch((error) => {
        console.error("Error fetching top movies:", error);
      });
  }, []);

  return (
    <>
      <Navbar />
      <div className="container mt-4">
        <div className="row" id="imageGallery">
          {list.length === 0 ? (
            <div>Under Maintenance</div>
          ) : (
            list.map((item) => (
              <div
                key={item.id}
                className="col-md-2 mb-4 overflow-hidden text-nowrap  display: block"
              >
                <div className="card">
                  <Link to={`/watch/${item.id}`}>
                    {" "}
                    {/* using Link to pass movieId  */}
                    <img
                      src={`http://localhost:3000/images/${
                        item.imagePath || "default-image.jpg"
                      }`}
                      alt={item.name}
                      className="card-img-top"
                      style={{ cursor: "pointer" }}
                    />
                  </Link>
                  <div className="card-body">
                    <h5 className="card-title">{item.name}</h5>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}

export default App;
