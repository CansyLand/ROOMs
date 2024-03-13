import {
  AudioSource,
  Entity,
  GltfContainer,
  Material,
  MeshRenderer,
  SYSTEMS_REGULAR_PRIORITY,
  Transform,
  TransformComponent,
  TransformComponentExtended,
  TransformTypeWithOptionals,
  engine
} from '@dcl/sdk/ecs'
import {
  CansyComponent,
  C_ForceComponent,
  C_TransformComponent,
  C_TransformComponentDefaultValues
} from '../components'
import { Plane, Quaternion, ToLinearSpace, Vector3 } from '@dcl/sdk/math'
import { C_initColorComponent } from './ColorSystems'

type SystemInitFunction = (roomId: string, entitiesCount: number) => string
type SwarmShapeFunction = (roomId: string, entitiesCount: number) => void

export class ArtInstallation {
  private entitiesCount: number
  private polygonCount: number = 0
  private readonly maxPolygonCount: number = 9500 // Maximum allowed polygons

  private installationEntity!: Entity
  private audioEntity!: Entity

  private swarmShapes: SwarmShapeFunction[] | null = null
  private swarmSystems: SystemInitFunction[] | null = null
  private colorSystems: SystemInitFunction[] | null = null
  private activeSystems: string[] = []

  private parentTransform: TransformTypeWithOptionals

  constructor(position: Vector3, entitiesCount: number) {
    this.entitiesCount = entitiesCount
    this.parentTransform = {
      position: position,
      rotation: Quaternion.Zero(),
      scale: Vector3.create(1, 1, 1)
    }
    this.initializeSwarm(this.parentTransform, entitiesCount)
  }

  private initializeSwarm(transform: TransformTypeWithOptionals, entitiesCount: number) {
    this.installationEntity = engine.addEntity()
    Transform.create(this.installationEntity, transform)
    for (let index = 0; index < entitiesCount; index++) {
      const swarmEntity = engine.addEntity()
      Transform.create(swarmEntity, {
        parent: this.parent()
      })
      CansyComponent.create(swarmEntity)
      C_TransformComponent.create(swarmEntity)
      Material.setPbrMaterial(swarmEntity, {
        albedoColor: { r: 4, g: 4, b: 4, a: 1 },
        metallic: 0.8,
        roughness: 0.1
      })
      C_initColorComponent(swarmEntity)
    }
    this.initAudio()
  }

  clear() {
    // Remove all components
    for (const [entity] of engine.getEntitiesWith(CansyComponent)) {
      GltfContainer.deleteFrom(entity)
      MeshRenderer.deleteFrom(entity)
      this.polygonCount = 0
    }
    // Reset parent entity
    Transform.createOrReplace(this.installationEntity, this.parentTransform)
    // Remove running systems in array
    this.activeSystems.forEach((systemId) => {
      engine.removeSystem(systemId)
    })
    this.activeSystems = []
  }

  parent(): Entity {
    return this.installationEntity
  }

  getParentTransform(): TransformTypeWithOptionals {
    return this.parentTransform
  }

  getEntitesCount(): number {
    return this.entitiesCount
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

  addSwarmSystems(swarmSystems: SystemInitFunction[]) {
    this.swarmSystems = swarmSystems
  }

  runSwarmSystem(roomId: string) {
    if (!this.swarmSystems) {
      console.error('Swarm systems not set.')
      return
    }
    const index = parseInt(roomId.substring(0, 2), 10) % this.swarmSystems.length
    const systemFunction = this.swarmSystems[index]
    const systemIdentifier = systemFunction(roomId, this.entitiesCount)
    this.activeSystems.push(systemIdentifier)
  }

  addColorSystem(colorSystem: SystemInitFunction[]) {
    this.colorSystems = colorSystem
  }

  runColorSystem(roomId: string) {
    if (!this.colorSystems) {
      console.error('Color system not set.')
      return
    }
    const index = parseInt(roomId.substring(10, 12), 10) % this.colorSystems.length
    const systemFunction = this.colorSystems[index]
    const systemIdentifier = systemFunction(roomId, this.entitiesCount)
    this.activeSystems.push(systemIdentifier)
  }

  initAudio() {
    this.audioEntity = engine.addEntity()
    Transform.create(this.audioEntity, {
      parent: this.installationEntity,
      position: Vector3.create(0, 4, 0)
    })
  }

  playAudio(roomId: string) {
    const audioFiles = [
      '#NASA Sonification of Jellyfish Nebula',
      'Bullet Cluster Sonification',
      'Cats Eye Nebula (NGC 6543) Sonification',
      'Crab Nebula Sonification',
      'Data Sonification Black Hole at the Center of Galaxy M87 (Multiwavelength)',
      'Data Sonification Black Hole at the Center of the Perseus Galaxy Cluster (X-ray)',
      'M51 (Whirlpool Galaxy) Sonification',
      'M104 Sonification of Chandra X-Ray Observatory, NASA Telescopes',
      'Milky Way’s Central Black Hole Sonification from NASAs IXPE',
      'R Aquarii Sonification from Chandra X-Ray Observatory, NASA Telescopes',
      'Sonification of Ghostly Cosmic Hand',
      'Sonification of Phantom Galaxy',
      'Sounds from Around the Milky Way',
      'Stephans Quintet Sonification from Chandra X-Ray Observatory, NASA Telescopes',
      'sun_sonification',
      'Supernova 1987A Sonification'
    ]
    const index = parseInt(roomId.substring(5, 8), 10) % audioFiles.length

    AudioSource.createOrReplace(this.audioEntity, {
      audioClipUrl: 'NASA/' + audioFiles[index] + '.mp3',
      loop: true,
      playing: true
    })
  }
}

//   SYSTEMS - combinable
// sinus - waves
//   position
//     constant
//     wiggle
//     follow next entity
//   rotation
//     constant
//     wiggle
//   size
//     constant
//     wiggle
//   color
//     rainbow smooth
//     rainbow click
// random position flicker

//   SWARM SHAPE
//     cube
//     sphere
//     room
//     random
//     matrix
//     wall
//     array
//     spiral
//     snake
//     linie
//      creative mathematic wonders

//    SHAPES
//     Cube
//     flat cubes
//     plane
//     line
//     line between entities
//     GLTF

// COLOR SYSTEMS

// Color Palette !!!
// gradient based on height
// gradnient based on xyz
// snake style movement
// christmas tree
// black?
// change color over time
// do nothing stay in color

//      WARABLE
//      EMOTE

// VOICES
// David Boles
// Neil - calm and deep
// George
// Lucifer
// Arnold - Courageous Valiant
// John Divine  //Christan coice
// Brian
// Theodore - Oldschool Cool
// Matthew - calm and peaceful
// Arnold - Courageous Valiant
// Carmen - calm, thoughtful
