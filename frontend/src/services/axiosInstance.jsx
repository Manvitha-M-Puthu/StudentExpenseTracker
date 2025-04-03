import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8800", // Change to your backend URL
  withCredentials: true, // If using cookies for authentication
  headers: {
    "Content-Type": "application/json",
  },
});

export default API;
