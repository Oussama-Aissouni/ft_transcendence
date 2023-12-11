import  { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { Token } from "../../types/types";
import jwt from "jwt-decode";
import axios from "axios";
export default function ValidateOTP() {

    const [userId, setUserId] = useState("");
    const token = Cookies.get("accessToken");
    useEffect(() => {
        if (token) {
            const decode: Token = jwt(token);
            const userId: string = decode.sub;
            setUserId(userId);
        }
    }, []);

    const VerifyOtpCode = async (event: any) => {
        event.preventDefault();
        try {
            const response = await axios.post(
                "http://localhost:3003/auth/verify-otp", // Replace with your API endpoint
                {
                    id: userId,
                    token: event.target[0].value,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );
            if (response.status === 200) {
                window.location.href = '/'
            } else {
                console.log("Failed to create post.");
            }
            return response.data;
        } catch (error) {
            console.error("Error creating post:", error);
        }
        
    };
    const handleFormSubmit = (event: any) => {
        // event.preventDefault();
        VerifyOtpCode(event);
    }

  return (
      <div className="flex w-[100vw] h-[100vh] items-center justify-center flex-col bg-opacity-10 bg-gradient-to-r from-indigo-700 via-purple-700 to-purple-600">
        <div className="w-[80%] flex flex-col items-center bg-white p-[10px] rounded-[20px]">
            <div className="text-black">
                Enter the password to validate OTP
            </div>
            <form onSubmit={handleFormSubmit} className="flex flex-col w-full justify-center items-center">
                <input
                    placeholder="******"
                    type="text"
                    id="verificationCode"
                    name="verificationCode"
                    className="min-w-[50%] max-w-[70%] p-2 rounded border border-gray-400 focus:outline-none focus:ring focus:border-blue-500 mb-[20px] mt-[20px]"
                />
                <button
                    type="submit"
                    className="bg-[#798CFE] px-[50px] py-[10px] rounded-[10px] max-w-[50%]"
                >
                    Submit
                </button>
            </form>
        </div>
    </div>
  )
}
