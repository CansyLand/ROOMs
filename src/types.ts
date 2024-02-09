import { Quaternion, Vector3 } from '@dcl/sdk/math'

export class RoomCoordinate {
  x: number
  y: number
  z: number

  constructor(x: number, y: number, z: number) {
    this.x = x
    this.y = y
    this.z = z
  }

  toString() {
    return `${this.x},${this.y},${this.z}`
  }

  equals(other: RoomCoordinate): boolean {
    return this.x === other.x && this.y === other.y && this.z === other.z
  }
}

export type IArrayOptions = {
  shape: string[]
  startPosition: Vector3
  endPosition: Vector3
  length: number
  rotation?: Quaternion
}
