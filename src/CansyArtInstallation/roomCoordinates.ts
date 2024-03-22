/**
 * Represents a coordinate in a 3D room.
 */
export class RoomCoordinate {
  constructor(public x: number, public y: number, public z: number) {}

  toString(): string {
    return `${this.x},${this.y},${this.z}`
  }

  equals(other: RoomCoordinate): boolean {
    return this.x === other.x && this.y === other.y && this.z === other.z
  }

  private static hashFunction(x: number, y: number, z: number): number {
    // Simple hash function; adjust as needed
    let hash = 5381
    hash = (hash << 5) + hash + x
    hash = (hash << 5) + hash + y
    hash = (hash << 5) + hash + z
    return hash & 0x7fffffff // Ensure positive 32-bit integer
  }

  private static pseudoRandomPermutation(input: number): string {
    let seed = input
    let output = new Array(20).fill(0).map(() => {
      seed = (seed * 1664525 + 1013904223) & 0xffffffff // Example LCG parameters
      return seed % 10 // This should ensure all digits from 0-9 are possible
    })
    return output.join('')
  }

  toUniqueId(): string {
    const hash = RoomCoordinate.hashFunction(this.x, this.y, this.z)
    let id = RoomCoordinate.pseudoRandomPermutation(hash)
    id = id.replace(/-/g, '') // Remove any hyphen characters from the ID
    return id
  }

  // toUniqueId(): string {
  //   let originalId = this.toUniqueIdOriginal() // Call the original method instead of itself
  //   let reversedId = [...originalId].reverse().join('')

  //   // Assuming originalId and reversedId are of the same length
  //   let summedId = ''
  //   let carry = 0
  //   for (let i = 0; i < originalId.length; i++) {
  //     // Convert each character to a number, add them along with any carry from the previous step
  //     let sum = parseInt(originalId[i], 10) + parseInt(reversedId[i], 10) + carry

  //     // If the sum is 10 or more, we carry over to the next digit
  //     carry = Math.floor(sum / 10)
  //     sum = sum % 10 // We only want the remainder for the current position

  //     summedId += sum.toString()
  //   }

  //   // If there's a carry left after the last addition, append it to the result
  //   if (carry > 0) {
  //     summedId += carry.toString()
  //   }

  //   return summedId
  // }

  // Method to test and log distribution of digits in IDs
  static testDistribution(): void {
    // Initialize a structure to hold the distribution of digits for each index
    const distribution: { [index: number]: { [digit: string]: number } } = {}
    for (let i = 0; i < 20; i++) {
      // Assuming IDs are 20 digits long
      distribution[i] = { '0': 0, '1': 0, '2': 0, '3': 0, '4': 0, '5': 0, '6': 0, '7': 0, '8': 0, '9': 0 }
    }

    // Generate IDs and update the distribution object for coordinates -5 to 5
    for (let x = -5; x <= 5; x++) {
      for (let z = -5; z <= 5; z++) {
        const room = new RoomCoordinate(x, 0, z)
        const id = room.toUniqueId()

        // Update the distribution counts based on the current ID
        ;[...id].forEach((digit, index) => {
          if (distribution[index] && distribution[index][digit] !== undefined) {
            distribution[index][digit] += 1
          }
        })
      }
    }

    // Log the distribution results
    Object.keys(distribution).forEach((indexStr) => {
      const index = parseInt(indexStr, 10) // Explicitly convert index to number
      console.log(`Distribution at index ${index}:`)
      Object.keys(distribution[index]).forEach((digit) => {
        console.log(`  Digit ${digit}: ${distribution[index][digit]}`)
      })
    })
  }
}
