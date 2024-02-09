import { engine, Entity } from '@dcl/sdk/ecs'
import { RoomCoordinate } from '../types'

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

  loadScene(coordinate: RoomCoordinate): void {
    console.log(`Loading room at ${coordinate.toString()}`)
    this.currentRoom = coordinate

    // Clear previous room entities and systems
    this.clearCurrentRoom()

    const roomConfig = this.roomConfigs.get(coordinate.toString())
    if (roomConfig) {
      // Add systems for the new room
      let index = 0
      roomConfig.systems.forEach((system) => {
        const systemIdentifier = 'system-' + index
        engine.addSystem(system, index, systemIdentifier)
        this.activeSystems.push(systemIdentifier) // Track active systems
      })

      // Execute setup functions for the new room and track entities
      roomConfig.setupFunctions.forEach((setupFunction) => {
        const entities = setupFunction()
        this.activeEntities.push(...entities) // Track active entities
      })
    }
  }

  transitionToScene(newCoordinate: RoomCoordinate): void {
    if (!this.currentRoom || !this.currentRoom.equals(newCoordinate)) {
      this.loadScene(newCoordinate) // Load the new room
    }
  }

  addRoom(coordinate: RoomCoordinate, systems: any[], setupFunctions: (() => Entity[])[]): void {
    this.roomConfigs.set(coordinate.toString(), { systems, setupFunctions })
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
