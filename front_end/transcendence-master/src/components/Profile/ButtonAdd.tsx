import { useEffect, useState } from 'react'

import getData from '../../utilities/getData';

export default function ButtonAdd(props: any) {

    const [disable, setDisable] = useState(false);

    const handleFriendReq = () => {
        props.socket.emit('friendRequest', {id : props.userId});
        setDisable(true);
    }

    useEffect(() => {
        getData("http://localhost:3003/profile/friends")
            .then((res: any) => {
                res.map((user:any) => {
                    if (user.userId === props.userId)
                        setDisable(true);
                })
            });
    }, []);

    return (
        <div onClick={handleFriendReq} className={`${disable ? "opacity-70" : ""} bg-[${props.color}] h-[30px] flex text-[10px] w-[70px] sm:w-[100px] sm:text-[15px] justify-center rounded-[10px] text-${props.text}`}>
            <button className='w-[100px] disabled:opacity-70' disabled={disable}>
                {props.value}
            </button>
        </div>
    )
}
