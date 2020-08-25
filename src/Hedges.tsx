import React from "react";

import * as THREE from "three";
import { ReactThreeFiber, useLoader } from "react-three-fiber";
import { Mesh } from "three";

type HedgesProps = ReactThreeFiber.Object3DNode<Mesh, typeof Mesh>;

const Hedges = (props: HedgesProps) => {
  const [green, bump, displ] = useLoader<THREE.Texture[]>(THREE.TextureLoader, [
    "/hedges.png",
    "/laves_bump.png",
    "/hedges_disp.png",
  ]);
  return (
    <mesh {...props} scale={[5, 4, 1]}>
      <boxBufferGeometry attach="geometry" args={[5, 5, 1, 64, 64]} />
      <meshStandardMaterial
        attach="material"
        map={green}
        bumpMap={bump}
        bumpScale={0.01}
        displacementMap={displ}
        displacementScale={0.1}
      />
    </mesh>
  );
};

export default Hedges;
