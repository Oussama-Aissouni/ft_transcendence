import { Switch} from "@headlessui/react";
import logo from "../../assets/logo.svg"
import Popup from 'reactjs-popup'
import Profile from '../Profile/Profile'
import { useEffect, useRef, useState } from "react";
import user_data from "../../utilities/data_fetching";
import profile_search from "../../utilities/profile_search";
import { NotifData,  userData } from "../../types/types";
import UserProfile from "../Profile/UserProfile";
import {useNavigate } from "react-router-dom";
import NotifItem from "./NotifItem";
import FriendNotifItem from "./FriendNotifItem";
import notif_fetching from "../../utilities/notif_fetching";
import { printError } from "../../utilities/notiification";


export default function HorzNav(props: any) {

    const [userData, setUserData] = useState<userData>();
    const [searchText, setsearchText] = useState('');
    const [searchedUsers, setSearchedUsers] = useState([]);
    
    const [notif, setNotif] = useState(false);
    const [show, setShow] = useState(false);
    const [notifArr, setNotifArr] = useState([]);
    const navigate = useNavigate();
    
    const textInput = useRef(null);
    const icon = {
        sun: <svg className="mr-[8px] md:m-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M17 12C17 14.7614 14.7614 17 12 17C9.23858 17 7 14.7614 7 12C7 9.23858 9.23858 7 12 7C14.7614 7 17 9.23858 17 12Z" fill="#18213f"></path> <path fillRule="evenodd" clipRule="evenodd" d="M12 1.25C12.4142 1.25 12.75 1.58579 12.75 2V4C12.75 4.41421 12.4142 4.75 12 4.75C11.5858 4.75 11.25 4.41421 11.25 4V2C11.25 1.58579 11.5858 1.25 12 1.25ZM3.66865 3.71609C3.94815 3.41039 4.42255 3.38915 4.72825 3.66865L6.95026 5.70024C7.25596 5.97974 7.2772 6.45413 6.9977 6.75983C6.7182 7.06553 6.2438 7.08677 5.9381 6.80727L3.71609 4.77569C3.41039 4.49619 3.38915 4.02179 3.66865 3.71609ZM20.3314 3.71609C20.6109 4.02179 20.5896 4.49619 20.2839 4.77569L18.0619 6.80727C17.7562 7.08677 17.2818 7.06553 17.0023 6.75983C16.7228 6.45413 16.744 5.97974 17.0497 5.70024L19.2718 3.66865C19.5775 3.38915 20.0518 3.41039 20.3314 3.71609ZM1.25 12C1.25 11.5858 1.58579 11.25 2 11.25H4C4.41421 11.25 4.75 11.5858 4.75 12C4.75 12.4142 4.41421 12.75 4 12.75H2C1.58579 12.75 1.25 12.4142 1.25 12ZM19.25 12C19.25 11.5858 19.5858 11.25 20 11.25H22C22.4142 11.25 22.75 11.5858 22.75 12C22.75 12.4142 22.4142 12.75 22 12.75H20C19.5858 12.75 19.25 12.4142 19.25 12ZM17.0255 17.0252C17.3184 16.7323 17.7933 16.7323 18.0862 17.0252L20.3082 19.2475C20.6011 19.5404 20.601 20.0153 20.3081 20.3082C20.0152 20.6011 19.5403 20.601 19.2475 20.3081L17.0255 18.0858C16.7326 17.7929 16.7326 17.3181 17.0255 17.0252ZM6.97467 17.0253C7.26756 17.3182 7.26756 17.7931 6.97467 18.086L4.75244 20.3082C4.45955 20.6011 3.98468 20.6011 3.69178 20.3082C3.39889 20.0153 3.39889 19.5404 3.69178 19.2476L5.91401 17.0253C6.2069 16.7324 6.68177 16.7324 6.97467 17.0253ZM12 19.25C12.4142 19.25 12.75 19.5858 12.75 20V22C12.75 22.4142 12.4142 22.75 12 22.75C11.5858 22.75 11.25 22.4142 11.25 22V20C11.25 19.5858 11.5858 19.25 12 19.25Z" fill="#18213f"></path> </g></svg>,
        moon: <svg className="mr-[8px] md:m-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M12 22C17.5228 22 22 17.5228 22 12C22 11.5373 21.3065 11.4608 21.0672 11.8568C19.9289 13.7406 17.8615 15 15.5 15C11.9101 15 9 12.0899 9 8.5C9 6.13845 10.2594 4.07105 12.1432 2.93276C12.5392 2.69347 12.4627 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" fill="#1C274C"></path> </g></svg>,
    }
    
    useEffect(() => {
        user_data().then((data: any) => {
          setUserData(data.user);
        });

        props.socket.on('notifFailed', () => {
            navigate('/')
            printError("User is offline 3yet lih");
        })

      }, []);

    const searchBar = (text:string) =>
    {
        if(text.length)
        {
            profile_search(text).then((data:any) => {
                setSearchedUsers(data.users);
            })
        }
    }

   useEffect(() => {
        props.socket.on('gotNotif', () => {
            notif_fetching().then((data:any) => {
                setNotifArr(data);
        })
            setNotif(true);
       })
       props.socket.on('deleteNotif', () => {
           notif_fetching().then((data: any) => {
               setNotifArr(data);
           })
       })
   }, [notif])

   const handleNotif = () => {
        setShow(!show);
        if(notif)
            setNotif(false);
    }

    if (userData) {
            return (
        <div className="w-full max-h-[80px] m-0">
            <div className="bg-transparent w-full fixed top-0 left-0">
                <div className="flex h-[80px] w-[80%] md:w-full items-center">
                    <div className={`h-[80px] min-w-[100px] md:bg-slate-50 md:dark:bg-[#272932] md:dark ${(props.open) ? "bg-slate-50 dark:bg-[#272932]" : ""}`}>
                        <img onClick={() => navigate("/")} src={logo} alt="logo" className="m-auto pl-[20px] pt-[10px] w-[65px] h-[65px] md:w-[70px] md:h-[70px] justify-center" />
                    </div>
                    
                    {/* burger menu */}
                    <div onClick={props.toggleOpen} className="text-3xl absolute right-8 top-6 cursor-pointer md:hidden dark:text-white">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-[35px] h-[35px]"
                        
                        >
                            <path
                                strokeLinecap="round" 
                                strokeLinejoin="round"
                                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                            />
                        </svg>
                    </div>
                    
                    <div className="flex w-full justify-between pl-[10px] md:pl-[60px] items-center">
                        <div className="flex items-center w-[50%] md:w-[40%] h-[50px] bg-white dark:bg-[#272932] rounded-[15px]">
                            <svg xmlns="http://www.w3.org/2000/svg" width="21" height="21" viewBox="0 0 21 21" fill="none" className="ml-[10px]">
                                <path fillRule="evenodd" clipRule="evenodd" d="M9.86955 0C15.3117 0 19.7383 4.42666 19.7383 9.86878C19.7383 12.4364 18.753 14.7781 17.1406 16.5356L20.3134 19.7018C20.6103 19.9987 20.6113 20.4791 20.3144 20.776C20.1664 20.926 19.9708 21 19.7762 21C19.5827 21 19.3881 20.926 19.2391 20.7781L16.028 17.5759C14.3389 18.9287 12.1971 19.7386 9.86955 19.7386C4.42743 19.7386 -0.000244141 15.3109 -0.000244141 9.86878C-0.000244141 4.42666 4.42743 0 9.86955 0ZM9.86955 1.52015C5.26554 1.52015 1.5199 5.26477 1.5199 9.86878C1.5199 14.4728 5.26554 18.2184 9.86955 18.2184C14.4726 18.2184 18.2182 14.4728 18.2182 9.86878C18.2182 5.26477 14.4726 1.52015 9.86955 1.52015Z" fill="#8F8F8F" />
                            </svg>
                            <input ref={textInput} onChange={(e) =>{ 
                                setsearchText(e.target.value)
                                searchBar(e.target.value)
                                }}
                                 type="text" name="search" id="search" placeholder="Search" className="dark:text-white focus:bg-transparent bg-transparent w-[90%] ml-[10px]"/>
                        </div>
                        <div className={`${searchText.length ? "" : "hidden"} w-[30%] absolute top-[65px] z-2 bg-white dark:bg-[#272932] dark:text-white`}>
                            {searchedUsers.map((user:any, key) => {
                                return(
                                    <Popup key={key} trigger={
                                    <div className="flex justify-evenly items-center">
                                        <div className=" w-[50px] h-[50px] flex items-center">
                                            <img src={user.image} className=" rounded-[50px]" />
                                        </div>
                                        <div>
                                            {user.username}
                                        </div>
                                        </div>} modal>
                                        {// @ts-ignore
                                            close => (<UserProfile input={textInput} users={setSearchedUsers} socket={props.socket} user={user} open={props.open} close={close} darkMode={props.darkMode} display={user.userId === props.userId ? false : true}/>)}
                                    </Popup>
                                )
                            })}
                        </div>
                        
                        <div className="flex items-center md:w-[400px] justify-evenly w-full pr-[10px]">
                            <Switch
                                checked={props.darkMode}
                                onChange={props.toggleDarkMode}
                                className={`${props.darkMode ? "bg-[#6F37CF]" : "bg-white"
                            } relative inline-flex md:h-6 md:w-11 w-9 h-5 items-center rounded-full`}
                            >
                                <span className={`${props.darkMode ? "translate-x-6" : "translate-x-1"} w-[20px] transform rounded-full transition`}>
                                    {props.darkMode ? icon.moon : icon.sun}
                                </span>
                            </Switch>
                            <span className="md:text-[20px] text-[15px] font-bold dark:text-white">
                                {userData.username}
                            </span>


                            <div onClick={handleNotif} className="flex items-center justify-center bg-[#FEFEFF] relative dark:bg-[#272932] md:h-[50px] md:w-[50px] h-[40px] w-[40px] rounded-[10px] md:rounded-[15px] md-rounded-[20px]">
                                <div className={`${notif ? "" : "hidden"} w-[10px] h-[10px] bg-red-500 rounded-[20px] absolute top-[-5px] left-[25px] sm:left-[30px] md:left-[40px]`}></div>
                                <div className={`${show ? "" : "hidden"} flex flex-col items-center bg-white dark:bg-[#272932] absolute left-[-360px] top-[41px] w-[400px] h-[200px] md:top-[51px] md:left-[-355px] md:w-[400px]`}>
                                    <div className="h-full w-full overflow-y-scroll">
                                        {notifArr.map((notif:NotifData, key) => {
                                            if(notif.type === "game")
                                            {
                                                return (
                                                    <NotifItem key={key} notif={notif} socket={props.socket}/>
                                                    )
                                            }
                                            else
                                            {
                                                return (
                                                    <FriendNotifItem key={key} notif={notif} socket={props.socket} />
                                                )
                                            }
                                        })}
                                    </div>
                                </div>
                                <svg xmlns="http://www.w3.org/2000/svg" width="21" height="25" viewBox="0 0 21 25" fill="none">
                                    <path d="M7.91885 21.1081C8.53136 20.9785 12.2636 20.9785 12.8761 21.1081C13.3997 21.229 13.966 21.5116 13.966 22.1286C13.9355 22.716 13.5909 23.2367 13.1148 23.5674C12.4974 24.0487 11.7729 24.3535 11.0155 24.4633C10.5966 24.5176 10.185 24.5188 9.78072 24.4633C9.02209 24.3535 8.29756 24.0487 7.6814 23.5662C7.20406 23.2367 6.85945 22.716 6.82901 22.1286C6.82901 21.5116 7.39524 21.229 7.91885 21.1081ZM10.4698 0C13.0185 0 15.6219 1.20932 17.1684 3.21581C18.1718 4.5078 18.6321 5.79857 18.6321 7.80505V8.32703C18.6321 9.86583 19.0388 10.7728 19.9338 11.818C20.6121 12.588 20.8288 13.5765 20.8288 14.6488C20.8288 15.7199 20.4769 16.7367 19.7719 17.5623C18.8488 18.552 17.5471 19.1838 16.2186 19.2936C14.2934 19.4577 12.367 19.5959 10.415 19.5959C8.46183 19.5959 6.53664 19.5132 4.61145 19.2936C3.28171 19.1838 1.97999 18.552 1.05818 17.5623C0.353134 16.7367 0 15.7199 0 14.6488C0 13.5765 0.217969 12.588 0.895013 11.818C1.81803 10.7728 2.19796 9.86583 2.19796 8.32703V7.80505C2.19796 5.74427 2.71183 4.39674 3.77001 3.0776C5.34329 1.15379 7.86515 0 10.3602 0H10.4698Z" fill="#8F8F8F" />
                                </svg>
                            </div>
                            <Popup trigger={<img
                                        className="md:h-[50px] md:w-[50px] h-[40px] w-[40px] rounded-[10px] md:rounded-[15px]"
                                        src={userData.image}
                                        alt=""/>} modal>
                                        {// @ts-ignore
                                        close => (<Profile open={props.open} close={close} darkMode={props.darkMode} display={false}/>)}
                            </Popup>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
}
