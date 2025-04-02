import React, { useState } from 'react';
// import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from "../../context/authContext";
import './login.css';
const Login = () => {

    const [inputs,setInputs]=useState({
        name:"",
        password:"",
    })

    const [err,setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleChange = e =>{
        setInputs(prev=>({...prev,[e.target.name]:e.target.value}))
        // Clear error when user starts typing
        if (err) setError(null);
    }
    
    const {login} = useContext(AuthContext);

    const handleSubmit = async(e)=>{
        e.preventDefault();
        setLoading(true);
        setError(null);

        try{
            await login(inputs);
            navigate("/");
        }catch(err){
            console.error("Login error:", err);
            setError(err.message || "Login failed. Please check your credentials and try again.");
        }finally{
            setLoading(false);
        }
    }

    return (
        <div className="login-container">
        <div className="login-box">
        <div className="split-text-container">
    <span className="text-part left">Welcome</span>
    <span className="text-part right">&nbsp;Back!</span>
</div>
            <p className="subtitle">Please sign in to your account</p>
            <form onSubmit={handleSubmit} className="login-form">
                <div className="form-group">
                <input type="text" placeholder="User Name" name="name" onChange={handleChange} value={inputs.name} required />
                </div>
                <div className="form-group">
                <input type="password" placeholder="Password" name="password" onChange={handleChange} value={inputs.password} required /> </div>
                <div className="button">
                <button type="submit" onClick={handleSubmit} className="btn btn-border-reveal login-button" disabled={loading}>
                    {loading ? 'Logging in...' : 'Log In'}
                </button>
                <p>Not a user? <span><Link to="/register">Register</Link></span></p>
                </div>
                {err && <div className="error-message">{err}</div>}
                
            </form>
        </div>
    </div>
    );
};

export default Login;
