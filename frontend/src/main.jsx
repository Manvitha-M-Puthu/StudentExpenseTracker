
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { AuthContextProvider } from "./context/authContext";
import { StrictMode } from 'react';

createRoot(document.getElementById('root')).render(
  <StrictMode><AuthContextProvider><App /></AuthContextProvider></StrictMode>
)
