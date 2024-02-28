import {
  CameraMode,
  CameraType,
  DeepReadonlyObject,
  Entity,
  GltfContainer,
  Material,
  MeshRenderer,
  Transform,
  engine
} from '@dcl/sdk/ecs'
import { Vector3 } from '@dcl/sdk/math'
import { CansyComponent } from './components'
import { movePlayerTo } from '~system/RestrictedActions'

export function getRandomHexColor(): string {
  const letters = '0123456789ABCDEF'
  let color = '#'
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)]
  }
  return color
}

// Calculate the position for an index along a line defined by startPosition and endPosition
export function calculatePositionAlongLine(
  startPosition: Vector3,
  endPosition: Vector3,
  index: number,
  totalLength: number
): Vector3 {
  // Manually calculate the difference for each component
  const differenceX = endPosition.x - startPosition.x
  const differenceY = endPosition.y - startPosition.y
  const differenceZ = endPosition.z - startPosition.z

  // Calculate the step for each component based on the total length
  const stepX = differenceX / Math.max(1, totalLength - 1)
  const stepY = differenceY / Math.max(1, totalLength - 1)
  const stepZ = differenceZ / Math.max(1, totalLength - 1)

  // Calculate the new position based on the index
  const positionX = startPosition.x + stepX * index
  const positionY = startPosition.y + stepY * index
  const positionZ = startPosition.z + stepZ * index

  // Return a new Vector3 with the calculated position
  return Vector3.create(positionX, positionY, positionZ)
}

export function addShape(entity: Entity, shape: string): void {
  switch (shape) {
    case 'box':
      MeshRenderer.setBox(entity)
      break

    case 'plane':
      MeshRenderer.setPlane(entity)
      break

    case 'sphere':
      MeshRenderer.setSphere(entity)
      break

    case 'cylinder':
      MeshRenderer.setCylinder(entity, 1, 1)
      break

    case 'cone':
      MeshRenderer.setCylinder(entity, 0, 1)
      break

    default:
      GltfContainer.create(entity, {
        src: shape
      })
      break
  }
}

export function changeMaterial(material: any) {
  for (const [entity] of engine.getEntitiesWith(CansyComponent)) {
    Material.setPbrMaterial(entity, material)
  }
}

// This function teleports the player to the portal on the other side of the room
// to create the illusion of going trrough the portal ontp a new room
export function movePlayerThroughPortal() {
  // Assuming we have a way to get and set the player's position
  const playerPos = Transform.get(engine.PlayerEntity).position

  // Define the midpoint for mirroring
  const midPoint = 8

  // Calculate new positions
  let newX = playerPos.x
  let newZ = playerPos.z

  // Mirror across the midpoint (8, 0, 8)
  if (playerPos.x !== midPoint) {
    newX = midPoint + (midPoint - playerPos.x)
  }

  if (playerPos.z !== midPoint) {
    newZ = midPoint + (midPoint - playerPos.z)
  }

  movePlayerTo({
    newRelativePosition: { x: newX, y: playerPos.y, z: newZ }
  })

  console.log(`Player moved to (${newX}, ${playerPos.y}, ${newZ})`)
}

export function rotateCamera(): Vector3 {
  const playerPos = Transform.get(engine.PlayerEntity).position
  const playerRot = Transform.get(engine.PlayerEntity).rotation // Quaternion x,y,z,w
  const cameraPos = Transform.get(engine.CameraEntity).position
  const cameraEntity = CameraMode.get(engine.CameraEntity)

  let lookAtX = cameraPos.x
  let lookAtY = 0 // Desired camera height
  let lookAtZ = cameraPos.z

  console.log(cameraPos)

  if (cameraEntity.mode == CameraType.CT_THIRD_PERSON) {
    console.log('The player is using the 3rd person camera')
    // Adjustments for third person are already correctly handled
  } else {
    console.log('The player is using the 1st person camera')

    // Convert quaternion rotation to directional vector
    const direction = quaternionToDirection(playerRot) // This function needs to be implemented

    // Calculate a point behind the player based on the direction they are facing
    // Assuming a fixed distance behind the player
    const distanceBehind = 10 // Distance behind the player to focus the camera
    lookAtX = playerPos.x - direction.x * distanceBehind
    lookAtZ = playerPos.z - direction.z * distanceBehind

    // Y remains the same as defined above
  }

  // Use this for moving the player or adjusting camera focus
  movePlayerTo({
    newRelativePosition: playerPos,
    cameraTarget: Vector3.create(lookAtX, lookAtY, lookAtZ)
  })

  console.log({ x: lookAtX, y: lookAtY, z: lookAtZ })

  return { x: lookAtX, y: lookAtY, z: lookAtZ }
}

function quaternionToDirection(
  quaternion: DeepReadonlyObject<{ x: number; y: number; z: number; w: number }>
): Vector3 {
  // Assuming quaternion is { w, x, y, z }
  const { w, x, y, z } = quaternion

  const vx = 2 * (x * z + w * y)
  const vy = 2 * (y * z - w * x)
  const vz = 1 - 2 * (x * x + y * y)

  return { x: vx, y: vy, z: vz } // Assuming Vector3 is structured as { x, y, z }
}
