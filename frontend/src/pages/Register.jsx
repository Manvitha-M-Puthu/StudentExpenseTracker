import React from "react";
import {Link, useNavigate} from "react-router-dom";
import {useState} from "react";
import axios from "axios";

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
            await axios.post("http://localhost:8800/auth/register", inputs);
            navigate("/login");
        }catch(err){
            setError(err.response.data);
        }
    }

    return(
        <div className="auth">
            <h1>Register</h1>
            <form>
                <input required type="text" placeholder="username" name="name" onChange={handleChange}/>
                <input required type="email" placeholder="email" name="email" onChange={handleChange}/>
                <input required type="text" placeholder="password" name="password" onChange={handleChange}/>
                <input required type="text" placeholder="Phone No" name="phone_no" onChange={handleChange}/>
                <button onClick={handleSubmit}>Register</button>
                {err && <p>{err.message || err}</p>}
                <span>Already a user? <Link to="/login">Login</Link></span>
            </form>
        </div>
    )
}

export default Register;