import React, {useState, useContext} from "react";
import axios from 'axios';
import { AuthContext } from "../context/AuthContext"; 

import { useNavigate } from "react-router-dom";

const LoginPage = () => {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();
    const { login } = useContext(AuthContext);
    const handleSubmit = async(e) =>{
        e.preventDefault();
        try {
            const res = await axios.post("http://localhost:3001/api/auth/login", {email, password});
            alert("login successfull");
            login(res.data.token);
            navigate('/dashboard');
        }
        catch(err) {
            alert("Incorrect email or password");
        }
    }

    return(
        <form onSubmit={handleSubmit}>
            <input type="text" name="email" placeholder="email"
            onChange={(e)=>{setEmail(e.target.value)}} required />
            <input type="password" name="password" placeholder="password"
            onChange={(e)=>{setPassword(e.target.value)}} />
            <button type="submit">Login</button>
        </form>
    );
}

export default LoginPage;