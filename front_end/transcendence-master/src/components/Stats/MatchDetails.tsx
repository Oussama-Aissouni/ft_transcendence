import { useEffect, useState } from 'react'
import opponent_data from '../../utilities/opponent_data';
import { SenderData } from '../../types/types';


export interface Token {
  sub: string;
  email: string;
}

function Match(props:any)
{
  const [user, setUser] = useState<SenderData>();
  
  useEffect(() => {
    opponent_data(props.match.opponentId).then((data: any) => {
      setUser(data.user);
    });

  }, []);

  if(user)
  {
    return(
      <div className='w-full h-[60px] rounded-[30px] flex items-center justify-evenly'>
        <img
          className="md:h-[40px] md:w-[40px] h-[40px] w-[40px] rounded-[10px] md:rounded-[30px]"
          src={props.image}
          alt=""/>
        <div className='text-[12px] text-inherit'>{props.user}</div>
        <span className='text-[#EB5E5E] text-[12px]' >{props.match.selfScore} : {props.match.opponentScore}</span>
        <div className='text-[12px] text-inherit'>{user.username}</div>
        <img
        className="md:h-[40px] md:w-[40px] h-[40px] w-[40px] rounded-[10px] md:rounded-[30px]"
        src={user.image}
        alt=""/>
        </div>    
    )
  }
}

export default function MatchDetails(props:any) {
    return (
      <div className='xl:w-full w-[80%] h-[200px] md:h-full md:mt-[30px]'>
        <div className="flex flex-col items-center">
          <div className={`text-${props.color}`}>{props.title}</div>
          <div className='p-[0px] line-breaker m-auto w-[90%] h-[1px] bg-[rgb(64,64,68)]'></div>
        </div>
        <div className={`overflow-y-scroll h-[80%]  text-${props.color}`}>
        {props.history.reverse().map((match: any, index: number) => {
          return <Match key={index} image={props.image} user={props.username} match={match} />;
        })}
        </div>
      </div>
    )
}
