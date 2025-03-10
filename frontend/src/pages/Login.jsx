import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from "../context/authContext";

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
        <form>
            <input type="name" placeholder="User Name" name="name" onChange={handleChange} required />
            <input type="password" placeholder="Password" name="password" onChange={handleChange} required />
            {err && <p>{err.message || err}</p>}
            <button type="submit" onClick={handleSubmit}>Login</button>
        </form>
    );
};

export default Login;