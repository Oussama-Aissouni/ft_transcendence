import { Link } from 'react-router-dom';

export default function FindGame() {
  return (
    <div className='w-[60%] h-[70%] m-auto rounded-[10px] flex flex-col lg:flex-row'>
      <Link to="/play-online" className='w-[70%] h-[30%] m-auto lg:w-[30%] lg:h-[50%] animate-bouncing text-center font-poppins font-bold text-slate-500'>PLAY ONLINE
        <div className='bg-cover bg-center rounded-[20px] w-full h-full  bg-[url("/src/assets/human.jpeg")]'>
        </div>
      </Link>
      <Link to="/play-offline" className='w-[70%] h-[30%] m-auto lg:w-[30%] lg:h-[50%] animate-bouncing1 text-center font-poppins font-bold text-slate-500'>PRACTICE MODE
        <div className='bg-cover bg-center rounded-[20px] w-full h-full  bg-[url("/src/assets/robot.jpeg")]'>
        </div>
      </Link>
    </div>
  )
}