import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import Login from "./login";
import Signup from "./signup";
import Movies from "./movies";
import Watch from "./watch";
import ChangePass from "./changepass";
import Wishlist from "./wish";
import History from "./history";

const router = createBrowserRouter([
  { path: "", element: <App /> },
  { path: "login", element: <Login /> },
  { path: "signup", element: <Signup /> },
  { path: "movies", element: <Movies /> },
  { path: "watch/:movieId", element: <Watch /> },
  { path: "cpass", element: <ChangePass /> },
  { path: "wish", element: <Wishlist /> },
  { path: "history", element: <History /> },
  { path: "history", element: <History /> },
]);

export default router;
