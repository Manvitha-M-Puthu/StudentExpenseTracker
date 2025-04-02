import { createContext, useEffect, useState, useContext } from "react";
import API from "../services/axiosInstance";

export const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(
        JSON.parse(localStorage.getItem("user")) || null
    );

    const login = async (inputs) => {
        try {
            const res = await API.post("/auth/login", inputs, {
                withCredentials: true
            });
            
            // Check if the response has the expected structure
            if (res.data && res.data.user) {
                setCurrentUser(res.data.user);
                localStorage.setItem("user", JSON.stringify(res.data.user));
                return res.data;
            } else if (res.data && res.data.message) {
                throw new Error(res.data.message);
            } else {
                throw new Error("Invalid response from server");
            }
        } catch (error) {
            console.error("Login Error: ", error);
            // Extract the error message from the response if available
            const errorMessage = error.response?.data?.message || error.message || "Login failed";
            throw new Error(errorMessage);
        }
    };

    const logout = async () => {
        try {
            await API.post("/auth/logout", {}, {
                withCredentials: true
            });
        } catch (error) {
            console.error("Logout error: ", error);
        } finally {
            // Always clear local state
            setCurrentUser(null);
            localStorage.removeItem("user");
        }
    };

    // Check authentication status on mount and periodically
    useEffect(() => {
        const checkAuth = async () => {
            if (!currentUser) return;
            
            try {
                const res = await API.get("/auth/check", {
                    withCredentials: true
                });
                if (!res.data || !res.data.success) {
                    setCurrentUser(null);
                    localStorage.removeItem("user");
                }
            } catch (error) {
                console.error("Auth check failed:", error);
                setCurrentUser(null);
                localStorage.removeItem("user");
            }
        };

        checkAuth();
        const interval = setInterval(checkAuth, 5 * 60 * 1000); // Check every 5 minutes

        return () => clearInterval(interval);
    }, [currentUser]);

    return (
        <AuthContext.Provider value={{ login, logout, currentUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthContextProvider");
    }
    return context;
};