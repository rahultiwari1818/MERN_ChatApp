import React from "react";
import { useGoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import GoogleIcon from "../../Assets/Images/GoogleIcon.png";
import { useAuth } from "../../Contexts/AuthProvider";

export default function GoogleLogin({isLogin}) {
        const { login } = useAuth();
    
  const googleAuth = (code) =>
    axios.get(
      `${process.env.REACT_APP_API_URL}/api/v1/googleAuth/google?code=${code}`
    );

  const navigate = useNavigate();

  const googleResponse = async (authResult) => {
    try {
      if (authResult["code"]) {
        const result = await googleAuth(authResult.code);
        const token = result.data.token;
        login(token, { email: result.data.email });
        navigate("/chat");
      }
    } catch (error) {
      console.log("Error While G Auth :", error);
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: googleResponse,
    onError: googleResponse,
    flow: "auth-code",
  });

  return (
    <button
      
      type="submit"
      sx={{ mt: 2, py: 1.5, fontWeight: "bold" }}
      onClick={googleLogin}
      className="flex px-3 py-2 rounded my-2 w-full justify-around font-bold text-blue-500 items-center gap-5 border border-blue-500 bg-white"
    >
      <p>{isLogin ? "Signin " : "SignUp "} Using Google</p>
      <img src={GoogleIcon} alt="google" className="h-10 w-10"/>
    </button>
  );
}
