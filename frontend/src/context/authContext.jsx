import { createContext, useEffect, useState, useContext } from "react";
import axios from "axios";
import API from "../services/axiosInstance";

export const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(
        JSON.parse(localStorage.getItem("user")) || null
    );

    const login = async (inputs) => {
        try{const res = await API.post("/auth/login", inputs,{
            withCredentials:true
        });
        setCurrentUser(res.data);
        localStorage.setItem("user", JSON.stringify(res.data));
        }catch(error){
            console.error("Login Error: ",error);
            throw error;
        }
    };

    const logout = async () => {

        try{
            await API.post("/auth/logout",{},{
                withCredentials:true
        });
            setCurrentUser(null);
            localStorage.removeItem("user");
        }catch(error){
            console.error("Logout error: ",error);
            throw error;
        }
       
    };
    useEffect(() => {
        const user = JSON.parse(localStorage.getItem("user"));
        if (user) {
            setCurrentUser(user);
        }
    }, []);

    useEffect(() => {
        localStorage.setItem("user", JSON.stringify(currentUser));
    }, [currentUser]);

    return (
        <AuthContext.Provider value={{ login, logout, currentUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () =>{
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthContextProvider");
    }
    return context;
}