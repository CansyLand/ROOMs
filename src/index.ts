// We define the empty imports so the auto-complete feature works as expected.
import { Color4, Quaternion, Vector3 } from '@dcl/sdk/math'
import {
  Animator,
  AudioSource,
  AvatarAnchorPointType,
  AvatarAttach,
  GltfContainer,
  InputAction,
  Material,
  Transform,
  VideoPlayer,
  VisibilityComponent,
  engine,
  pointerEventsSystem
} from '@dcl/sdk/ecs'

import { initAssetPacks } from '@dcl/asset-packs/dist/scene-entrypoint'

import { C_forceFieldSystem, C_portalAnimationSystem, C_updateAbstractTransformSystem } from './systems'
import { movePlayerTo } from '~system/RestrictedActions'
import { changeMaterial } from './utils'
import { SceneManager } from './systems/SceneManager'
import { PortalCreator } from './systems/Portals'
// import { bigGlowShapes, smallGlowShapes } from './art/rooms'
import { ArtInstallation } from './systems/ArtInstallation'
import {
  cubeShape,
  fibonacciSphereShape,
  goldenSpiralShape,
  lissajousCurveShape,
  matrixShape,
  mobiusStripShape,
  planeShape,
  randomShape,
  sphereShape,
  spiralShape,
  torusKnotShape
} from './systems/SwarmShapes'
import {
  C_initCircularFollowSystem,
  C_initOrbitalMotionSystem,
  C_initParticleSystem,
  C_initRandomJump,
  C_initRollingEffectSystem,
  C_initWiggleSystem,
  C_initializeRandomPositions,
  rotateEntities,
  rotationSystem
} from './systems/SwarmSystems'
import { C_initRandomColor } from './systems/ColorSystems'
import { RoomCoordinate } from './systems/RoomCoordinate'

// You can remove this if you don't use any asset packs
initAssetPacks(engine, pointerEventsSystem, {
  Animator,
  AudioSource,
  AvatarAttach,
  Transform,
  VisibilityComponent,
  GltfContainer,
  Material,
  VideoPlayer
})

// export const artInstallation = new ArtInstallation(Vector3.create(8, 20 - 8, 8), 180)
export const artInstallation = new ArtInstallation({ x: 8, y: 20 - 10, z: 8 }, 180)
export const sceneManager = new SceneManager()

export function main() {
  // MODIFIED MESH CUBE
  const cube = engine.addEntity()
  GltfContainer.create(cube, {
    src: 'models/cansy_cube_3.glb'
  })
  Transform.create(cube, {
    position: Vector3.create(8, 0, 8)
  })

  const background = engine.addEntity()
  GltfContainer.create(background, {
    src: 'models/cansy_cube_background.glb'
  })
  Transform.create(background, {
    position: Vector3.create(8, 0, 8)
  })

  // ARROW UP
  const arrow = engine.addEntity()
  GltfContainer.create(arrow, {
    src: 'models/arrow.glb'
  })
  Transform.create(arrow, {
    position: Vector3.create(8, 0, 8)
  })
  pointerEventsSystem.onPointerDown(
    {
      entity: arrow,
      opts: {
        button: InputAction.IA_POINTER,
        hoverText: 'Click'
      }
    },
    function () {
      movePlayerTo({
        newRelativePosition: Vector3.create(8, 16, 8)
      })
    }
  )

  // PORTALS
  const p = new PortalCreator(sceneManager)
  p.createPortal(Vector3.create(2, 8.1288, 8), Vector3.create(0, 90, 0), Vector3.create(1, 0, 0), 'box', 'WEST')
  p.createPortal(Vector3.create(14, 8.1288, 8), Vector3.create(0, 90, 0), Vector3.create(-1, 0, 0), 'box', 'EAST')
  p.createPortal(Vector3.create(8, 8.1288, 2), Vector3.create(0, 0, 0), Vector3.create(0, 0, 1), 'box', 'SOUTH')
  p.createPortal(Vector3.create(8, 8.1288, 14), Vector3.create(0, 0, 0), Vector3.create(0, 0, -1), 'box', 'NORTH')

  // Test installation
  // artInstallation.addSwarmShapes([fibonacciSphereShape])
  // Actual installation
  artInstallation.addSwarmShapes([
    cubeShape,
    sphereShape,
    planeShape,
    randomShape,
    matrixShape,
    spiralShape,
    goldenSpiralShape,
    lissajousCurveShape,
    mobiusStripShape,
    torusKnotShape,
    fibonacciSphereShape
  ])

  // Test system
  // artInstallation.addSwarmSystems([C_initOrbitalMotionSystem])
  // Actual systems
  artInstallation.addSwarmSystems([
    rotateEntities,
    C_initializeRandomPositions,
    C_initRandomJump,
    C_initCircularFollowSystem,
    C_initParticleSystem,
    C_initWiggleSystem,
    C_initRollingEffectSystem,
    C_initOrbitalMotionSystem
  ])

  // Test system
  artInstallation.addColorSystem([C_initRandomColor])
  // Actual system
  // artInstallation.addColorSystem([C_initRandomColor, C_initColorGradientTopBottom])

  // C_initBillboard // not interesting
  engine.addSystem(C_portalAnimationSystem, 3)
  engine.addSystem(C_updateAbstractTransformSystem, 5)
  engine.addSystem(C_forceFieldSystem, 9)
}
