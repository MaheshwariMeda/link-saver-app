import React, {useState} from  "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const SignupPage = () => {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            await axios.post("http://localhost:3001/api/auth/signup", {email, password});
            alert("Signup successfull");
            navigate("/login");
        }
        catch(err)
        {
            alert("Signup failed");
        }
    }


    return(
        <>
       <form onSubmit={handleSubmit}>
            <input type="text" name="email" placeholder="email" 
            onChange={(e)=>{setEmail(e.target.value)}} required />
            <input type="password" name="password" placeholder="password"
            onChange={(e)=>{setPassword(e.target.value)}} required />
            <button type="submit">Sign Up</button>
       </form>

       <div>
             <button type="button" onClick={() => navigate('/login')}>
                 Login
             </button>
        </div>
        </>
    );
}

export default SignupPage;