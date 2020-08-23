import React, {
  useRef,
  useState,
  useCallback,
  useEffect,
  RefObject,
  useMemo,
} from "react";
import { Canvas } from "react-three-fiber";
import { OrbitControls } from "drei";
import { a, useSprings } from "react-spring/three";
import { Billboard, Html, Sky } from "drei";

import "./App.css";

const colors = ["red", "green"];

const Cycle = () => {
  const order = useRef([0, 1]);
  const [springs, set] = useSprings(order.current.length, (idx: number) => ({
    position: order.current[idx],
  }));
  const onClick = () => {
    const reversed = [...order.current].reverse();
    set((idx: number) => ({
      position: reversed[idx],
    }));
    order.current = reversed;
  };

  return (
    <>
      {springs.map(({ position }, idx: number) => (
        <a.mesh
          key={order.current[idx]}
          position={
            position && position.interpolate((pos: number) => [0, 0, 3 * pos])
          }
          onClick={onClick}
        >
          <boxBufferGeometry attach="geometry" args={[1, 1, 1]} />
          <meshStandardMaterial
            attach="material"
            color={colors[order.current[idx]]}
          />
        </a.mesh>
      ))}
    </>
  );
};

interface WebcamProps {
  video?: HTMLVideoElement | null;
}
const Webcam = ({ video }: WebcamProps) => {
  if (!video) {
    return null;
  }
  // const map = useMemo(() => {
  //   return new THREE.VideoTexture(video);
  // }, [video]);
  return (
    <Billboard follow args={[10, 5]} position={[-4, -2, 0]}>
      <meshBasicMaterial attach="material">
        <videoTexture attach="map" args={[video]} />
      </meshBasicMaterial>
    </Billboard>
  );
};

async function setupWebcam(video: HTMLVideoElement | null | undefined) {
  if (!video) return;
  console.log();
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    var constraints = {
      video: { width: 1280, height: 720, facingMode: "user" },
    };
    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      video.srcObject = stream;
      video.play();
    } catch (err) {
      console.error("Unable to access the camera/webcam.", err);
    }
  }
}

const VideoBillboard = () => {
  const [video, setVideo] = useState<HTMLVideoElement | null>();
  useEffect(() => void setupWebcam(video), [video]);

  return (
    <>
      <Webcam video={video} />
      <Html>
        <video
          ref={(el) => {
            if (el) {
              setVideo(el);
            }
          }}
          style={{ display: "none" }}
          autoPlay
          playsInline
        ></video>
      </Html>
    </>
  );
};

function App() {
  return (
    <Canvas shadowMap colorManagement camera={{ position: [0, 0, -4] }}>
      <Sky />
      <OrbitControls />
      <ambientLight position={[0, 5, 0]} intensity={0.5} />
      <pointLight position={[1, 1, 0]} />
      <Cycle />

      <VideoBillboard />
    </Canvas>
  );
}

export default App;
