import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom';
import opponent_data from '../../utilities/opponent_data';
import { SenderData } from '../../types/types';

export default function NotifItem(props:any) {

    const notif = props.notif;

    const [senderData, setSenderData] = useState<SenderData>();

    useEffect(() => {
      opponent_data(notif.senderId).then((data: any) => {
        setSenderData(data.user);
      });
    }, [])

    const accept = () => {
        props.socket.emit('acceptedInvite', {roomN: notif.roomId, senderId: notif.senderId, type: notif.type})
    }

    const decline = () => {
        props.socket.emit('declinedInvite', {senderId: notif.senderId})
    }

    if (senderData) {
      
      return (
        <div className="bg-slate-50 dark:bg-[#1A1C26] dark:text-white items-center justify-around w-full h-[50px] flex flex-row border-b-solid border-b-[1px] mt-[3px] border-b-white">
          <img src={senderData.image} className="w-[40px] h-[80%] rounded-[20px]" />
          <div className="w-[40%] text-center text-[15px]">{senderData.username} has invited you to a game</div>
          <div className="flex justify-around w-[40%] h-full items-center">
            <Link className="h-[55%] w-fit" to="/pvf" onClick={accept}>
            <svg className='h-full' viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <rect width="24" height="24" fill="white"></rect> <path fillRule="evenodd" clipRule="evenodd" d="M2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12ZM15.7071 9.29289C16.0976 9.68342 16.0976 10.3166 15.7071 10.7071L12.0243 14.3899C11.4586 14.9556 10.5414 14.9556 9.97568 14.3899L8.29289 12.7071C7.90237 12.3166 7.90237 11.6834 8.29289 11.2929C8.68342 10.9024 9.31658 10.9024 9.70711 11.2929L11 12.5858L14.2929 9.29289C14.6834 8.90237 15.3166 8.90237 15.7071 9.29289Z" fill="#6F37CF"></path> </g></svg>
            </Link>
            <button onClick={decline} className=" h-[55%] w-fit">
            <svg className='h-full' viewBox="0 0 24 24" fill="#EB5E5E" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <rect width="24" height="24" fill="white"></rect> <path fillRule="evenodd" clipRule="evenodd" d="M2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12ZM9.70711 8.29289C9.31658 7.90237 8.68342 7.90237 8.29289 8.29289C7.90237 8.68342 7.90237 9.31658 8.29289 9.70711L10.5858 12L8.29289 14.2929C7.90237 14.6834 7.90237 15.3166 8.29289 15.7071C8.68342 16.0976 9.31658 16.0976 9.70711 15.7071L12 13.4142L14.2929 15.7071C14.6834 16.0976 15.3166 16.0976 15.7071 15.7071C16.0976 15.3166 16.0976 14.6834 15.7071 14.2929L13.4142 12L15.7071 9.70711C16.0976 9.31658 16.0976 8.68342 15.7071 8.29289C15.3166 7.90237 14.6834 7.90237 14.2929 8.29289L12 10.5858L9.70711 8.29289Z" fill="#EB5E5E"></path> </g></svg>
            </button>
          </div>
      </div>
  )
}
  
}