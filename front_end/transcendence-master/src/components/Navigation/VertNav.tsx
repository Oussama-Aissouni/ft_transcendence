import { useEffect, useState } from "react";
import Icon from "./Icon";
import { NavLink, useLocation } from "react-router-dom";
import axios from "axios";
import { Token } from "../../types/types";
import jwt from "jwt-decode";
import Cookies from "js-cookie";


export default function VertNav(props: any) {

  const location = useLocation();
  const token = Cookies.get("accessToken");
  const [userId, setUserId] = useState("");
  
  useEffect(() => {
    if (token) {
      const decode: Token = jwt(token);
      const userId: string = decode.sub;
      setUserId(userId);
    }
  }, []);


  const handlelogout =async () => {
    const response = await axios.post(
      "http://localhost:3003/auth/logout", // Replace with your API endpoint
      {
        id: userId,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    
    if (response.status === 200)
    {
      Cookies.remove('accessToken')
      window.location.href = '/'
    }

  }

  return (
    <div className={`dark:bg-[#272932] dark:text-white bg-slate-50 w-[100px] h-full  max-w-[100px] ${ props.open ? "" : "hidden" } md:inline-block`}>
      <div className="h-full">
        <ul className="flex flex-col h-full items-stretch">
          <div className="flex flex-col h-[50%] items-center justify-evenly">
            
            <li className={`${location.pathname === "/" ? "ml-[30px] w-[90px] h-[90px] bg-[#EEF] dark:bg-[#1A1C26] rounded-l-[40px] flex items-center justify-center" : "" }`} >
                <span className={`${location.pathname === "/" ? " w-[40px] h-[20px] bg-transparent relative left-[53px] top-[-55px] rounded-br-[20px] shadow-[7px_5px_0px_0px] shadow-[#EEF] dark:shadow-[#1A1C26]" : "" }`} ></span>
              <NavLink to="/">
                <Icon name="home" color={`${location.pathname === "/" ? "#6F37CF" : "#8F8F8F"}`} />
              </NavLink>
                <span className={`${location.pathname === "/" ? "w-[40px] h-[20px] bg-transparent relative left-[-10px] top-[55px] rounded-tr-[20px] shadow-[7px_-5px_0px_0px] shadow-[#EEF] dark:shadow-[#1A1C26]" : "" }`} ></span>
            </li>

                <li className={`${location.pathname.startsWith("/play") ? "ml-[30px] w-[90px] h-[90px] bg-[#EEF] dark:bg-[#1A1C26] rounded-l-[40px] flex items-center justify-center" : ""}`} >
              <span className={`${location.pathname.startsWith("/play") ? " w-[40px] h-[20px] bg-transparent relative left-[53px] top-[-55px] rounded-br-[20px] shadow-[7px_5px_0px_0px] shadow-[#EEF] dark:shadow-[#1A1C26]" : ""}`} ></span>
                <NavLink to="/play">
                <Icon name="play" color={`${location.pathname.startsWith("/play") ? "#6F37CF" : "#8F8F8F"}`} />
                </NavLink>
              <span className={`${location.pathname.startsWith("/play") ? "w-[40px] h-[20px] bg-transparent relative left-[-10px] top-[55px] rounded-tr-[20px] shadow-[7px_-5px_0px_0px] shadow-[#EEF] dark:shadow-[#1A1C26]" : ""}`} ></span>
            </li>

                <li className={`${location.pathname.startsWith("/chat") ? "ml-[30px] w-[90px] h-[90px] bg-[#EEF] dark:bg-[#1A1C26] rounded-l-[40px] flex items-center justify-center" : ""}`} >
              <span className={`${location.pathname.startsWith("/chat") ? " w-[40px] h-[20px] bg-transparent relative left-[53px] top-[-55px] rounded-br-[20px] shadow-[7px_5px_0px_0px] shadow-[#EEF] dark:shadow-[#1A1C26]" : ""}`} ></span>
                <NavLink to="/chat">
                <Icon name="chat" color={`${location.pathname.startsWith("/chat") ? "#6F37CF" : "#8F8F8F"}`} />
                </NavLink>
              <span className={`${location.pathname.startsWith("/chat") ? "w-[40px] h-[20px] bg-transparent relative left-[-10px] top-[55px] rounded-tr-[20px] shadow-[7px_-5px_0px_0px] shadow-[#EEF] dark:shadow-[#1A1C26]" : ""}`} ></span>
            </li>

            <li className={`${location.pathname === "/stats" ? "ml-[30px] w-[90px] h-[90px] bg-[#EEF] dark:bg-[#1A1C26] rounded-l-[40px] flex items-center justify-center" : ""}`} >
                <span className={`${location.pathname === "/stats" ? " w-[40px] h-[20px] bg-transparent relative left-[53px] top-[-55px] rounded-br-[20px] shadow-[7px_5px_0px_0px] shadow-[#EEF] dark:shadow-[#1A1C26]" : ""}`} ></span>
                <NavLink to="/stats">
                    <Icon name="stats" color={`${location.pathname === "/stats" ? "#6F37CF" : "#8F8F8F"}`} />
                </NavLink>
                <span className={`${location.pathname === "/stats" ? "w-[40px] h-[20px] bg-transparent relative left-[-10px] top-[55px] rounded-tr-[20px] shadow-[7px_-5px_0px_0px] shadow-[#EEF] dark:shadow-[#1A1C26]" : ""}`} ></span>
            </li>
            
          </div>
          <div className="flex flex-col h-[40%] justify-end items-center ">
            <div className="flex flex-col justify-around items-center h-[70%] w-full">
              <span className="h-[2px] w-[50%] bg-[#8F8F8F] opacity-50 items-center rounded"></span>
                
                <li className={`${location.pathname === "/settings" ? "ml-[30px] w-[90px] h-[90px] bg-[#EEF] dark:bg-[#1A1C26] rounded-l-[40px] flex items-center justify-center" : ""}`} >
                    <span className={`${location.pathname === "/settings" ? " w-[40px] h-[20px] bg-transparent relative left-[53px] top-[-55px] rounded-br-[20px] shadow-[7px_5px_0px_0px] shadow-[#EEF] dark:shadow-[#1A1C26]" : ""}`} ></span>
                    <NavLink to="/settings">
                        <Icon name="settings" color={`${location.pathname === "/settings" ? "#6F37CF" : "#8F8F8F"}`} />
                    </NavLink>
                    <span className={`${location.pathname === "/settings" ? "w-[40px] h-[20px] bg-transparent relative left-[-10px] top-[55px] rounded-tr-[20px] shadow-[7px_-5px_0px_0px] shadow-[#EEF] dark:shadow-[#1A1C26]" : ""}`} ></span>
                </li>
                
                <li className={`${location.pathname === "/logout" ? "ml-[30px] w-[90px] h-[90px] bg-[#EEF] dark:bg-[#1A1C26] rounded-l-[40px] flex items-center justify-center" : ""}`} >
                    <span className={`${location.pathname === "/logout" ? " w-[40px] h-[20px] bg-transparent relative left-[53px] top-[-55px] rounded-br-[20px] shadow-[7px_5px_0px_0px] shadow-[#EEF] dark:shadow-[#1A1C26]" : ""}`} ></span>
                    <button onClick={handlelogout}>
                        <Icon name="logout" color={`${location.pathname === "/logout" ? "#6F37CF" : "#8F8F8F"}`} />
                    </button>
                    <span className={`${location.pathname === "/logout" ? "w-[40px] h-[20px] bg-transparent relative left-[-10px] top-[55px] rounded-tr-[20px] shadow-[7px_-5px_0px_0px] shadow-[#EEF] dark:shadow-[#1A1C26]" : ""}`} ></span>
                </li>
            
            </div>
          </div>
        </ul>
      </div>
    </div>
  );
}
