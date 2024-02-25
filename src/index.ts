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

import { changeColorSystem, circularSystem, circularSystem2, wiggleSystem } from './systems'
import { setupUi } from './ui'
import { ArrayFromTo } from './roomInstallation'
import { SceneInstanceManager } from './systems/SceneInstanceManager'
import { RoomCoordinate } from './types'
import { createPortal } from './systems/Portals'
import { movePlayerTo } from '~system/RestrictedActions'
import { CubeSharp, CubeSoft } from './art/cubes'
import { changeMaterial } from './utils'

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

//
//  NO UI JUST TEXT SHAPES FOR TEXT
//
//

export function main() {
  // Defining behavior. See `src/systems.ts` file.
  // engine.addSystem(changeColorSystem)
  // // draw UI. Here is the logic to spawn cubes.
  // setupUi()

  // MESH CUBE
  // const cube = engine.addEntity()
  // GltfContainer.create(cube, {
  //   src: 'models/MESH CUBE 2024.glb'
  // })
  // Transform.create(cube, {
  //   position: Vector3.create(9, 0, 7)
  // })

  // CANSY CUBE
  const cube = engine.addEntity()
  GltfContainer.create(cube, {
    src: 'models/cansy_cube_1.glb'
  })
  Transform.create(cube, {
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

  // const sceneManager = new SceneInstanceManager()
  // sceneManager.addRoom(
  //   new RoomCoordinate(0, 0, 0),
  //   [circularSystem], // Assuming system1, system2 are defined
  //   [room0]
  // )
  // sceneManager.addRoom(
  //   new RoomCoordinate(1, 0, 0),
  //   [], // Assuming system1, system2 are defined
  //   [room1]
  // )
  // sceneManager.addRoom(
  //   new RoomCoordinate(2, 0, 0),
  //   [circularSystem2], // Assuming system1, system2 are defined
  //   [room2]
  // )
  // // engine.addSystem(circularSystem)
  // // Initialize room 0,0,0
  // sceneManager.loadScene(new RoomCoordinate(0, 0, 0))

  // function room0() {
  //   const entity = ArrayFromTo({
  //     shape: ['box', 'sphere', 'cone'],
  //     startPosition: Vector3.create(1, 0, 1),
  //     endPosition: Vector3.create(15, 0, 15),
  //     length: 10,
  //     rotation: Quaternion.fromEulerDegrees(0, 45, 90)
  //   })
  //   return [entity]
  // }

  // function room1() {
  //   const entity = ArrayFromTo({
  //     shape: ['box'],
  //     startPosition: Vector3.create(1, 0, 1),
  //     endPosition: Vector3.create(13, 0, 1),
  //     length: 5
  //     //rotation: Quaternion.fromEulerDegrees(0, 45, 90)
  //   })
  //   return [entity]
  // }

  // function room2() {
  //   const entity = ArrayFromTo({
  //     shape: ['sphere'],
  //     startPosition: Vector3.create(4, 0, 1),
  //     endPosition: Vector3.create(2, 0, 14),
  //     length: 20
  //     //rotation: Quaternion.fromEulerDegrees(0, 45, 90)
  //   })
  //   return [entity]
  // }

  // createPortal(Vector3.create(4, 1, 4), Vector3.create(1, 0, 0), 'box', sceneManager)
  // createPortal(Vector3.create(4, 1, 6), Vector3.create(-1, 0, 0), 'sphere', sceneManager)

  const sCube = CubeSharp({
    shape: ['box', '', 'box'],
    size: 10,
    center: {
      x: 8,
      y: 20 - 8,
      z: 8
    },
    density: 1,
    shapeSize: 2,
    material: {
      albedoColor: Color4.Red(),
      metallic: 0.8,
      roughness: 0.1
    }
  })

  changeMaterial({
    albedoColor: Color4.Blue(),
    metallic: 0.8,
    roughness: 0.1
  })
}

engine.addSystem(wiggleSystem)
// engine.addSystem(changeMaterial)
