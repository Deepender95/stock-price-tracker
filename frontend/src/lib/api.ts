import axios from "axios";

const API_BASE = "http://localhost:4000/api";

export const api = axios.create({ baseURL: API_BASE });

export function setAuthToken(token: string) {
  api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  localStorage.setItem("token", token);
}

export function loadStoredToken() {
  const token = localStorage.getItem("token");
  if (token) setAuthToken(token);
  return token;
}

export function clearAuthToken() {
  delete api.defaults.headers.common["Authorization"];
  localStorage.removeItem("token");
}