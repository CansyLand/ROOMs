import { engine, Entity, Transform } from '@dcl/sdk/ecs'
import { RoomCoordinate } from './RoomCoordinate' // Assuming RoomCoordinate is in a separate file
import { CansyComponent } from '../components'
import { artInstallation } from '..'

type SystemFunction = () => void

interface IRoomConfig {
  coordinate?: RoomCoordinate | null
  systems: SystemFunction[]
  setupFunctions: (() => Entity)[]
}

export class SceneManager {
  private currentRoom: RoomCoordinate | null = null
  private currentRoomId: string | null = null
  private roomConfigs: Map<string, IRoomConfig> = new Map()
  private activeSystems: string[] = []
  private activeEntities: Entity[] = []
  private indexedRooms: IRoomConfig[] = []
  //   private polygonCount: number = 0
  //   private readonly maxPolygonCount: number = 9500 // Maximum allowed polygons
  //   private entityCount: number = 0
  //   private readonly maxEntityCount: number = 20 //180

  constructor() {
    this.initializeDefaultRoom()
  }

  private initializeDefaultRoom(): void {
    const defaultCoordinate = new RoomCoordinate(0, 0, 0)
    this.loadScene(defaultCoordinate)
  }

  loadScene(coordinate: RoomCoordinate): void {
    this.currentRoom = coordinate
    this.currentRoomId = coordinate.toUniqueId()

    console.log(`Loading room at ${coordinate.toString()}`)
    console.log(`Room ID ${this.currentRoomId}`)

    //this.clearCurrentRoom()
    const roomConfig = this.roomConfigs.get(coordinate.toString())
    if (roomConfig) {
      this.activateRoomConfig(roomConfig)
    } else {
      const id = this.currentRoom.toUniqueId()
      artInstallation.updateSwarmShape(id)
      artInstallation.runSwarmSystem(id)
      //   const index = parseInt(this.currentRoomId.substring(0, 2), 16)
      //   const randomRoomConfig = this.getRoomByIndex(index)
      //   if (randomRoomConfig) {
      //     this.activateRoomConfig(randomRoomConfig)
      //   } else {
      //     console.error('No room configuration found for the given index.')
      //   }
    }
  }

  transitionToScene(newCoordinate: RoomCoordinate): void {
    if (!this.currentRoom || !this.currentRoom.equals(newCoordinate)) {
      this.loadScene(newCoordinate)
    }
  }

  addRoomAtCoordinate(coordinate: RoomCoordinate, setupFunctions: (() => Entity)[], systems: SystemFunction[]): void {
    this.roomConfigs.set(coordinate.toString(), { setupFunctions, systems })
  }

  addRoom(setupFunctions: (() => Entity)[], systems: SystemFunction[]): void {
    this.indexedRooms.push({ coordinate: null, systems, setupFunctions })
  }

  private getRoomByIndex(index: number): IRoomConfig {
    if (this.indexedRooms.length === 0) {
      //   throw new Error('No rooms have been added.')
    }
    const effectiveIndex = index % this.indexedRooms.length
    return this.indexedRooms[effectiveIndex]
  }

  private clearCurrentRoom(): void {
    this.activeSystems.forEach((system) => engine.removeSystem(system))
    this.activeSystems = []

    // this.activeEntities.forEach((entity) => engine.removeEntityWithChildren(entity))
    // this.activeEntities = []

    let counter = 0
    for (const [entity] of engine.getEntitiesWith(CansyComponent)) {
      counter++
      engine.removeEntity(entity)
    }
    console.log('Removed entities: ', counter)

    // this.resetPolygon()
    // this.resetEntity()
  }

  private activateRoomConfig(config: IRoomConfig): void {
    config.systems.forEach((system, index) => {
      const systemIdentifier = `system-${index}`
      engine.addSystem(system, index, systemIdentifier)
      this.activeSystems.push(systemIdentifier)
    })

    config.setupFunctions.forEach((setupFunction) => {
      const entities = setupFunction()
      this.activeEntities.push(entities)
    })
  }

  getCurrentRoom(): RoomCoordinate | null {
    return this.currentRoom
  }

  getCurrentRoomId(): string {
    if (this.currentRoomId) {
      return this.currentRoomId
    } else {
      return '0000000000000000000000000000000000000000'
    }
  }

  //   addPolygon(count: number): boolean {
  //     if (this.polygonCount < 9500) {
  //       this.polygonCount += count
  //       return true
  //     } else {
  //       return false
  //     }
  //   }

  //   isMaxPolygonCountReached(): boolean {
  //     return this.polygonCount >= this.maxPolygonCount
  //   }

  //   resetPolygon() {
  //     this.polygonCount = 0
  //   }

  //   addEntiy() {
  //     console.log(this.entityCount)
  //     this.entityCount++
  //   }

  //   resetEntity() {
  //     this.entityCount = 0
  //   }

  //   isMaxEntityCountReached(): boolean {
  //     return this.entityCount >= this.maxEntityCount
  //   }

  //   isMaxedOut() {
  //     return this.isMaxEntityCountReached() || this.isMaxPolygonCountReached()
  //   }
}
