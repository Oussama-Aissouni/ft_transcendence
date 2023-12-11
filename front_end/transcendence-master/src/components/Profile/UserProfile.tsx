import { useEffect, useState } from "react";
import MatchDetails from "./MatchDetails";

import Button from "./Button";
import WinRate from "./WinRate";
import ButtonAdd from "./ButtonAdd";
import AchievementDetails from "../Stats/AchievementDetailsProfile";


export default function UserProfile(props: any) {

    const [isBlock, setIsBlock] = useState<boolean>(false);
    let textColor = props.darkMode ? "white" : "black";

    const handleBlockButton = () => {
        if (!isBlock) {
            props.socket.emit("blockUser", props.user.userId);
        }
        else
            props.socket.emit("unblockUser", props.user.userId);
        setIsBlock(!isBlock)
    }

    useEffect(() => {
       return(() => {
           props.input.current.value = "";
           props.users([])
       })
    }, [])

    if (props.user) {
        return (
            <div className={`w-screen h-screen flex backdrop-blur-[3px]`}>
                <div
                    className={`h-[70%] w-[70%] rounded-[20px] shadow-[0px_0px_30px_5px_rgba(26,28,38,0.5)] xl:w-[50%] overflow-hidden  ${props.darkMode ? "bg-[#272932]" : "bg-[#EEEEFF]"
                        } m-auto ${props.open ? "ml-[125px] sm:ml-[180px] md:ml-auto" : ""}`}
                >
                    <button
                        className="cursor-pointer relative block p-[2px_5px] leading-[20px] text-[24px] bg-[#6F37CF] rounded-[20px] border-[1px_solid_#cfcece] text-white top-[5px] left-[1px]"
                        onClick={props.close}
                    >
                        &times;
                    </button>
                    <div className="flex mt-[-25px] xl:h-[30%] rounded-b-[30px] w-[100%] m-auto flex-col   justify-center items-center bg-gradient-to-r to-[rgba(253,11,233,0.2)] from-[rgba(47,14,145,0.2)]">
                        <img
                            className="mt-[10px] md:h-[100px] md:w-[100px] h-[60px] w-[60px] rounded-[100px] md:rounded-[100px]"
                            src={props.user.image}
                            alt=""
                        />
                        <span className={`m-[5px] text-${textColor}`}>{props.user.username}</span>
                        <div className={`${props.display ? "" : "hidden"} w-[60%] flex justify-around p-[30px]`}>
                            <ButtonAdd
                                value="add friend"
                                color="#6F37CF"
                                text={`white`}
                                userId={props.user.userId}
                                socket={props.socket}
                            />
                            <div onClick={handleBlockButton}>
                                <Button value={isBlock ? "unblock" : "block"} color="#EB5E5E" text={`white`} />
                            </div>
                        </div>
                    </div>
                    <div
                        className={`flex flex-col xl:pt-[20px] xl:flex-col h-[75%] w-full justify-around text-${textColor}`}
                    >
                        <div>
                            <div className="w-full xl:w-[100%] flex flex-row xl:flex-col items-center justify-center">
                                <WinRate color={textColor} wins={props.user.wins} losses={props.user.losses} />
                            </div>
                        </div>
                        <div className="xl:flex h-[60%] ">
                            <div className="w-full xl:w-[50%] xl:mt-[20px] xl:h-[70%] flex flex-col items-center justify-center">
    
                                <AchievementDetails userId={props.user.userId} title="Last Achievements" />
                            </div>
                            <div className="w-full xl:w-[50%] xl:mt-[20px] xl:h-[70%] flex flex-col items-center justify-center">
                                <MatchDetails title="Recent Matches" user={props.user} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
