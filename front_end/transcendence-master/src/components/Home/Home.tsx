
import { useEffect, useState } from "react";
import getData from "../../utilities/getData";
import { Link} from "react-router-dom";
import { IleaderBoard, Iuser } from "../../types/types";





const Home = (props: any) => {


  const [data, setData] = useState<any>([]);
  const [newData, setNewData] = useState<any>([]);
  const [newFriends, setNewFriends] = useState<Iuser[]>([]);


  useEffect(() => {
    getData("http://localhost:3003/profile/leaderboard")
      .then((res: IleaderBoard) => {

        setData(res)
      })
  }, [])

  useEffect(() => {

    if (data && data.length > 0) {
      const uploadData = data.map((obj: any) => ({
        ...obj,
        winRate: isNaN((obj.wins / (obj.wins + obj.losses))) ? 0 : (obj.wins / (obj.wins + obj.losses)) * 100
      }))
      uploadData.sort((a: any, b: any) => b.winRate - a.winRate);
      setNewData(uploadData);

    }
  }, [data])

  useEffect(() => {
    getData("http://localhost:3003/profile/friends")
      .then((res: Iuser[]) => {
        {
          setNewFriends(res);
        }
      });

    props.socket.on("statusChanged", () => {
      getData("http://localhost:3003/profile/friends")
        .then((res: Iuser[]) => {
          setNewFriends(res);
        });
    })
    props.socket.on("blocked", () => {
      getData("http://localhost:3003/profile/friends")
        .then((res: Iuser[]) => {
          setNewFriends(res);
        });
    })
    props.socket.on("friendrequest", () => {
      getData("http://localhost:3003/profile/friends")
        .then((res: Iuser[]) => {
          setNewFriends(res);
        });
    })
  }, []);


  //should do more works
  return (
    <div className=" mt-[4em] md:mt-[17em] h-[40%] w-[80%] md:w-[80%] grid place-items-center grid-cols-1 md:grid-cols-2 mx-auto gap-y-[0px] md:gap-y-[8px] md:gap-x-[20px]">
      {/* //image bg */}
      <div className=" bg-[#5dbce9] bg-[url(/src/assets/bg.png)] w-full h-[28vh] max-h-[40vh] rounded-[18px] bg-cover bg-center bg-slate-500 flex flex-col justify-center items-center gap-[20px] text-white text-center hv	">
        <h1 className="text-[20px] lg:text-[30px] font-['poppins'] w-[90%]">Ultimate Ping Pong Showdown!</h1>
        <p className="font-normal lg:w-[80%]">Are you ready to test your skills in the fast-paced world of ping pong? Grab your paddle and prove that you're the ultimate ping pong champion!</p>
        <Link to="/play" className="bg-[#798CFE] px-[50px] py-[10px] rounded-[10px]">Play</Link>
      </div>
      {/* //LeaderBoard */}
      <div className="dark:text-white  bg-gradient-to-r dark:to-[#1A1C26] dark:from-[#272932]  to-[rgba(255,255,255,0.5)] from-[#eeeeff] w-full h-full max-h-full md:col-start-2 lg:row-start-1 lg:row-end-3 rounded-[23px] text-center hv">
        <h1 className=" text-[15px] text-center pt-[10px]">LeaderBoard</h1>
        <div className="font-['poppins']  grid grid-cols-4 lg:grid-cols-6 pt-[20px] mb-[8px] ">
          <p></p>
          <p>Rank</p>
          <p>Name</p>
          <p>Wins</p>
          <p className="hidden lg:block">Losses</p>
          <p className="hidden lg:block">WinRate</p>
        </div>
        <div className="h-full lg:h-[50vh] overflow-auto text-center flex flex-col gap-[10px] mx-[5px]  ">
          {newData.length > 0 ? (newData.map((item: IleaderBoard, index: any) => {
            const { image, username, wins, losses, winRate, id } = item;
            return (
              <div key={id} className=" grid grid grid-cols-4 lg:grid-cols-6 justify-center items-center border-solid border-[#000000] dark:border-[#7D5ABA] py-[8px] border-[1px] rounded-[4px] hover:bg-[#7D5ABA] hover:text-white">
                <div className="  ml-[10px] w-[30px] h-[30px]"><img className="rounded-[50px] w-[100%] h-[100%]" src={image} alt="logo" /></div>
                <p>#{index + 1}</p>
                <p>{username}</p>
                <p className="hidden lg:block">{wins}</p>
                <p className="hidden lg:block">{losses}</p>
                <span >{winRate.toFixed(2)}%</span>
              </div>
            )
          })) : <h1 className="flex justify-center items-center h-[15vh] md:h-[50vh]">Not Yet!!</h1>}
        </div>
      </div>
      {/* //Freinds */}
      <div className="bg-[#ffffff] dark:bg-[#272932] dark:text-white w-[100%] h-full max-h-[33vh] md:col-start-1 md:col-end-3 lg:col-end-2  rounded-[11px] hv">
        <h1 className="font-['moul'] text-center pt-[20px]">Friends</h1>
        <div className="h-[23vh] md:h-[27] w-[100%] overflow-auto ">
          {newFriends.length > 0 ? (newFriends.map((item: Iuser) => {
            const { image, username, Status, userId, id } = item;
            return (
              <div key={id} className="pr-[10px] pt-[30px] flex justify-center items-center gap-[3em] md:gap-[6em] lg:gap-[16%] ">
                <div className="w-[40px] h-[40px]"><img className="rounded-[50px] w-[100%] h-[100%]" src={image} alt="logo" /></div>
                <p className="font-normal w-[30px] ">{username}</p>
                {/* <button className="bg-[#6F37CF] px-[13px] py-[8px] text-white rounded-[10px] text-[13px]">invite</button> */}

                <Link
                  to="/pvf"
                  onClick={() => {
                    props.socket.emit('gameInvite', { id: userId, type: "gameInvite" })
                  }}
                  className="bg-[#6F37CF] w-[6em] text-center py-[8px] text-white rounded-[10px] text-[13px]">
                  invite
                </Link>

                <div className="flex items-center">
                  <p>{Status}</p>
                  <div className={`z-19 w-[10px] h-[10px] rounded-[10px] ${Status === 'online' ? "bg-green" : Status === 'offline' ? "bg-red" : "bg-blue"} ml-[7px]`}></div>
                </div>

              </div>
            )
          })) : <h1 className="flex justify-center items-center h-[15vh] md:h-[50vh]">Not Yet!!</h1>}
        </div>
      </div>
    </div>
  )
}

export default Home;
