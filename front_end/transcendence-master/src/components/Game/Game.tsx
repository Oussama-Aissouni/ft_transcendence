import { useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, RoundedBox, Sphere } from "@react-three/drei";
import { DoubleSide, Mesh } from "three";


var direction:number;
var speed:number;
var xval:number;
var xdir:number;
var move:boolean;

function init()
{
  direction = 1;
  speed = 0.2;
  xval = 0;
  xdir = 1;
  move = false;
}

init();

function Plane() {
  return (
    <mesh rotation-x={Math.PI * -0.5}>
      <planeGeometry args={[15, 20]} />
      <meshBasicMaterial color="rgba(238, 238, 255,1)" side={DoubleSide} />
    </mesh>
  );
}

function GameObjects(props:any) {
  const refPlayer = useRef<Mesh>(null);
  const refCpu = useRef<Mesh>(null);
  const refBall = useRef<Mesh>(null);
  const [playerX, setPlayerX] = useState(0);
  const [cpuX, setCpuX] = useState(0);
  const [ballX, setBallX] = useState(0);

  useFrame(({ mouse }) => {
    
    //player management
    if (refPlayer.current) {
      refPlayer.current.position.x = -((1 - mouse.x) * 15 - 15);
      setPlayerX(-((1 - mouse.x) * 15 - 15))
      if (refPlayer.current.position.x < -7.5 || refPlayer.current.position.x > 7.5)
      {
        if (refPlayer.current.position.x < -7.5)
        {
          refPlayer.current.position.x = -7.5;
          setPlayerX(-7.5)
        }
        if (refPlayer.current.position.x > 7.5)
        {
          refPlayer.current.position.x = 7.5;
          setPlayerX(7.5)
        }
      }
    }

    //cpu management
    if (refCpu.current)
    {
      setCpuX(refCpu.current.position.x);
      if (move)
      {
        if (ballX > refCpu.current.position.x)
          refCpu.current.position.x += Number(props.difficulty);  
        if(ballX < refCpu.current.position.x)
          refCpu.current.position.x -= Number(props.difficulty); 
      }
    }

    //ball management
    if (refBall.current && !props.pause) {
      //ball collision with player
      if (refBall.current.position.z > 9.5)
      {
        if(Math.abs(refBall.current.position.x - playerX) < 1.5)
        {
          direction = -1;
          xdir = 1;
          xval = (refBall.current.position.x - playerX) / 10
          move = true;
        }
      }
      
      //ball collision with cpu
      if(refBall.current.position.z < -9.5)
      {
        if(Math.abs(refBall.current.position.x - cpuX) < 1.5)
        {
          direction = 1;
          xdir = -1;
          xval = (refBall.current.position.x - cpuX) / 10;
          move = false;
        }
      }

      //ball collision with a wall
      if ((refBall.current.position.x > 7) || (refBall.current.position.x < -7)) xdir *= -1;

      //ball movement
      refBall.current.position.z += direction * speed;
      refBall.current.position.y = -0.5 * ((refBall.current.position.z * refBall.current.position.z) / (20 / 2)) + 5;
      refBall.current.position.x += xval * xdir;
      setBallX(refBall.current.position.x);

      //ball passes boundaries
      if (refBall.current.position.z > 10 || refBall.current.position.z < -10)
      {
        refBall.current.position.x = 0;
        refBall.current.position.y = 1;
        refBall.current.position.z = 0;
        init()
      }
    }
  });

  return (
    <>
      <mesh>
        <RoundedBox ref={refPlayer} args={[3, 0.5, 0.5]} radius={0.2} position={[0, 0.3, 10]}>
          <meshBasicMaterial color={props.color} />
        </RoundedBox>
      </mesh>
      <mesh>
        <RoundedBox ref={refCpu} args={[3, 0.5, 0.5]} radius={0.2} position={[0, 0.3, -10]}>
          <meshBasicMaterial color={props.color} />
        </RoundedBox>
      </mesh>
      <Sphere ref={refBall} args={[0.3, 10, 10]} position={[0, 1, 0]}>
        <meshBasicMaterial color={props.ballColor} />
      </Sphere>
    </>
  );
}

function RightWall()
{
  return(
    <mesh  rotation-z={Math.PI * -0.5} rotation-y={-0.5 * Math.PI} position={[7.5, 5, 0]}>
      <planeGeometry args={[10, 20]} />
      <meshBasicMaterial color="rgba(238, 238, 255,1)" side={DoubleSide} transparent={true} opacity={0.5}/>
    </mesh>
  )
}

function LeftWall()
{
  return(
    <mesh  rotation-z={Math.PI * -0.5} rotation-y={0.5 * Math.PI} position={[-7.5, 5, 0]}>
      <planeGeometry args={[10, 20]} />
      <meshBasicMaterial color="rgba(238, 238, 255,1)" side={DoubleSide} transparent={true} opacity={0.5}/>
    </mesh>
  )
}


export default function Game() {
  // const [cameraPosition, setCameraPosition] = useState<any>([0, 4, 18]);
  const [paddleColor, setPaddleColor] = useState("rgb(111, 55, 207)")
  const [ballColor, setBallColor] = useState("red")
  const [difficulty, setDifficulty] = useState("0.1")
  const [pause, setPause] = useState(false);

  const paddle = useRef<any>();
  const ball = useRef<any>();
  const level = useRef<any>();


  return (
    <div className="flex flex-col w-full">
      <div className="flex flex-row w-[50%] m-auto justify-between">
        <div>
          <label className="dark:text-white" htmlFor="difficulty">difficulty:</label>
          <select ref={level} name="difficulty" id="difficulty" onChange={() => {setDifficulty(level.current.value)}}>
            <option value="0.07">sahel</option>
            <option value="0.1">momkin</option>
            <option value="0.2">imposi</option>
          </select>
        </div>
        <div>
          <label className="dark:text-white" htmlFor="paddle color">paddle color:</label>
          <input className="bg-transparent" name="paddle color" ref={paddle} type="color" /*onClick={() => {setPause(true)}}*/ onChange={() => {setPaddleColor(paddle.current.value)}}></input>
        </div>
        <div>
          <label className="dark:text-white" htmlFor="ball color">ball color</label>
          <input className="bg-transparent" name="ball color" ref={ball} type="color" /*onClick={() => {setPause(true)}}*/ onChange={() => {setBallColor(ball.current.value)}}></input>
        </div>
      </div>
      <div className="h-[80%] w-full" onMouseLeave={() => setPause(true)} onMouseEnter={() => setPause(false)}>
        <Canvas camera={{ position: [0, 4, 18]}} >
          <OrbitControls enableRotate={true} minDistance={25} maxDistance={40}/>
          <Plane/>
          <GameObjects color={paddleColor} ballColor={ballColor} difficulty={difficulty} pause={pause}/>
          <RightWall />
          <LeftWall />
        </Canvas>
      </div>
    </div>
  );
}