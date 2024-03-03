import { engine, Entity } from '@dcl/sdk/ecs'

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

  toId(): string {
    // Initial simple hash calculation as a numeric value
    let numericHash = this.simpleHashFunction(this.toString())

    // Scramble the hash to diversify it
    numericHash = RoomCoordinate.scramble(numericHash)

    // Convert the hash to a numeric string, ensuring it's purely numeric
    let numericString = numericHash.toString()

    // Ensure the string is 40 digits long
    while (numericString.length < 40) {
      numericString = '0' + numericString // Pad with zeros if too short
    }
    numericString = numericString.substring(0, 40) // Truncate to 40 digits if needed

    return numericString
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

export class SceneInstanceManager {
  currentRoom: RoomCoordinate | null = null
  private roomConfigs: Map<
    string,
    {
      systems: any[]
      setupFunctions: (() => Entity[])[]
    }
  > = new Map()
  private activeSystems: any[] = [] // Keep track of active systems for removal
  private activeEntities: Entity[] = [] // Track active entities for removal
  private indexedRooms: {
    coordinate: RoomCoordinate | null
    systems: any[]
    setupFunctions: (() => Entity[])[]
  }[] = [] // Adjusted to store both room configurations and optional coordinates

  constructor() {
    this.initDefaultRoom()
  }

  private initDefaultRoom(): void {
    const defaultCoordinate = new RoomCoordinate(0, 0, 0)
    this.loadScene(defaultCoordinate) // Load the initial room
  }

  loadScene(coordinate: RoomCoordinate): void {
    this.currentRoom = coordinate

    console.log(`Loading room at ${coordinate.toString()}`)
    console.log(`Hash ${coordinate.toId()}`)

    // Clear previous room entities and systems
    this.clearCurrentRoom()

    // Try to get a predefined room configuration based on the coordinate
    const roomConfig = this.roomConfigs.get(coordinate.toString())
    if (roomConfig) {
      this.activateRoomConfig(roomConfig)
    } else {
      // If there's no predefined configuration, select a room based on the hash
      const index = parseInt(coordinate.toId().substring(0, 2)) // Convert the first 2 hex digits of the hash to an integer
      const randomRoomConfig = this.getRoomByIndex(index)
      if (randomRoomConfig) {
        this.activateRoomConfig(randomRoomConfig)
      } else {
        console.error('No room configuration found for the given index.')
      }
    }
  }

  private activateRoomConfig(config: {
    coordinate?: RoomCoordinate | null
    systems: any[]
    setupFunctions: (() => Entity[])[]
  }): void {
    // Add systems for the new room
    config.systems.forEach((system, index) => {
      const systemIdentifier = `system-${index}`
      engine.addSystem(system, index, systemIdentifier)
      this.activeSystems.push(systemIdentifier) // Track active systems
    })

    // Execute setup functions for the new room and track entities
    config.setupFunctions.forEach((setupFunction) => {
      const entities = setupFunction()
      this.activeEntities.push(...entities) // Track active entities
    })
  }

  transitionToScene(newCoordinate: RoomCoordinate): void {
    if (!this.currentRoom || !this.currentRoom.equals(newCoordinate)) {
      this.loadScene(newCoordinate) // Load the new room
    }
  }

  addRoomAtCoordinate(coordinate: RoomCoordinate, systems: any[], setupFunctions: (() => Entity[])[]): void {
    this.roomConfigs.set(coordinate.toString(), { systems, setupFunctions })
  }

  addRoom(systems: any[], setupFunctions: (() => Entity[])[]): void {
    this.indexedRooms.push({ coordinate: null, systems, setupFunctions }) // Append to the list with a null coordinate
  }

  getRoomByIndex(index: number): {
    coordinate: RoomCoordinate | null
    systems: any[]
    setupFunctions: (() => Entity[])[]
  } {
    if (this.indexedRooms.length === 0) {
      throw new Error('No rooms have been added.')
    }
    // Use modulus to ensure the index loops over the collection
    const effectiveIndex = index % this.indexedRooms.length
    return this.indexedRooms[effectiveIndex]
  }

  private clearCurrentRoom(): void {
    // Remove all active systems
    this.activeSystems.forEach((system) => engine.removeSystem(system))
    this.activeSystems = []

    // Remove all active entities
    this.activeEntities.forEach((entity) => engine.removeEntityWithChildren(entity))
    this.activeEntities = []
  }
}
