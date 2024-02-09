// We define the empty imports so the auto-complete feature works as expected.
import { Quaternion, Vector3 } from '@dcl/sdk/math'
import {
  Animator,
  AudioSource,
  AvatarAttach,
  GltfContainer,
  Material,
  Transform,
  VideoPlayer,
  VisibilityComponent,
  engine,
  pointerEventsSystem
} from '@dcl/sdk/ecs'
import { initAssetPacks } from '@dcl/asset-packs/dist/scene-entrypoint'

import { changeColorSystem, circularSystem, circularSystem2 } from './systems'
import { setupUi } from './ui'
import { ArrayFromTo } from './roomInstallation'
import { SceneInstanceManager } from './systems/SceneInstanceManager'
import { RoomCoordinate } from './types'
import { createPortal } from './systems/Portals'

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

export function main() {
  // Defining behavior. See `src/systems.ts` file.
  // engine.addSystem(changeColorSystem)
  // // draw UI. Here is the logic to spawn cubes.
  // setupUi()

  const sceneManager = new SceneInstanceManager()
  sceneManager.addRoom(
    new RoomCoordinate(0, 0, 0),
    [circularSystem], // Assuming system1, system2 are defined
    [room0]
  )
  sceneManager.addRoom(
    new RoomCoordinate(1, 0, 0),
    [], // Assuming system1, system2 are defined
    [room1]
  )
  sceneManager.addRoom(
    new RoomCoordinate(2, 0, 0),
    [circularSystem2], // Assuming system1, system2 are defined
    [room2]
  )
  // engine.addSystem(circularSystem)
  // Initialize room 0,0,0
  sceneManager.loadScene(new RoomCoordinate(0, 0, 0))

  function room0() {
    const entity = ArrayFromTo({
      shape: ['box', 'sphere', 'cone'],
      startPosition: Vector3.create(1, 0, 1),
      endPosition: Vector3.create(15, 0, 15),
      length: 10,
      rotation: Quaternion.fromEulerDegrees(0, 45, 90)
    })
    return [entity]
  }

  function room1() {
    const entity = ArrayFromTo({
      shape: ['box'],
      startPosition: Vector3.create(1, 0, 1),
      endPosition: Vector3.create(13, 0, 1),
      length: 5
      //rotation: Quaternion.fromEulerDegrees(0, 45, 90)
    })
    return [entity]
  }

  function room2() {
    const entity = ArrayFromTo({
      shape: ['sphere'],
      startPosition: Vector3.create(4, 0, 1),
      endPosition: Vector3.create(2, 0, 14),
      length: 20
      //rotation: Quaternion.fromEulerDegrees(0, 45, 90)
    })
    return [entity]
  }

  createPortal(Vector3.create(4, 1, 4), Vector3.create(1, 0, 0), 'box', sceneManager)
  createPortal(Vector3.create(4, 1, 6), Vector3.create(-1, 0, 0), 'sphere', sceneManager)
}
