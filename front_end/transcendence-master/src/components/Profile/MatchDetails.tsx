import axios from "axios";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { userData } from "../../types/types";


function Match(props: any) {
  const [user, setUser] = useState<userData>();
  const user_data = async () => {
    const token = Cookies.get("accessToken");
    if (token) {
      const response = await axios.post(
        "http://localhost:3003/auth/data", // Replace with your API endpoint
        {
          id: props.match.opponentId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (response.status === 200) {
        setUser(response.data.user);
        return response.data;
      }
    }
  };

  useEffect(() => {
    user_data();
  }, []);

  if (user) {
    return (
      <div className="w-full h-[60px] rounded-[30px] flex items-center justify-evenly">
        <img
          className="md:h-[40px] md:w-[40px] h-[40px] w-[40px] rounded-[10px] md:rounded-[30px]"
          src={props.user.image}
          alt=""
        />
        <div className="text-[12px] text-inherit">{props.user.username}</div>
        <span className="text-[#EB5E5E] text-[12px]">
          {props.match.selfScore} : {props.match.opponentScore}
        </span>
        <div className="text-[12px] text-inherit">{user.username}</div>
        <img
          className="md:h-[40px] md:w-[40px] h-[40px] w-[40px] rounded-[10px] md:rounded-[30px]"
          src={user.image}
          alt=""
        />
      </div>
    );
  }
}

export default function MatchDetails(props: any) {
  const matchHistory = props.user.matchHistory.slice(-3).reverse();

  return (
    <div className="xl:w-full w-[80%]">
      <div className="flex flex-col items-center">
        <div className={`text-${props.color}`}>{props.title}</div>
        <div className="p-[0px] line-breaker m-auto w-[90%] h-[1px] bg-[rgb(64,64,68)]"></div>
      </div>
      <div
        className={`overflow-y-scroll h-[100px] xl:h-full text-${props.color}`}
      >
        {matchHistory.map((match: any, index: number) => {
          return <Match key={index} user={props.user} match={match} />;
        })}
      </div>
    </div>
  );
}
