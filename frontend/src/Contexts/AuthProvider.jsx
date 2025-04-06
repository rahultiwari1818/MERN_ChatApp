import React, { createContext, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Create Auth Context
const AuthContext = createContext();

// AuthProvider Component
export default function AuthProvider({ children }) {
    const [user, setUser] = useState(null); // To store authenticated user data
    const navigate = useNavigate();
    // Login function
    const login = async (token, userData) => {

        try {
            localStorage.setItem("token", token);
            setUser(userData);
            navigate("/chat");
        }
        catch (er) {
            console.log(er);
        }
    };

    // Logout function
    const logout = () => {
        navigate("/");
        localStorage.removeItem("token");
        
        setUser(null);
    };

    // Check if user is authenticated
    const isAuthenticated = !!localStorage.getItem("token");

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

// Custom Hook for Using Auth Context
export const useAuth = () => {
    return useContext(AuthContext);
};
