import { useEffect, useState } from "react";
import getData from "../../utilities/getData";


export default function BlockedUsers(props:any) {

  const [blockedStatus, setBlockedStatus] = useState<any>({});
  const [BlockedUsers, setIsBlockedUsers] = useState<any>([]);


  useEffect(() => {
    getData("http://localhost:3003/profile/BlockedUsers")
    .then(res => {
      setIsBlockedUsers(res)
      const initialBlockedStatus : any = {};
      res.forEach((item: any) => {
        initialBlockedStatus[item.userId] = true;
      });
      setBlockedStatus(initialBlockedStatus);
    })
    props.socket.on("unblocked", () => {
      getData("http://localhost:3003/profile/BlockedUsers")
      .then(res => {
        setIsBlockedUsers(res)
        const initialBlockedStatus : any = {};
        res.forEach((item: any) => {
          initialBlockedStatus[item.userId] = true;
        });
        setBlockedStatus(initialBlockedStatus);
      })
    })
  },[])
  const handleBlock = (userId : string) => {

    const newBlockedStatus : any = {...blockedStatus};
    newBlockedStatus[userId] = !newBlockedStatus[userId];
    setBlockedStatus(newBlockedStatus);
      if(!newBlockedStatus[userId])
        props.socket.emit("unblockUser", userId);
      else
      {
        props.socket.emit("blockUser", userId);
      }

  };

  return (
    <div className={`w-screen h-screen flex backdrop-blur-[3px]`}>
      <div
        className={`h-[70%] w-[70%] rounded-[20px] shadow-[0px_0px_30px_5px_rgba(26,28,38,0.5)] xl:w-[50%] overflow-hidden ${
          props.darkMode ? "bg-[#272932]" : "bg-[#EEEEFF]"
        } m-auto ${props.open ? "ml-[125px] sm:ml-[180px] md:ml-auto" : ""} overflow-y-auto`}
      >
        <button
          className="cursor-pointer relative block p-[2px_5px] leading-[20px] text-[24px] bg-[#6F37CF] rounded-[20px] border-[1px_solid_#cfcece] text-white top-[5px] left-[1px]"
          onClick={props.close}
        >
          &times;
        </button>

        <div className="pt-[4em] flex flex-col gap-[40px] overflow-y-auto">
          {BlockedUsers.length > 0 ? BlockedUsers.map((item : any) => {
            const { userId, username, image } = item;
            return (
              <div className=" flex justify-around items-center" key={userId}>
                <div className="w-[50px] h-[50px] ">
                  <img className="w-[100%] h-[100%] rounded-[50%]" src={image} alt="" />
                </div>
                <p>{username}</p>
                <button
                  onClick={() => handleBlock(userId)}
                  className={`bg-[${blockedStatus[userId] ? "#EB5E5E" : "#6F37CF"}] h-[2em] w-[5em] rounded-[10px] text-white`}>
                  {blockedStatus[userId]? "Unblock" : "Block"}
                </button>
              </div>
            );
          }): <h1 className="text-center pt-[20em]">Not Yet!</h1>}
        </div>
      </div>
    </div>
  );
}
