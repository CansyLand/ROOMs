import { engine, Entity } from '@dcl/sdk/ecs'
import { RoomCoordinate } from './roomCoordinates'
import { CansyArtInstallation } from './artInstallation'
import { PlayerManager } from './playerManager'

type SystemFunction = () => void

interface IRoomConfig {
  coordinate?: RoomCoordinate | null
  systems: SystemFunction[]
  setupFunctions: (() => Entity)[]
}

export class SceneManager {
  private currentRoom: RoomCoordinate | null = null
  private roomConfigs: Map<string, IRoomConfig> = new Map()
  private activeSystems: string[] = []
  private activeEntities: Entity[] = []
  private playerManager: PlayerManager = new PlayerManager()
  private roomCounter: number = 0

  constructor(private artInstallation: CansyArtInstallation) {
    this.initializeDefaultRoom()
  }

  private initializeDefaultRoom(): void {
    this.loadScene(new RoomCoordinate(0, 0, 0))
    RoomCoordinate.testDistribution()
  }

  loadScene(coordinate: RoomCoordinate): void {
    const roomId = coordinate.toUniqueId()
    if (this.currentRoom?.equals(coordinate)) {
      console.log(`Room ${roomId} is already loaded.`)
      return
    }

    this.currentRoom = coordinate
    console.log(`Loading room at ${coordinate} with ID ${roomId}`)

    this.clearCurrentRoom()
    const roomConfig = this.roomConfigs.get(roomId)
    roomConfig ? this.activateRoomConfig(roomConfig) : this.loadDefaultRoomConfig(roomId)
  }

  transitionToScene(newCoordinate: RoomCoordinate): void {
    const currentRoom = this.currentRoom
    if (currentRoom) {
      const oldRoomID = currentRoom.toUniqueId()
      const newRoomID = newCoordinate.toUniqueId()
      this.playerManager.moveMyPlayerFromTo(oldRoomID, newRoomID)
    }

    this.loadScene(newCoordinate)
    this.roomCounter++
  }

  addRoomAtCoordinate(coordinate: RoomCoordinate, setupFunctions: (() => Entity)[], systems: SystemFunction[]): void {
    this.roomConfigs.set(coordinate.toUniqueId(), { setupFunctions, systems })
  }

  private loadDefaultRoomConfig(roomId: string): void {
    this.artInstallation.updateSwarmShape(roomId)
    this.artInstallation.runSwarmSystem(roomId)
    this.artInstallation.runColorSystem(roomId)
    this.artInstallation.playAudio(roomId)
  }

  private clearCurrentRoom(): void {
    this.activeSystems.forEach((systemId) => engine.removeSystem(systemId))
    this.activeSystems = []

    this.activeEntities.forEach((entity) => engine.removeEntity(entity))
    this.activeEntities = []
  }

  private activateRoomConfig(config: IRoomConfig): void {
    config.systems.forEach((system, index) => {
      const systemId = `system-${this.currentRoom?.toString()}-${index}`
      engine.addSystem(system, 0, systemId)
      this.activeSystems.push(systemId)
    })

    config.setupFunctions.forEach((setupFunction) => {
      const entity = setupFunction()
      this.activeEntities.push(entity)
    })
  }

  getCurrentRoom(): RoomCoordinate | null {
    return this.currentRoom
  }

  getCurrentRoomId(): string {
    return this.currentRoom?.toUniqueId() ?? '00000000000000000000000000000000'
  }

  getRoomCounter(): number {
    return this.roomCounter
  }
}
