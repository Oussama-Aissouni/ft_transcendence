
import { useEffect, useRef, useState } from "react";
import 'react-toastify/dist/ReactToastify.css';
import uplloadFilePic from "../../utilities/uploadFilePic";
import { ToastContainer } from 'react-toastify';
import { printError, printSuccess } from "../../utilities/notiification";
import Popup from "reactjs-popup";
import TwoFADisable from "../2FA/TwoFADisable";
import TwoFA from "../2FA/TwoFA";
import Cookies from 'js-cookie';
import { Token } from '../../types/types';
import jwt from 'jwt-decode';
import user_data from "../../utilities/data_fetching";
import uploadUsername from "../../utilities/uploadUsername";
import getData from "../../utilities/getData";
import BlockedUsers from "./BlockesUsers";




const SetFirstTime = (props: any) => {

    const imageRef = useRef<HTMLInputElement | null>(null);
    const [file, setFile] = useState<any>(null);
    const [image, setImage] = useState<string>();
    const [username, setUsername] = useState<string | null>()
    const [usernames, setUsernames] = useState<string[]>([]);
    const [otpEnabled, setOtpEnabled] = useState<boolean | null>(false);
    const [userId, setUserId] = useState<string>('');
    const token = Cookies.get('accessToken');

    useEffect(() => {
        getData("http://localhost:3003/profile/usernames")
            .then(res => setUsernames(res))
    }, [])
    const handleFileChange = (e: any) => {
        const imageSelected = e.target.files?.[0];
        if (imageSelected) {
            setImage(URL.createObjectURL(imageSelected));
            setFile(imageSelected);
        }

    }

    const setUserName = (e: any) => {
        setUsername(e.target.value);
    }
    const uploadImage = (e: any) => {
        imageRef.current?.click();
        e.preventDefault();
    };

    const handleFinish = async (e: any) => {


        if (username) {
            const isUsernameExist = usernames.some((item: any) => item.username === username);
            if (username.length > 10) {
                e.preventDefault();
                printError("Usernames must have a minimum length of 10 characters");
                return;
            }
            if (file) {
                if (file.size / 1041 > 500) {
                    e.preventDefault(); 
                    printError("file to large 'max-size:500KB'")
                    return;
                }
                uplloadFilePic("http://localhost:3003/profile/upload", file);
            }
            if (isUsernameExist) {
                e.preventDefault();
                printError("Username Already Exists")
                return;
            }
            else {
                uploadUsername("http://localhost:3003/profile/setusername", username);
            }
        }
        if (!username && file) {
            printSuccess("image upload success")
            uplloadFilePic("http://localhost:3003/profile/upload", file);
        }
    }

    useEffect(() => {
        if (token) {
            const decode: Token = jwt(token);
            const userId: string = decode.sub;
            setUserId(userId);
            user_data().then((data: any) => {
                setOtpEnabled(data.user.otp_enabled);
                setImage(data.user.image)
            });
        }
    }, [])


    // const handleBlocked = (e: any) => {
    //     e.preventDefault();
    // }
    return (
        <>
            <ToastContainer
                position="top-left"
                autoClose={1000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="colored"
            />
            <section className=" w-[calc(100vw-130px)] h-[calc(100vh-100px)] flex justify-center items-center border-solid  mx-auto">
                <div className="border-[1px] w-[824px] h-[720px] flex flex-col items-center justify-center gap-[70px] dark:bg-[#272932] dark:text-white bg-white rounded-[10px]">
                    <div className="">
                        <h1 className="text-center text-[19px] font-bold font-['moul'] mb-[20px]">Welcome! Let’s create your profile</h1>
                        <p className="text-center">Let others get to know you better</p>
                    </div>
                    <Popup trigger={
                        <button className="dark:bg-[#1A1C26] bg-[#6F37CF] text-white hover:bg-[#6F37CF] border-[1px]
                    border-[#6F37CF] dark:hover:bg-[#6F37CF] hover:text-white dark:text-white
                    font-semibold py-2 px-4 rounded-md">{otpEnabled ? "Disable 2FA" : "Enable 2FA"}</button>
                    } modal>
                        {// @ts-ignore
                        close => (otpEnabled ? <TwoFADisable close={close} darkMode={props.darkMode} setOtpEnabled={setOtpEnabled} userId={userId} /> : <TwoFA close={close} darkMode={props.darkMode} setOtpEnabled={setOtpEnabled} userId={userId} />)}
                    </Popup>
                    <form className="flex flex-col gap-[4em]">
                        <div className="flex items-center gap-[50px]">
                            <img src={image} className="w-[100px] h-[100px] rounded-[50%]" alt="avatar" />
                            <div className="flex flex-col gap-[10px]">
                                <input className="hidden" type="file" ref={imageRef} onChange={handleFileChange} accept="image/*" />
                                <button className=" dark:bg-[#1A1C26] bg-[#6F37CF]  hover:bg-[#6F37CF] border-[1px] border-[#6F37CF] dark:hover:bg-[#6F37CF] hover:text-white dark:text-white text-white w-[161px] h-[40px] rounded-[20px]  text-[15px] cursor-pointer" onClick={uploadImage} >Choose image</button>
                                <p className="text-[10px] pl-[20px]">or use default</p>
                            </div>
                        </div>
                        <div className="flex flex-col gap-[20px]">
                            <h1 className="font-bold text-[1.2em]  ">Choose a nickname : </h1>
                            <input className="outline-none border-b-2 border-[#6F37CF] bg-transparent" type="text" placeholder="Enter Name" autoComplete="off" onChange={setUserName} />
                            <button className="bg-[#6F37CF] dark:bg-[#1A1C26] border-[1px] dark:hover:bg-[#6F37CF]  border-[#6F37CF] py-[10px] px-[30px] rounded-[10px] text-white text-[15px] cursor-pointer" onClick={handleFinish}>finish</button>
                        </div>
                    </form>
                    <Popup trigger={
                        <button onClick={(e: any) => e.preventDefault()} className="bg-[#EB5E5E] h-[3em] w-[20em] rounded-[10px] text-white ">Blocked  Users</button>
                    } modal>
                        {// @ts-ignore
                        (close) => <BlockedUsers socket={props.socket} close={close}/>}
                    </Popup>

                </div>
            </section>
        </>
    );
}


export default SetFirstTime;