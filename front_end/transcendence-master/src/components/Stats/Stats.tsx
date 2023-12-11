import { useEffect, useState } from "react";
import WinRate from "../Profile/WinRate";
import AchievementDetails from "./AchievementDetails";
import MatchDetails from "./MatchDetails";
import Character from "./Character";
import user_data from "../../utilities/data_fetching";
import { userData } from "../../types/types";


export default function Stats(props:any) {

  let textColor = props.darkMode ? "white" : "black";

  const [user, setUser] = useState<userData>();  
  useEffect(() => {
    user_data().then((data: any) => {
      setUser(data.user);
    });
  }, []);

  if(user)
  {
    return (
      <div className={` ${props.open ? "sm:w-[calc(100vw-100px)]" : "sm:w-full"} md:w-[80%] flex-col h-full items-center md:m-auto flex md:flex-row md:justify-between md:items-center text-black dark:text-white`}>
        <div className="flex flex-col md:justify-start md:w-[50%] w-[90%] md:h-full">
          <div className="flex items-center justify-center w-full  rounded-[20px] md:h-[40%] bg-gradient-to-r dark:to-[#1A1C26] dark:from-[#272932]  to-[rgba(255,255,255,0.5)] from-[#eeeeff] mb-[10px]">
            <WinRate color={textColor} wins={user.wins} losses={user.losses}/>
          </div>
          <div className="flex items-center justify-center w-[100%] rounded-[20px] md:h-[40%] bg-gradient-to-r dark:to-[#272932] dark:from-[#1A1C26] to-[#eeeeff] from-[rgba(255,255,255,0.5)]">
            <Character wins={user.wins} losses={user.losses} />
          </div>
        </div>
        <div className="flex flex-col md:justify-start justify-start w-[90%] md:w-[50%] h-full">
          <div className="flex items-center justify-center w-full rounded-[20px] md:h-[40%] bg-gradient-to-r dark:to-[#1A1C26] dark:from-[#272932]  to-[rgba(255,255,255,0.5)] from-[#eeeeff] mb-[10px]">
            <AchievementDetails title="Achievement"/>
          </div>
          <div className="flex items-center justify-center w-[100%] rounded-[20px] md:h-[40%] bg-gradient-to-r dark:to-[#272932] dark:from-[#1A1C26] to-[#eeeeff] from-[rgba(255,255,255,0.5)]">
            <MatchDetails title="Match History" username={user.username} image={user.image} history={user.matchHistory}/>
          </div>
        </div>
      </div>
    );
  }
}
