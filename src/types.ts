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

  private static simpleChecksum(s: string): number {
    return s.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 256
  }

  private static scramble(hash: string, iterations: number = 10): string {
    let scrambled = hash
    for (let i = 0; i < iterations; i++) {
      const checksum = RoomCoordinate.simpleChecksum(scrambled)
      // Modify the hash by shuffling characters based on the checksum
      scrambled = scrambled
        .split('')
        .map((char, index) => {
          const charCode = scrambled.charCodeAt((index + checksum) % scrambled.length)
          return String.fromCharCode((charCode + checksum) % 256)
        })
        .join('')

      // Re-hash if necessary, for this example we just use the modified string
    }
    return scrambled
  }

  toHash(): string {
    // Initial simple hash calculation
    let hash = this.simpleHashFunction(this.toString())

    // Scramble the hash to diversify it
    hash = RoomCoordinate.scramble(hash)

    // Convert to "hex-like" string and ensure it's the desired length
    let hex = this.toHexLikeString(hash)
    while (hex.length < 40) {
      hex += '0' + hex
    }
    hex = hex.substring(0, 40)

    return '0x' + hex
  }

  private simpleHashFunction(input: string): string {
    let hash = 0
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash // Convert to 32bit integer
    }
    return hash.toString()
  }

  private toHexLikeString(hash: string): string {
    // Convert each character to its char code in hex
    return hash
      .split('')
      .map((char) => char.charCodeAt(0).toString(16))
      .join('')
  }
}

export type IArrayOptions = {
  shape: string[]
  startPosition: Vector3
  endPosition: Vector3
  length: number
  rotation?: Quaternion
}
