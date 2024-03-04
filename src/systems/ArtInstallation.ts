import { Entity, GltfContainer, MeshRenderer, Transform, engine } from '@dcl/sdk/ecs'
import { CansyComponent } from '../components'
import { Plane, ToLinearSpace } from '@dcl/sdk/math'

type SystemFunction = () => void
type SwarmShapeFunction = (roomId: string, entitiesCount: number) => void

export class ArtInstallation {
  private entitiesCount: number
  private polygonCount: number = 0
  private readonly maxPolygonCount: number = 9500 // Maximum allowed polygons

  private installationEntity!: Entity

  private swarmShapes: SwarmShapeFunction[] | null = null
  //   private systemsPosition: SystemFunction[]
  //   private systemsRotation: SystemFunction[]
  //   private systemsSize: SystemFunction[]
  //   private systemsColor: SystemFunction[]

  constructor(entitiesCount: number) {
    this.entitiesCount = entitiesCount
    this.initializeSwarm(entitiesCount)
  }

  private initializeSwarm(entitiesCount: number) {
    this.installationEntity = engine.addEntity()
    Transform.create(this.installationEntity, {
      position: { x: 8, y: 20 - 8, z: 8 }
    })
    for (let index = 0; index < entitiesCount; index++) {
      const swarmEntity = engine.addEntity()
      CansyComponent.create(swarmEntity)
      Transform.create(swarmEntity)
    }
  }

  clear() {
    for (const [entity] of engine.getEntitiesWith(CansyComponent)) {
      GltfContainer.deleteFrom(entity)
      MeshRenderer.deleteFrom(entity)
      this.polygonCount = 0
    }
  }

  addSwarmShapes(swarmShapes: SwarmShapeFunction[]) {
    this.swarmShapes = swarmShapes
  }

  updateSwarmShape(roomId: string) {
    this.clear()

    if (!this.swarmShapes) {
      console.error('Swarm shapes not set.')
      return
    }

    const index = parseInt(roomId.substring(0, 2), 10) % this.swarmShapes.length
    const shapeFunction = this.swarmShapes[index]

    if (shapeFunction) {
      shapeFunction(roomId, this.entitiesCount)
    } else {
      console.error('Shape function not found for index:', index)
    }
  }

  parent(): Entity {
    return this.installationEntity
  }
}

//   SYSTEMS - combinable
// sinus - waves
//   position
//     constant
//     wiggle
//   rotation
//     constant
//     wiggle
//   size
//     constant
//     wiggle
//   color
//     rainbow smooth
//     rainbow click

//   SWARM SHAPE
//     cube
//     sphere
//     room
//     random
//     wall
//     array
//     spiral
//     snake

//    SHAPES
//     Cube
//     plane
//     line
//     line between entities
//     GLTF
