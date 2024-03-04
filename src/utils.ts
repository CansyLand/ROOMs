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
import { Quaternion, Vector3 } from '@dcl/sdk/math'
import { CansyComponent } from './components'
import { movePlayerTo } from '~system/RestrictedActions'
import { sceneManager } from '.'

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
  //sceneManager.addEntiy()
  switch (shape) {
    case 'box':
      MeshRenderer.setBox(entity)
      //sceneManager.addPolygon(12)
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

/**
 * Creates a substring extractor for a given string. This extractor function returns
 * another function that, when called with a length, returns a substring of that length
 * starting from the current position in the original string. After reaching the end
 * of the string, it loops back to the beginning, allowing for continuous substring
 * extraction in a cyclic manner. The extractor keeps track of the position, ensuring
 * sequential extraction based on the last extraction point.
 *
 * @param initialString The initial string from which substrings will be extracted.
 * @returns A function that takes a length (number) and returns a substring of the
 *          specified length from the initial string, looping back to the start if
 *          the end is reached.
 */
export function createSubstringExtractor(initialString: string) {
  let currentPosition = 0 // Keeps track of the current position within the string

  return function getNextSubstring(length: number): string {
    const totalLength = initialString.length
    let substring: string

    // Check if we need to loop back to the start of the string
    if (currentPosition + length > totalLength) {
      // If the requested substring extends beyond the string's end, wrap around
      substring =
        initialString.substring(currentPosition) + initialString.substring(0, (currentPosition + length) % totalLength)
      currentPosition = (currentPosition + length) % totalLength
    } else {
      // Extract the substring normally
      substring = initialString.substring(currentPosition, currentPosition + length)
      currentPosition += length
    }

    return substring
  }
}

/**
 * Maps a number from its original range to a specified target range.
 *
 * @param value The number to be mapped.
 * @param minTarget The minimum value of the target range.
 * @param maxTarget The maximum value of the target range.
 * @returns The number mapped to the target range.
 */
export function mapNumberToRange(value: number, minTarget: number, maxTarget: number): number {
  // Determine the maximum possible value based on the length of the input number
  const maxBase = Math.pow(10, value.toString().length) - 1

  // Normalize the value to a 0-1 range (relative to its possible max value)
  const normalized = value / maxBase

  // Scale the normalized value to the target range
  return minTarget + normalized * (maxTarget - minTarget)
}

export function getQuaternion(roomId: string): Quaternion {
  const substring = createSubstringExtractor(roomId)

  // Extract substring values and map them to angles
  const angleX = mapNumberToRange(parseInt(substring(2), 10), 0, 360) // 0 to 360 degrees for X-axis rotation
  const angleY = mapNumberToRange(parseInt(substring(2), 10), 0, 360) // 0 to 360 degrees for Y-axis rotation
  const angleZ = mapNumberToRange(parseInt(substring(2), 10), 0, 360) // 0 to 360 degrees for Z-axis rotation

  // Create quaternion from Euler angles
  const quaternion = Quaternion.fromEulerDegrees(angleX, angleY, angleZ)

  return quaternion
}

class MyQuaternion {
  constructor(public w: number, public x: number, public y: number, public z: number) {}

  static multiply(q1: MyQuaternion, q2: MyQuaternion): MyQuaternion {
    return new MyQuaternion(
      q1.w * q2.w - q1.x * q2.x - q1.y * q2.y - q1.z * q2.z, // real part
      q1.w * q2.x + q1.x * q2.w + q1.y * q2.z - q1.z * q2.y, // i component
      q1.w * q2.y - q1.x * q2.z + q1.y * q2.w + q1.z * q2.x, // j component
      q1.w * q2.z + q1.x * q2.y - q1.y * q2.x + q1.z * q2.w // k component
    )
  }

  static invert(q: MyQuaternion): MyQuaternion {
    let norm = q.w * q.w + q.x * q.x + q.y * q.y + q.z * q.z
    return new MyQuaternion(q.w / norm, -q.x / norm, -q.y / norm, -q.z / norm)
  }
}

// Function to rotate a vector using MyQuaternion
export function rotateVector(
  v: { x: number; y: number; z: number },
  q: MyQuaternion
): { x: number; y: number; z: number } {
  let vectorQuat = new MyQuaternion(0, v.x, v.y, v.z)
  let qInverse = MyQuaternion.invert(q)
  let rotatedQuat = MyQuaternion.multiply(MyQuaternion.multiply(q, vectorQuat), qInverse)

  return { x: rotatedQuat.x, y: rotatedQuat.y, z: rotatedQuat.z }
}
