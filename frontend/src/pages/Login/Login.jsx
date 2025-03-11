import React, { useState } from 'react';
// import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from "../../context/authContext";
import './login.css';
const Login = () => {
    const [inputs,setInputs]=useState({
        name:"",
        email:"",
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
            setError(err.response.data);
        }
    }

    return (
        <div className="login-container">
        <div className="login-box">
        <div class="split-text-container">
    <span class="text-part left">Welcome</span>
    <span class="text-part right">&nbsp;Back!</span>
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
          
                </div>
                {err && <p>{err.message || err}</p>}
                
            </form>
        </div>
    </div>
    );
};

export default Login;
