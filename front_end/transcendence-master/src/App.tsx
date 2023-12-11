import { useState, useEffect } from "react";
import "./App.css";
import HorzNav from "./components/Navigation/HorzNav";
import VertNav from "./components/Navigation/VertNav";
import { BrowserRouter, Route, Routes} from "react-router-dom";
import FindGame from "./components/Game/FindGame";
import Game from "./components/Game/Game";
import Chat from './components/Chat/Chat';
import Login from "./components/Login/Login";
import Cookies from 'js-cookie';
import jwt from 'jwt-decode';
import CreateRoom from "./components/Chat/CreateRoom";
import JoinRoom from "./components/Chat/JoinRoom";
import DMConv from "./components/Chat/DMConv";
import DefaultChatComp from "./components/Chat/DefaultChatComp";
import AddPeople from "./components/Chat/AddPeople";
import GroupConv from "./components/Chat/GroupConv";
import InvToRoom from "./components/Chat/InvToRoom";
import RoomSettings from "./components/Chat/RoomSettings";
import {io} from 'socket.io-client';
import Stats from "./components/Stats/Stats";
import OnlineGame from "./components/Game/OnlineGame";
import Settings from "./components/Settings/Settings";
import Home from "./components/Home/Home";
import PvF from "./components/Game/PvF";
import user_data from "./utilities/data_fetching";
import ValidateOTP from "./components/2FA/ValidateOTP";
import BannedList from "./components/Chat/BannedList";
import { ToastContainer } from 'react-toastify';
import NotFound from "./utilities/NotFound";

export interface Token {
  sub: string;
  email: string;
}

function App() {
  const [socket, setSocket] = useState<any>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [open, setOpen] = useState(false);
  const [enabled2FA, setEnabled2FA] = useState<any>();
  const [validated2FA, setValidated2FA] = useState<any>();
  const [firstTime, setFirstTime] = useState<any>();

  function toggleDarkMode() {
    setDarkMode(!darkMode);
  }

  function toggleOpen() {
    setOpen(!open);
  }

  const token = Cookies.get('accessToken');
  if (token) {
    const decode: Token = jwt(token);
    const userId: string = decode.sub;
    if(socket === null)
      setSocket(io("http://localhost:3003", {auth: {token: token}}));

    useEffect(() => {
      user_data().then((data: any) => {
        setEnabled2FA(data.user.otp_enabled)
        setValidated2FA(data.user.otp_validated)
        setFirstTime(data.user.FirstTime)
      });
    }, []);

    if(enabled2FA && !validated2FA)
    {
      return(
        <ValidateOTP/>
      )
    }
    if (!enabled2FA || validated2FA)
    {
      if (firstTime)
      {
        window.location.href = "http://localhost:5173/settings";
        socket.emit("FirstTime");
      }
      return (
          <BrowserRouter>
          <ToastContainer
            position="top-left"
            autoClose={2000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="colored"
          />
            <div className={`${darkMode ? "dark" : ""}`}>
              <div className="bg-[#EEEEFF] dark:bg-[#1A1C26] w-screen h-screen overflow-hidden">
                <HorzNav socket={socket} darkMode={darkMode} toggleDarkMode={toggleDarkMode} open={open} toggleOpen={toggleOpen} userId={userId}/>
                <div className="flex mt-[80px] h-full">
                  <VertNav open={open} />
                  <div className={`${open ? "" : ""} bg-[#EEEEFF] dark:bg-[#1A1C26] w-full h-full flex z-1`}>
                      <Routes>
                    <Route path="/" index element={<Home socket={socket}/>}/>
                        <Route path="play" element={<FindGame/>} />
                        <Route path="chat" element={<Chat userId={userId} socket={socket}/>} >
                          <Route index element={<DefaultChatComp/>}/>
                          <Route path="createRoom" element={<CreateRoom socket={socket} userId={userId} />}/>
                          <Route path="joinRoom" element={<JoinRoom userId={userId} socket={socket}/>}/>
                          <Route path="addPeople" element={<AddPeople socket={socket} userId={userId}/>}/>
                          <Route path="dmConv" element={<DMConv socket={socket} userId={userId}/>}/>
                          <Route path="groupConv" element={<GroupConv userId={userId} socket={socket}/>}/>
                          <Route path="invToRoom" element={<InvToRoom socket={socket} userId={userId}/>}/>
                          <Route path="roomSettings" element={<RoomSettings socket={socket} userId={userId}/>}/>
                          <Route path="bannedUsers" element={<BannedList socket={socket} userId={userId}/>}/>
                        </Route>
                        <Route path="stats" element={<Stats darkMode={darkMode} open={open}/>} />
                        <Route path="play-offline" element={<Game/>} />
                        <Route path="play-online" element={<OnlineGame userId={userId} socket={socket}/>} />
                        <Route path="settings"  element={<Settings darkMode={darkMode} open={open} socket={socket}/>} />
                        <Route path="pvf" element={<PvF userId={userId} socket={socket} />} />
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                  </div>
                </div>
              </div>
            </div>
          </BrowserRouter>
          );
      }
  }
  return(
    <Login/>
  )
}

export default App;