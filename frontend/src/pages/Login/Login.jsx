import React, { useState } from 'react';
// import axios from 'axios';
import { useNavigate,Link } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from "../../context/AuthContext";
import './login.css';
const Login = () => {

    const [inputs,setInputs]=useState({
        name:"",
        password:"",
    })

    const [err,setError] = useState(null);

    const navigate = useNavigate();

    const handleChange = e =>{
        setInputs(prev=>({...prev,[e.target.name]:e.target.value}))
    }
    
    const {login} = useContext(AuthContext);

    const handleSubmit = async(e)=>{
        e.preventDefault();
        try{
            await login(inputs);
            navigate("/");
        }catch(err){
            setError(err.response?.data||"Something Went Wrong!");
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
                <input type="name" placeholder="User Name" name="name" onChange={handleChange} required />
                </div>
                <div className="form-group">
                <input type="password" placeholder="Password" name="password" onChange={handleChange} required /> </div>
                <div className="button">
                <button type="submit" onClick={handleSubmit} className="btn btn-border-reveal login-button">Log In</button>
                <p>Not a user? <span><Link to="/register">Register</Link></span></p>
                </div>
                {err && <p>{err.message || err}</p>}
                
            </form>
        </div>
    </div>
    );
};

export default Login;
