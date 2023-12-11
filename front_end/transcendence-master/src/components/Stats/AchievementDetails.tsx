import { useEffect, useState } from "react";
import getData from "../../utilities/getData";
import { achievements } from "../../types/types";


const myAchievment: achievements[] = [
  {
    name: "Extrovert",
    description: "Join a group chat for the first time.",
    isValid: false,
  },
  {
    name: "Pioneer",
    description: "Create your first group chat.",
    isValid: false,
  },
  {
    name: "Who's the boss now, huh?",
    description: "Become an admin in a group chat.",
    isValid: false,
  },
  {
    name: "Can you please shut up?",
    description: "Get muted in a group chat.",
    isValid: false,
  },
]

function Achievement({ name, description }: any) {
  return (
    <div  className="flex justify-around items-center mb-[10px]  mx-[50px] h-[60px]  rounded-[10px]">
      <div className="w-[50%]">
        <h1 className="text-[1em] font-bold">{name}</h1>
        <p className="font-normal text-[10px]">{description}</p>
      </div>
      <div className="">
        <svg className="w-[40px] h-[40px]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" >
          <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
          <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round" ></g>
          <g id="SVGRepo_iconCarrier">
            {" "}
            <path d="M9 12L11 14L15 10M12 3L13.9101 4.87147L16.5 4.20577L17.2184 6.78155L19.7942 7.5L19.1285 10.0899L21 12L19.1285 13.9101L19.7942 16.5L17.2184 17.2184L16.5 19.7942L13.9101 19.1285L12 21L10.0899 19.1285L7.5 19.7942L6.78155 17.2184L4.20577 16.5L4.87147 13.9101L3 12L4.87147 10.0899L4.20577 7.5L6.78155 6.78155L7.5 4.20577L10.0899 4.87147L12 3Z" stroke="#6F37CF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" ></path>{" "}
          </g>
        </svg>
      </div>
    </div>
  )

}

export default function AchievementDetails(props: any) {
  ;
  const [updateAchievement, setUpdateAchievement] = useState<achievements[]>();
  useEffect(() => {
    getData("http://localhost:3003/profile/achievements")
      .then((res: any) => {

        const update = myAchievment.map((item: achievements) => ({
          ...item,
          isValid: res.achievements.some((name: string) => name === item.name)
        }));
        setUpdateAchievement(update);
      });
  }, []);

  return (
    <div className="w-full mt-[30px] md:mt-[0px]">
      <div className="flex flex-col m-auto  items-center w-[50%] mb-[1.5em]">
        <div className="text-inherit mb-[7px]">{props.title}</div>
        <div className='p-[0px] line-breaker m-auto w-[90%] h-[1px] bg-[rgb(64,64,68)]'></div>
      </div>
      <div className="overflow-y-scroll h-[200px] w-full">
        {updateAchievement && updateAchievement.map((item: achievements) => {
          if (item.isValid) {
            return (
              <Achievement key={item.name} name={item.name} description={item.description} isValid={item.isValid} />
            )
          }
        })}
      </div>
    </div>
  );
}