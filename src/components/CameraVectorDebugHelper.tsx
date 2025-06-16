import { useFrame, useThree } from '@react-three/fiber'
import { useControls } from 'leva'
import { useRef, useState } from 'react'
import { Text } from '@react-three/drei'
import * as THREE from 'three'

export const CameraVectorHelper = () => {
  const { camera } = useThree()
  const directionArrowRef = useRef<THREE.Group>(null)
  const cameraMarkerRef = useRef<THREE.Mesh>(null)
  const targetPointRef = useRef<THREE.Mesh>(null)

  const [cameraInfo, setCameraInfo] = useState({
    position: { x: 0, y: 0, z: 0 },
    direction: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    lookingAt: { x: 0, y: 0, z: 0 },
  })

  const {
    showHelper,
    rayLength,
    showCameraBox,
    showTargetPoint,
    showDirection,
  } = useControls('Camera Debug Helper', {
    showHelper: { value: false, label: 'Show Camera Debug' },
    rayLength: { value: 10, min: 1, max: 50, label: 'Ray Length' },
    showCameraBox: { value: true, label: 'Show Camera Position' },
    showTargetPoint: { value: true, label: 'Show Where Camera Looks' },
    showDirection: { value: true, label: 'Show Direction Arrow' },
  })

  useFrame(() => {
    if (!showHelper) return

    // Get EXACT camera direction
    const direction = new THREE.Vector3()
    camera.getWorldDirection(direction)

    // Calculate where camera is looking at
    const lookingAt = camera.position
      .clone()
      .add(direction.clone().multiplyScalar(rayLength))

    // Calculate camera marker position (offset so we can see it)
    const cameraUp = new THREE.Vector3()
    camera.getWorldPosition(cameraUp)
    const upOffset = new THREE.Vector3(0, 1, 0) // Offset above camera
    const rightOffset = new THREE.Vector3(1, 0, 0) // Offset to the right
    const cameraMarkerPos = cameraUp.clone().add(upOffset).add(rightOffset)

    // Update debug info
    setCameraInfo({
      position: {
        x: Math.round(camera.position.x * 100) / 100,
        y: Math.round(camera.position.y * 100) / 100,
        z: Math.round(camera.position.z * 100) / 100,
      },
      direction: {
        x: Math.round(direction.x * 1000) / 1000,
        y: Math.round(direction.y * 1000) / 1000,
        z: Math.round(direction.z * 1000) / 1000,
      },
      rotation: {
        x: Math.round(((camera.rotation.x * 180) / Math.PI) * 100) / 100,
        y: Math.round(((camera.rotation.y * 180) / Math.PI) * 100) / 100,
        z: Math.round(((camera.rotation.z * 180) / Math.PI) * 100) / 100,
      },
      lookingAt: {
        x: Math.round(lookingAt.x * 100) / 100,
        y: Math.round(lookingAt.y * 100) / 100,
        z: Math.round(lookingAt.z * 100) / 100,
      },
    })

    // Update camera position marker (yellow cube) - offset so visible
    if (cameraMarkerRef.current) {
      cameraMarkerRef.current.position.copy(cameraMarkerPos)
    }

    // Update target point (red sphere where camera is looking)
    if (targetPointRef.current) {
      targetPointRef.current.position.copy(lookingAt)
    }

    // Update direction arrow (green cylinder from camera to target)
    if (directionArrowRef.current) {
      const startPos = camera.position
      const endPos = lookingAt
      const distance = startPos.distanceTo(endPos)

      // Position arrow at midpoint
      const midpoint = startPos.clone().add(endPos).multiplyScalar(0.5)
      directionArrowRef.current.position.copy(midpoint)

      // Point arrow toward target
      directionArrowRef.current.lookAt(endPos)

      // Scale cylinder to distance
      directionArrowRef.current.scale.setZ(distance / 2) // Adjust for cylinder default size
    }
  })

  if (!showHelper) return null

  return (
    <group>
      {/* 🟡 YELLOW CUBE = CAMERA POSITION (offset so you can see it) */}
      {showCameraBox && (
        <mesh ref={cameraMarkerRef}>
          <boxGeometry args={[0.5, 0.5, 0.5]} />
          <meshBasicMaterial color="yellow" />
        </mesh>
      )}

      {/* 🟢 GREEN ARROW = CAMERA DIRECTION (thick 3D arrow) */}
      {showDirection && (
        <group ref={directionArrowRef}>
          {/* Arrow shaft (green cylinder) */}
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.05, 0.05, 2]} />
            <meshBasicMaterial color="lime" />
          </mesh>

          {/* Arrow head (green cone) */}
          <mesh position={[0, 0, 1]} rotation={[-Math.PI / 2, 0, 0]}>
            <coneGeometry args={[0.15, 0.5]} />
            <meshBasicMaterial color="lime" />
          </mesh>
        </group>
      )}

      {/* 🔴 RED SPHERE = WHERE CAMERA IS LOOKING */}
      {showTargetPoint && (
        <mesh ref={targetPointRef}>
          <sphereGeometry args={[0.2]} />
          <meshBasicMaterial color="red" />
        </mesh>
      )}

      {/* DEBUG TEXT INFO */}
      <Text
        position={[
          cameraInfo.position.x + 3,
          cameraInfo.position.y + 3,
          cameraInfo.position.z,
        ]}
        fontSize={0.4}
        color="yellow"
        anchorX="left"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="black"
      >
        {`📍 CAMERA AT: (${cameraInfo.position.x}, ${cameraInfo.position.y}, ${cameraInfo.position.z})`}
      </Text>

      <Text
        position={[
          cameraInfo.position.x + 3,
          cameraInfo.position.y + 2.3,
          cameraInfo.position.z,
        ]}
        fontSize={0.4}
        color="lime"
        anchorX="left"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="black"
      >
        {`➡️ LOOKING: (${cameraInfo.direction.x}, ${cameraInfo.direction.y}, ${cameraInfo.direction.z})`}
      </Text>

      <Text
        position={[
          cameraInfo.position.x + 3,
          cameraInfo.position.y + 1.6,
          cameraInfo.position.z,
        ]}
        fontSize={0.4}
        color="red"
        anchorX="left"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="black"
      >
        {`🎯 TARGET: (${cameraInfo.lookingAt.x}, ${cameraInfo.lookingAt.y}, ${cameraInfo.lookingAt.z})`}
      </Text>

      <Text
        position={[
          cameraInfo.position.x + 3,
          cameraInfo.position.y + 0.9,
          cameraInfo.position.z,
        ]}
        fontSize={0.3}
        color="orange"
        anchorX="left"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="black"
      >
        {`🔄 ROTATION: (${cameraInfo.rotation.x}°, ${cameraInfo.rotation.y}°, ${cameraInfo.rotation.z}°)`}
      </Text>
    </group>
  )
}

export default CameraVectorHelper
