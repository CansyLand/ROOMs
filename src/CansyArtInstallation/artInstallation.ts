import {
  AudioSource,
  DeepReadonlyObject,
  Entity,
  GltfContainer,
  InputAction,
  Material,
  MeshRenderer,
  Transform,
  TransformType,
  TransformTypeWithOptionals,
  VisibilityComponent,
  engine,
  pointerEventsSystem
} from '@dcl/sdk/ecs'
import { Vector3 } from '@dcl/sdk/math'
import { audioFiles, speachFiles } from './audioFiles'
import { CansyComponent, TransformComponent } from './components'
import { ColorSystems } from './colorSystems'
import { SceneManager } from './sceneManager'
import { PortalCreator } from './portals'
import { SwarmShapes } from './swarmShapes'
import { SwarmSystems } from './swarmSystems'
import {
  checkIfPlayerIsInCube,
  forceFieldSystem,
  portalAnimationSystem,
  updateAbstractTransformSystem
} from './globalSystems'
import { movePlayerTo } from '~system/RestrictedActions'

type SystemInitFunction = (roomId: string, entitiesCount: number) => string
type SwarmShapeFunction = (roomId: string, entitiesCount: number) => void

type ArtInstallationConfig = {
  transform: Partial<TransformType>
  entitiesCount: number
}

export class CansyArtInstallation {
  private static instance: CansyArtInstallation | undefined
  private entitiesCount: number
  private readonly maxPolygonCount: number = 9500
  private installationEntity: Entity
  private audioEntity: Entity
  private speachEntity: Entity
  private parentTransform: TransformTypeWithOptionals
  sceneManager: SceneManager | undefined

  private cube: Entity | undefined
  private background: Entity | undefined
  private installationHidden: boolean = true

  private swarmShapes: SwarmShapeFunction[] | null = null
  private swarmSystems: SystemInitFunction[] | null = null
  private colorSystems: SystemInitFunction[] | null = null
  private activeSystems: string[] = []

  private constructor(config: ArtInstallationConfig) {
    this.entitiesCount = config.entitiesCount
    this.installationEntity = this.initInstallationEntity(config.transform)
    this.parentTransform = config.transform
    this.initSwarmEntities()
    this.audioEntity = this.initAudioEntity()
    this.speachEntity = this.initSpeachEntity()
    this.initBuilds()
  }

  public static initInstance(config: ArtInstallationConfig): CansyArtInstallation {
    if (!CansyArtInstallation.instance) {
      CansyArtInstallation.instance = new CansyArtInstallation(config)
    }
    CansyArtInstallation.instance.sceneManager = new SceneManager(CansyArtInstallation.instance)
    CansyArtInstallation.initPortals(CansyArtInstallation.instance.sceneManager)
    CansyArtInstallation.initSystems(CansyArtInstallation.instance)
    return CansyArtInstallation.instance
  }

  public static getInstance(config?: ArtInstallationConfig): CansyArtInstallation | undefined {
    if (!CansyArtInstallation.instance) {
      if (!config) {
        return
      }
    }
    return CansyArtInstallation.instance
  }

  private initInstallationEntity(transform: Partial<TransformType>): Entity {
    transform.position!.y = 20 - 10
    const entity = engine.addEntity()
    Transform.create(entity, transform)
    return entity
  }

  private initSwarmEntities(): void {
    for (let i = 0; i < this.entitiesCount; i++) {
      const entity = engine.addEntity()
      this.setupSwarmEntity(entity)
    }
  }

  private setupSwarmEntity(entity: Entity): void {
    Transform.create(entity, { parent: this.installationEntity })
    CansyComponent.create(entity)
    TransformComponent.create(entity)
    Material.setPbrMaterial(entity, { albedoColor: { r: 4, g: 4, b: 4, a: 1 }, metallic: 0.8, roughness: 0.1 })
    ColorSystems.initColorComponent(entity)
  }

  private initAudioEntity(): Entity {
    const entity = engine.addEntity()
    Transform.create(entity, { parent: this.installationEntity, position: Vector3.create(0, 8, 0) })
    return entity
  }

  private initSpeachEntity(): Entity {
    const entity = engine.addEntity()
    Transform.create(entity, { parent: this.installationEntity, position: Vector3.create(0, 4, 0) })
    return entity
  }

  getEntitesCount(): number {
    return this.entitiesCount
  }

  getEntity(): Entity {
    return this.installationEntity
  }

  getTransform(): DeepReadonlyObject<TransformType> {
    return Transform.get(this.installationEntity)
  }

  getParentTransfrom(): TransformTypeWithOptionals {
    return this.parentTransform
  }

  clear(): void {
    for (const [entity] of engine.getEntitiesWith(CansyComponent)) {
      GltfContainer.deleteFrom(entity)
      MeshRenderer.deleteFrom(entity)
    }
    // Remove running systems in array
    this.activeSystems.forEach((systemId) => engine.removeSystem(systemId))
    this.activeSystems = []
    if (Transform.has(this.installationEntity)) Transform.createOrReplace(this.installationEntity, this.parentTransform)
    if (AudioSource.has(this.audioEntity))
      AudioSource.createOrReplace(this.audioEntity, {
        audioClipUrl: ``,
        loop: true,
        playing: false
      })
    if (AudioSource.has(this.speachEntity))
      AudioSource.createOrReplace(this.speachEntity, {
        audioClipUrl: ``,
        loop: false,
        playing: false
      })
  }

  addSwarmShapes(swarmShapes: SwarmShapeFunction[]): void {
    this.swarmShapes = swarmShapes
  }

  updateSwarmShape(roomId: string): void {
    this.clear()
    if (!this.swarmShapes) {
      console.error('Swarm shapes not set.')
      return
    }
    const index = this.parseIdIndex(roomId, 0, 3, this.swarmShapes.length)
    const shapeFunction = this.swarmShapes[index]
    shapeFunction(roomId, this.entitiesCount)
  }

  addSwarmSystems(swarmSystems: SystemInitFunction[]): void {
    this.swarmSystems = swarmSystems
  }

  runSwarmSystem(roomId: string): void {
    if (!this.swarmSystems) {
      console.error('Swarm systems not set.')
      return
    }
    const index = this.parseIdIndex(roomId, 0, 6, this.swarmSystems.length)
    const systemFunction = this.swarmSystems[index]
    const systemId = systemFunction(roomId, this.entitiesCount)
    this.activeSystems.push(systemId)

    this.playSpeach()
  }

  addColorSystem(colorSystems: SystemInitFunction[]): void {
    this.colorSystems = colorSystems
  }

  runColorSystem(roomId: string): void {
    if (!this.colorSystems) {
      console.error('Color system not set.')
      return
    }
    const index = this.parseIdIndex(roomId, 10, 12, this.colorSystems.length)
    const systemFunction = this.colorSystems[index]
    const systemId = systemFunction(roomId, this.entitiesCount)
    this.activeSystems.push(systemId)
  }

  playAudio(roomId: string): void {
    const index = this.parseIdIndex(roomId, 5, 8, audioFiles.length)
    AudioSource.createOrReplace(this.audioEntity, {
      audioClipUrl: `audio/NASA/${audioFiles[index]}.mp3`,
      loop: true,
      playing: true,
      volume: 0.2
    })
  }

  playSpeach(): void {
    const sceneManager = this.sceneManager
    if (!sceneManager) return

    const index = sceneManager.getRoomCounter()
    AudioSource.createOrReplace(this.speachEntity, {
      audioClipUrl: `audio/speach/${speachFiles[index]}.mp3`,
      loop: false,
      playing: true,
      volume: 3
    })
  }

  /**
   * Extracts a specific portion of a room ID string and maps it to an index within a given range.
   * This method is particularly useful for generating deterministic, yet distributed indices based
   * on the room ID, which can be used for various purposes such as assigning colors, positions, or
   * behaviors in a predictable pattern across different rooms.
   *
   * @param roomId The unique identifier for a room, expected to be a string that can contain numerical values.
   * @param start The starting index (inclusive) from where to begin extracting the substring from the `roomId`.
   * @param end The ending index (exclusive) at which to stop the extraction.
   * @param modulo The divisor used to map the extracted numerical value to a specific range. The result is
   *               the remainder of the division, ensuring that the returned index falls within a predictable
   *               range [0, modulo).
   * @returns A number representing the extracted and mapped index. This index is determined by parsing the
   *          substring of the `roomId` from `start` to `end`, converting it to an integer, and then applying
   *          the modulo operation. This ensures that the result is always within the range [0, modulo).
   */
  private parseIdIndex(roomId: string, start: number, end: number, modulo: number): number {
    return parseInt(roomId.substring(start, end), 10) % modulo
  }

  static initPortals(sceneManager: SceneManager): void {
    const p = new PortalCreator(sceneManager)
    // p.createPortal(Vector3.create(2.5, 8.1288, 8), Vector3.create(0, 90, 0), Vector3.create(1, 0, 0), 'WEST')
    // p.createPortal(Vector3.create(13.5, 8.1288, 8), Vector3.create(0, 90, 0), Vector3.create(-1, 0, 0), 'EAST')
    // p.createPortal(Vector3.create(8, 8.1288, 2.4), Vector3.create(0, 0, 0), Vector3.create(0, 0, 1), 'SOUTH')
    // p.createPortal(Vector3.create(8, 8.1288, 13.5), Vector3.create(0, 0, 0), Vector3.create(0, 0, -1), 'NORTH')
    p.createPortal(Vector3.create(2, 8.1288, 8), Vector3.create(0, 90, 0), Vector3.create(1, 0, 0), 'WEST')
    p.createPortal(Vector3.create(14, 8.1288, 8), Vector3.create(0, 90, 0), Vector3.create(-1, 0, 0), 'EAST')
    p.createPortal(Vector3.create(8, 8.1288, 2), Vector3.create(0, 0, 0), Vector3.create(0, 0, 1), 'SOUTH')
    p.createPortal(Vector3.create(8, 8.1288, 14), Vector3.create(0, 0, 0), Vector3.create(0, 0, -1), 'NORTH')
  }

  static initSystems(artInstallation: CansyArtInstallation) {
    // artInstallation.addSwarmShapes([fibonacciSphereShape])
    artInstallation.addSwarmShapes([
      SwarmShapes.cubeShape,
      SwarmShapes.sphereShape,
      SwarmShapes.planeShape,
      SwarmShapes.randomShape,
      SwarmShapes.matrixShape,
      SwarmShapes.spiralShape,
      SwarmShapes.goldenSpiralShape,
      SwarmShapes.lissajousCurveShape,
      SwarmShapes.mobiusStripShape,
      SwarmShapes.torusKnotShape,
      SwarmShapes.fibonacciSphereShape
    ])

    // artInstallation.addSwarmSystems([SwarmSystems.initSquidwardDance])
    artInstallation.addSwarmSystems([
      SwarmSystems.initRotateEntities,
      SwarmSystems.initRandomPositions,
      SwarmSystems.initRandomJump,
      SwarmSystems.initCircularFollowSystem,
      SwarmSystems.initParticleSystem,
      SwarmSystems.initWiggleSystem,
      SwarmSystems.initRollingEffectSystem,
      SwarmSystems.initOrbitalMotionSystem,
      SwarmSystems.initSquidwardDance
    ])

    artInstallation.addColorSystem([ColorSystems.initRandomColor])

    engine.addSystem(portalAnimationSystem, 3)
    engine.addSystem(updateAbstractTransformSystem, 5)
    engine.addSystem(forceFieldSystem, 9)
    engine.addSystem(checkIfPlayerIsInCube, 10)
  }

  initBuilds() {
    // const cube = engine.addEntity()
    // GltfContainer.create(cube, {
    //   src: 'models/white_cube_2.glb'
    // })
    // Transform.create(cube, {
    //   position: Vector3.create(8, 0, 8)
    // })
    // this.cube = engine.addEntity()
    // GltfContainer.create(this.cube, {
    //   src: 'models/cansy_cube_4.glb'
    // })
    // Transform.create(this.cube, {
    //   position: Vector3.create(8, 0, 8)
    // })
    // VisibilityComponent.create(this.cube, { visible: false })
    // this.background = engine.addEntity()
    // GltfContainer.create(this.background, {
    //   src: 'models/cansy_cube_background.glb'
    // })
    // Transform.create(this.background, {
    //   position: Vector3.create(8, 0, 8)
    // })
    // VisibilityComponent.create(this.background, { visible: false })
  }

  showInstallation() {
    if (this.cube && this.background && this.installationHidden) {
      VisibilityComponent.getMutable(this.cube).visible = true
      VisibilityComponent.getMutable(this.background).visible = true
      this.installationHidden = false
    }
  }

  hideInstallation() {
    if (this.cube && this.background && !this.installationHidden) {
      VisibilityComponent.getMutable(this.cube).visible = false
      VisibilityComponent.getMutable(this.background).visible = false
      this.installationHidden = true
    }
  }

  playMusic() {
    const audio = AudioSource.getOrNull(this.audioEntity)
    if (audio && audio.playing == false) {
      AudioSource.getMutable(this.audioEntity).playing = true
    }
  }
  stopMusic() {
    const audio = AudioSource.getOrNull(this.audioEntity)
    if (audio && audio.playing) {
      AudioSource.getMutable(this.audioEntity).playing = false
    }
  }
}
