import { useEffect, useState } from "react";
import { loadStoredToken, clearAuthToken } from "./lib/api";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const token = loadStoredToken();
    if (token) setLoggedIn(true);
  }, []);

  function handleLogout() {
    clearAuthToken();
    setLoggedIn(false);
  }

  return loggedIn ? (
    <Dashboard onLogout={handleLogout} />
  ) : (
    <Login onLoggedIn={() => setLoggedIn(true)} />
  );
}