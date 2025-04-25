import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { NavLink, useNavigate } from "react-router-dom";
import { removeUser } from "./store/authSlice";

function Navbar() {
  const user = useSelector((store) => store.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Logout function
  function logout() {
    if (user) {
      axios
        .post(
          " http://localhost:3000/api/logoutapi",
          {},
          {
            headers: { Authorization: "Bearer " + user.token },
          }
        )
        .then((response) => {
          if (response.status === 200) {
            dispatch(removeUser());
            navigate("/login");
          }
        })
        .catch((error) => {
          console.error("Logout failed: ", error);
        });
    }
  }

  return (
    <nav
      className="navbar navbar-expand-md navbar-dark"
      style={{ backgroundColor: "#111823" }}
    >
      <div className="container-fluid">
        <div className="navbar-brand">
          <h4>OotY fliX</h4>
        </div>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto" style={{ color: "#ffffff" }}>
            {/* <li className="nav-item">
              <NavLink
                to="/"
                className={({ isActive }) =>
                  "nav-link " + (isActive ? "active" : "")
                }
              >
                Home
              </NavLink>
            </li> */}
            {!user && (
              <>
                <li className="nav-item">
                  <NavLink
                    to="/login"
                    className={({ isActive }) =>
                      "nav-link " + (isActive ? "active" : "")
                    }
                  >
                    Login
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink
                    to="/signup"
                    className={({ isActive }) =>
                      "nav-link " + (isActive ? "active" : "")
                    }
                  >
                    Sign up
                  </NavLink>
                </li>
              </>
            )}
            {user && (
              <>
                <li className="nav-item">
                  <NavLink
                    to="/movies"
                    className={({ isActive }) =>
                      "nav-link " + (isActive ? "active" : "")
                    }
                  >
                    Movies
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink
                    to="/cpass"
                    className={({ isActive }) =>
                      "nav-link " + (isActive ? "active" : "")
                    }
                  >
                    Change Password
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink
                    to="/wish"
                    className={({ isActive }) =>
                      "nav-link " + (isActive ? "active" : "")
                    }
                  >
                    Wishlist
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink
                    to="/history"
                    className={({ isActive }) =>
                      "nav-link " + (isActive ? "active" : "")
                    }
                  >
                    History
                  </NavLink>
                </li>
                <li className="nav-item">
                  <span className="nav-link" onClick={logout}>
                    Logout
                  </span>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
