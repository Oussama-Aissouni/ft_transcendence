import EndGame from "./EndGame";
import { useEffect, useState } from "react";
import PlayFriend from "./PlayFriend";
import FriendInQueue from "./FriendInQueue";
import { useNavigate } from "react-router-dom";
import FriendForfeit from "./FriendForfeit";

export default function PvF(props: any) {

    function handleFriendUnexpectedDisconn() {
        props.socket.emit('friendLeftGame')
    }

    const [connected, setConnected] = useState<boolean>(false);
    const [start, setStarted] = useState<boolean>(false)
    const [room, setRoom] = useState<number>(NaN);
    const [scoreBoard, setScoreBoard] = useState({});
    const [opponentData, setOpponentData] = useState({});
    const [stop, setStop] = useState(false);
    const [result, setResult] = useState("");
    const [forfeit, setForfeit] = useState({ opp: null, end: false });
    const navigate = useNavigate();

    useEffect(() => {
        if (props.socket) {
            setConnected(true)
        }
        if (props.socket && connected) {
            props.socket.emit('friendQueue', props.userId);
        }
    }, [connected])

    useEffect(() => {
        if (props.socket) {

            props.socket.on('friendDisconn', () => {
                setConnected(false);
                setStarted(false)
            })

            props.socket.on('friendConnection', () => {
                setConnected(true);
            })

            props.socket.on('friendJoinedRoom', (room: number) => {
                setRoom(room);
            })

            props.socket.on('friendStart', () => {
                setStarted(true);
            })

            props.socket.on('friendOpponentData', (data: any) => {
                setOpponentData(data);
            })

            props.socket.on('friendUnexpectedEnding', (data: any) => {
                setForfeit({ opp: data, end: true });
                setStop(true);
            })

            props.socket.on('friendAFK', (id: any) => {
                setForfeit({ opp: id, end: true });
                setStop(true);
                props.socket.emit('friendAFK', id);
            })

            props.socket.on('leave', () => {
                navigate("/")
            })

            props.socket.on('friendScoreBoard', (data: Object) => {
                setScoreBoard(data)
            })

            props.socket.on('friendWon', () => {
                setResult("won")
            })

            props.socket.on('friendLost', () => {
                setResult("lost")
            })

            props.socket.on('friendStop', () => {
                setStop(true);
            })
        }

        return (() => {
            if (props.socket) {
                props.socket.off('friendConnection');
                props.socket.off('friendDisconn');
                props.socket.off('friendJoinedRoom');
                props.socket.off('friendStart');
                props.socket.off('friendStop');
                props.socket.off('friendWon');
                props.socket.off('friendLost');
                props.socket.off('friendUnexpectedEnding');
            }
        })
    }, [room, start, stop])

    if (start && connected && !stop) {
        return (
            <PlayFriend opponentData={opponentData} scoreBoard={scoreBoard} socket={props.socket} room={room} handleFriendUnexpectedDisconn={handleFriendUnexpectedDisconn} />
        )
    }
    else if (start && connected && stop && !forfeit.end) {
        return (
            <EndGame result={result} socket={props.socket} room={room} />
        )
    }
    else if (connected && stop && forfeit.end) {
        return (
            <FriendForfeit/>
        )
    }
    else {
        return (
            <FriendInQueue socket={props.socket} />
        )
    }
}
