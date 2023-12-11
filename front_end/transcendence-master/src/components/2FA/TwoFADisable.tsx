import { useEffect, useState } from 'react'
import Cookies from "js-cookie";
import { Token } from "../../types/types";
import jwt from "jwt-decode";
import axios from "axios";


export default function TwoFADisable(props:any) {

  const [userId, setUserId] = useState("");
  const token = Cookies.get("accessToken");
  useEffect(() => {
    if (token) {
      const decode: Token = jwt(token);
      const userId: string = decode.sub;
      setUserId(userId);
    }
  }, []);

  const disableOtp = async (event: any) => {
    event.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:3003/auth/disable-otp", // Replace with your API endpoint
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
        props.setOtpEnabled(false)
      } else {
        console.log("Failed to create post.");
      }
      return response.data;
    } catch (error) {
      console.error("Error creating post:", error);
    }
  };

  const handleFormSubmit = (event:any) => {
    disableOtp(event);
    props.close;
  }

  return (
    <div className={`w-screen h-screen flex backdrop-blur-[3px]`}>
      <div
        className={`h-[20%] w-[70%] rounded-[20px] shadow-[0px_0px_30px_5px_rgba(26,28,38,0.5)] xl:w-[50%] overflow-hidden  ${props.darkMode ? "bg-[#272932]" : "bg-[#EEEEFF]"
          } m-auto ${props.open ? "ml-[125px] sm:ml-[180px] md:ml-auto" : ""}`}
      >
        <button
          className="cursor-pointer relative block p-[2px_5px] leading-[20px] text-[24px] bg-[#6F37CF] rounded-[20px] border-[1px_solid_#cfcece] text-white top-[5px] left-[1px]"
          onClick={props.close}
        >
          &times;
        </button>
        <div>
            <div className="bg-white p-8 rounded shadow">
              <span>Disable TwoFa</span>
            <form onSubmit={handleFormSubmit}>
                <input
                  placeholder="******"
                  type="text"
                  id="verificationCode"
                  name="verificationCode"
                  className="w-full p-2 rounded border border-gray-400 focus:outline-none focus:ring focus:border-blue-500"
                />
                <button 
                  type="submit"
                  className="ml-3 mt-6 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded focus:outline-none focus:ring focus:border-blue-500"
                >
                  Submit
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
  )
}
