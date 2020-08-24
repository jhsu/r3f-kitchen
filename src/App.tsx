import React, {
  useRef,
  useState,
  useCallback,
  useEffect,
  RefObject,
  useMemo,
  ReactChildren,
  ReactNode,
} from "react";
import { Canvas, useFrame } from "react-three-fiber";
import { OrbitControls } from "drei";
import { a, useSprings } from "react-spring/three";
import { Billboard, Html, Sky } from "drei";

import "./App.css";
import {
  loadAndUseBodypix,
  segmentPerson,
  drawSegmentation,
  getSegmentationImage,
} from "./bodypix/bodypix";
import { BodyPix } from "@tensorflow-models/body-pix";
import { DataTexture } from "three";

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
            transparent
          />
        </a.mesh>
      ))}
    </>
  );
};

interface WebcamProps {
  children?: ReactNode;
  video?: HTMLVideoElement | null;
}
const Webcam = ({ children, video }: WebcamProps) => {
  if (!video) {
    return null;
  }
  // const map = useMemo(() => {
  //   return new THREE.VideoTexture(video);
  // }, [video]);
  return (
    <Billboard follow args={[10, 5]} position={[-4, -2, 0]}>
      <meshBasicMaterial attach="material" transparent>
        <videoTexture attach="map" args={[video]} />
        {children}
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
  const [bodyNet, setBodyNet] = useState<BodyPix>();
  const [startSegment, setStartSegment] = useState(false);
  const dataTexture = useRef<DataTexture | null>(null);

  useEffect(() => void setupWebcam(video), [video]);

  useEffect(() => {
    if (!video) return;

    async function readyModel() {
      const net = await loadAndUseBodypix(1);
      setBodyNet(net);
    }
    readyModel();

    function videoDataLoaded() {
      setStartSegment(true);
    }

    video.addEventListener("loadeddata", videoDataLoaded, { once: true });
    return () => {
      video.removeEventListener("loadeddata", videoDataLoaded);
    };
  }, [video]);

  useFrame(async () => {
    if (startSegment && video && bodyNet && dataTexture.current) {
      const segmentation = await segmentPerson(bodyNet, video);
      const img = getSegmentationImage(segmentation);
      dataTexture.current.image = img;
      dataTexture.current.needsUpdate = true;
    }
  });

  return (
    <>
      <Webcam video={video}>
        <dataTexture attach="alphaMap" ref={dataTexture} flipY />
      </Webcam>
      <Html>
        <video
          width={1280}
          height={720}
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
