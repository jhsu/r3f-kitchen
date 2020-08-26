import React from "react";
import * as THREE from "three";
import { useLoader, ReactThreeFiber } from "react-three-fiber";
import { MeshStandardMaterial } from "three";

interface HeaderProps {
  position: ReactThreeFiber.Vector3;
}
const Header = ({ position }: HeaderProps) => {
  const font = useLoader(THREE.FontLoader, "/Corbel_Regular.json");
  return (
    <mesh position={position} rotation={[0, Math.PI - 1 / 2, 0]}>
      <textGeometry
        attach="geometry"
        args={["Front-end Guild", { font, size: 1.8, height: 0.2 }]}
      />
      <meshStandardMaterial attach="material" color="orange" />
    </mesh>
  );
};

export default Header;
