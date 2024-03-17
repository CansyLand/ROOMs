import { Quaternion, Vector3 } from '@dcl/sdk/math'
import { createSubstringExtractor, mapNumberToRange } from './miscUtils'
import { DeepReadonlyObject } from '@dcl/sdk/ecs'

export function rotateVector(vector: Vector3, quaternion: Quaternion): Vector3 {
  // Similar to the previous function, rotate the vector by the quaternion
  const vectorQuat = Quaternion.create(vector.x, vector.y, vector.z, 0)
  const rotatedQuat = Quaternion.multiply(vectorQuat, MyQuaternion.invert(quaternion))
  return Vector3.create(rotatedQuat.x, rotatedQuat.y, rotatedQuat.z)
}

export class MyQuaternion {
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

export function quaternionToDirection(
  quaternion: DeepReadonlyObject<{ x: number; y: number; z: number; w: number }>
): Vector3 {
  // Assuming quaternion is { w, x, y, z }
  const { w, x, y, z } = quaternion

  const vx = 2 * (x * z + w * y)
  const vy = 2 * (y * z - w * x)
  const vz = 1 - 2 * (x * x + y * y)

  return { x: vx, y: vy, z: vz } // Assuming Vector3 is structured as { x, y, z }
}
