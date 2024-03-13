export class RoomCoordinate {
  constructor(public x: number, public y: number, public z: number) {}

  toString(): string {
    return `${this.x},${this.y},${this.z}`
  }

  equals(other: RoomCoordinate): boolean {
    return this.x === other.x && this.y === other.y && this.z === other.z
  }

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

    if (finalId == '0000') finalId = '00000000000000000000000000000000'
    return finalId
  }
}
