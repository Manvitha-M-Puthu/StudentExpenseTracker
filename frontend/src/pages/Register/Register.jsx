import React from "react";
import {Link, useNavigate} from "react-router-dom";
import {useState} from "react";
import './register.css';
import { registerUser } from "../../services/authApi";

const Register = () =>{
    const [inputs,setInputs]=useState({
        name:"",
        email:"",
        password:"",
        phone_no: "",
    })

    const [err,setError] = useState(null);

    const navigate = useNavigate();
    const handleChange = e =>{
        setInputs(prev=>({...prev,[e.target.name]:e.target.value}))
    }
    
    const handleSubmit = async(e)=>{
        e.preventDefault();
        try{
            await registerUser(inputs);
            navigate("/login");
        }catch(err){
            setError(err.response.data);
        }
    }

    return(
        <div className="login-container">
        <div className="login-box">
        <div className="split-text-container">
    <span className="text-part left">Welcome</span>
</div>
            <p className="subtitle">Please fill in your details</p>
            <form onSubmit={handleSubmit} className="login-form">
                <div className="form-group">
                <input required type="text" placeholder="Username" name="name" onChange={handleChange}/>
                </div>
                <div className="form-group">
                <input required type="email" placeholder="Email" name="email" onChange={handleChange}/></div>
                <div className="form-group">
                <input required type="text" placeholder="Password" name="password" onChange={handleChange}/>
                </div>
                <div className="form-group">
                <input required type="text" placeholder="Phone No" name="phone_no" onChange={handleChange}/>
                </div>
                <div className="button">
                <button type="submit" onClick={handleSubmit} className="btn btn-border-reveal login-button">Sign Up</button>
                <span>Already a user? <Link to="/login" className="custom-link">Login</Link></span>
                </div>
                {err && <p>{err.message || err}</p>}
              
            </form>
        </div>
        </div>  
    )
}

export default Register;
