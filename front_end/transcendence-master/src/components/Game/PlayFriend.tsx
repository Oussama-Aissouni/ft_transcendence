import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, RoundedBox, Sphere } from "@react-three/drei";
import { DoubleSide, Mesh } from "three";
import ScoreBoard from "./ScoreBoard";
import { useEffect, useState, useRef } from "react";

function Plane() {
    return (
        <mesh rotation-x={Math.PI * -0.5}>
            <planeGeometry args={[15, 20]} />
            <meshBasicMaterial color="rgba(238, 238, 255,1)" side={DoubleSide} />
        </mesh>
    );
}

function RightWall() {
    return (
        <mesh rotation-z={Math.PI * -0.5} rotation-y={-0.5 * Math.PI} position={[7.5, 5, 0]}>
            <planeGeometry args={[10, 20]} />
            <meshBasicMaterial color="rgba(238, 238, 255,1)" side={DoubleSide} transparent={true} opacity={0.5} />
        </mesh>
    )
}

function LeftWall() {
    return (
        <mesh rotation-z={Math.PI * -0.5} rotation-y={0.5 * Math.PI} position={[-7.5, 5, 0]}>
            <planeGeometry args={[10, 20]} />
            <meshBasicMaterial color="rgba(238, 238, 255,1)" side={DoubleSide} transparent={true} opacity={0.5} />
        </mesh>
    )
}

function Ball(props: any) {
    const [ball, setBall] = useState([0, 5, 0])

    useFrame(() => {
        props.socket.emit('friendUpdateBallPos', props.room)
    })

    useEffect(() => {
        props.socket.on('friendUpdateBallPos', (data: any) => {

            if (data.pos === 1)
                setBall([data.ball.x, data.ball.y, data.ball.z]);
            else
                setBall([data.ball.x, data.ball.y, -data.ball.z]);
        });

        return () => {
            props.socket.off('friendUpdateBallPos');
        };
    }, [props.socket]);

    return (
        <>
            <Sphere args={[0.3, 10, 10]} position={[ball[0], ball[1], ball[2]]}>
                <meshBasicMaterial color="red" />
            </Sphere>
        </>
    )
}

function PlayerPaddle(props: any) {

    const refPlayer1 = useRef<Mesh>(null);

    useFrame(({ mouse }) => {
        if (refPlayer1.current) {
            refPlayer1.current.position.x = -(((1 - mouse.x) * 15) - 15);

            if (refPlayer1.current.position.x < -6 || refPlayer1.current.position.x > 6) {
                if (refPlayer1.current.position.x < -6)
                    refPlayer1.current.position.x = -6;
                if (refPlayer1.current.position.x > 6)
                    refPlayer1.current.position.x = 6;
            }
            props.socket.emit('friendPlayerPos', { room: props.room, position: refPlayer1.current.position.x })
        }
    })
    return (
        <mesh>
            <RoundedBox ref={refPlayer1} args={[3, 0.5, 0.5]} radius={0.2} position={[0, 0.3, 10]}>
                <meshBasicMaterial color="rgba(111, 55, 207, 1)" />
            </RoundedBox>
        </mesh>
    )
}

function OpponentPaddle(props: any) {
    const [pos, setPos] = useState(0)

    useEffect(() => {
        props.socket.on('friendUpdateOpponentPos', (pos: number) => {
            setPos(pos)
        })
    }, [pos])

    return (
        <mesh>
            <RoundedBox args={[3, 0.5, 0.5]} radius={0.2} position={[pos, 0.3, -10]}>
                <meshBasicMaterial color="rgba(111, 55, 207, 1)" />
            </RoundedBox>
        </mesh>
    )
}

function GameObjects(props: any) {

    return (
        <>
            <PlayerPaddle socket={props.socket} room={props.room} />
            <OpponentPaddle socket={props.socket} />
            <Ball socket={props.socket} room={props.room} />
        </>
    );
}

export default function PlayFriend(props: any) {

    useEffect(() => {
        window.addEventListener('popstate', props.handleFriendUnexpectedDisconn)
    }, [])

    return (
        <div className="flex flex-col w-full">
            <ScoreBoard scoreBoard={props.scoreBoard} opponentData={props.opponentData} />
            <Canvas camera={{ position: [0, 4, 20] }}>
                <OrbitControls enableRotate={false} />
                <Plane />
                <GameObjects socket={props.socket} room={props.room} />
                <RightWall />
                <LeftWall />
            </Canvas>
        </div>
    )
}
