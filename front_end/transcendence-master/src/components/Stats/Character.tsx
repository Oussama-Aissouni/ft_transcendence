import img from '../../assets/007.png'
import img1 from '../../assets/008.png'
import img2 from '../../assets/009.png'

export default function Character(props:any) {

  const winrate:number = (props.wins / (props.wins + props.losses) * 100);
  const image = winrate < 30 ? img : winrate < 70 ? img1 : img2;

  return (
    <div className='flex flex-col items-center'>
      <div>{(!isNaN(winrate) && winrate < 30) ? "get gud" : winrate < 70 ? "decent" : "godlike"}</div>
      <div  className='w-[50%] h-[50%]'>
        <img src={image}/>
      </div>
    </div>
  )
}
