import Play from "./Play"
import EndGame from "./EndGame";
import InQueue from "./InQueue";
import { useEffect, useState } from "react";
import Forfeit from "./Forfeit";

export default function OnlineGame(props:any) {
        
  function handleUnexpectedDisconn() {
    props.socket.emit('leftGame')
  }

    const [connected, setConnected] = useState<boolean>(false);
    const [start, setStarted] = useState<boolean>(false)
    const [room, setRoom] = useState<number>(NaN);
    const [scoreBoard, setScoreBoard] = useState({});
    const [opponentData, setOpponentData] = useState({});
    const [stop, setStop] = useState(false);
    const [result, setResult] = useState("");
    const [forfeit, setForfeit] = useState({opp:null, end:false});

    useEffect(() =>{
      if(props.socket)
      {
        setConnected(true)
      }
      if(props.socket && connected)
      {
        props.socket.emit('inqueue', props.userId);
      }
    },[connected])

    useEffect(() => {
      
      if(props.socket)
      {
        props.socket.on('disconn', () => {
          setConnected(false);
          setStarted(false)
        })
        
        props.socket.on('connection', () => {
          setConnected(true);
        })

        props.socket.on('joinedRoom', (room:number) => {
          setRoom(room);
        })

        props.socket.on('start', () => {          
          setStarted(true);
        })

        props.socket.on('opponentData', (data:any) => {
          
          setOpponentData(data);
        })

        props.socket.on('unexpectedEnding', (data: any) => {
          window.removeEventListener('popstate', handleUnexpectedDisconn)
          setForfeit({ opp: data, end: true });
          setStop(true);
        })

        props.socket.on('AFK', (id:any) => {
          setForfeit({ opp: id, end: true });
          setStop(true);
          props.socket.emit('handleAFK', id);
        })

        props.socket.on('scoreBoard', (data:Object) => {

          setScoreBoard(data)
        })

        if (stop) {
          props.socket.emit('addMatchHistory', room);
        }

        props.socket.on('won', () => {
          setResult("won")
        })
      
        props.socket.on('lost', () => {
          setResult("lost")
        })

        props.socket.on('stop', () => {
          setStop(true);
        })
      }

      return(() => {
        if (props.socket) {
          props.socket.off('connect');
          props.socket.off('disconnect');
          props.socket.off('joinedRoom');
          props.socket.off('start');
          props.socket.off('stop');
          props.socket.off('won');
          props.socket.off('lost');
        }
      })
    }, [room, start, stop])

    if (start && connected && !stop)
    {
      return (
        <Play opponentData={opponentData} scoreBoard={scoreBoard} socket={props.socket} room={room} handleUnexpectedDisconn={handleUnexpectedDisconn} />
      )
    }
    else if (start && connected && stop && !forfeit.end)
    {
      return(
        <EndGame result={result} socket={props.socket} room={room}/>
      )
    }
    else if (connected && stop && forfeit.end)
    {
      return (
        <Forfeit socket={props.socket} against={forfeit.opp}/>
      )
    }
    else
    {
      return(
        <InQueue socket={props.socket} room={room}/>
      )
    }
}
