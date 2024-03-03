import { Quaternion, Vector3 } from '@dcl/sdk/math'

export type IArrayOptions = {
  shape: string[]
  startPosition: Vector3
  endPosition: Vector3
  length: number
  rotation?: Quaternion
}
