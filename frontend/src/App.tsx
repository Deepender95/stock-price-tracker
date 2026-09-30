import { useEffect, useState } from "react";
import { loadStoredToken } from "./lib/api";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const token = loadStoredToken();
    if (token) setLoggedIn(true);
  }, []);

  return loggedIn ? <Dashboard /> : <Login onLoggedIn={() => setLoggedIn(true)} />;
}
