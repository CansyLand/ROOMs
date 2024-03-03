export class RoomCoordinate {
  constructor(public x: number, public y: number, public z: number) {}

  toString(): string {
    return `${this.x},${this.y},${this.z}`
  }

  equals(other: RoomCoordinate): boolean {
    return this.x === other.x && this.y === other.y && this.z === other.z
  }

  // private static simpleChecksum(s: string): number {
  //   return s.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 256
  // }

  // private static scramble(hash: string, iterations: number = 10): string {
  //   let scrambled = hash
  //   for (let i = 0; i < iterations; i++) {
  //     const checksum = RoomCoordinate.simpleChecksum(scrambled)
  //     scrambled = scrambled
  //       .split('')
  //       .map((char, index) => {
  //         const charCode = scrambled.charCodeAt((index + checksum) % scrambled.length)
  //         return String.fromCharCode((charCode + checksum) % 256)
  //       })
  //       .join('')
  //   }
  //   return scrambled
  // }

  // toUniqueId(): string {
  //   let numericHash = this.simpleHashFunction(this.toString())
  //   numericHash = RoomCoordinate.scramble(numericHash)
  //   let numericString = numericHash.toString()

  //   while (numericString.length < 40) {
  //     numericString = '0' + numericString
  //   }
  //   numericString = numericString.substring(0, 40)

  //   return numericString
  // }

  // private simpleHashFunction(input: string): string {
  //   let hash = 0
  //   for (let i = 0; i < input.length; i++) {
  //     const char = input.charCodeAt(i)
  //     hash = (hash << 40) - hash + char
  //     hash = hash & hash
  //   }
  //   return hash.toString()
  // }

  toUniqueId(): string {
    // Initial hash function using primes
    const prime1 = 73856093
    const prime2 = 19349663
    const prime3 = 83492791
    let hash = Math.abs((this.x * prime1) ^ (this.y * prime2) ^ (this.z * prime3))

    // Factors to multiply by - these could also be primes or just numbers that provide good distribution
    const factors = [123456789, 987654321, 112233445]
    let idParts = [hash.toString()] // Start with the original hash as the first part of the ID

    // Multiply hash by each factor and use parts of these products to build the ID
    factors.forEach((factor) => {
      let part = (hash * factor).toString()
      // Take different parts of the product to ensure variability
      idParts.push(part.substring(0, 6))
    })

    // Concatenate parts to form the final ID
    let finalId = idParts.join('')
    // Ensure the final ID is not too long or too short
    finalId = finalId.substring(0, 20) // Adjust this as needed

    return finalId
  }
}
