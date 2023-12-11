import { useEffect } from 'react'
import { Link } from 'react-router-dom'

export default function Forfeit(props:any) {

    useEffect(() => {
        return(() => {
            props.socket.emit('forfeit', props.against);
        })
    },[])

    return (
        <div className="bg-transparent w-full h-full flex items-center justify-center">
            <dialog open className="bg-transparent">
                <div className={`text-green-400 text-center`}>
                    you won by forfeit
                </div>
                <div className="dark:bg-[#1A1C26] bg-[#EEEEFF] h-[40px] w-[150px] flex items-center justify-center hover:bg-[#6F37CF] dark:hover:bg-[#6F37CF] hover:text-white dark:text-white text-[#8F8F8F] rounded-md" >
                    <Link to="/play">
                        back to queue
                    </Link>
                </div>
            </dialog>
        </div>
    )
}
