import { SceneInstanceManager } from './SceneInstanceManager' // Adjust path as needed
import { RoomCoordinate } from '../types'
import { InputAction, MeshCollider, Transform, engine, pointerEventsSystem } from '@dcl/sdk/ecs'
import { addShape } from '../utils'
import { Vector3 } from '@dcl/sdk/math'
import { movePlayerTo } from '~system/RestrictedActions'

export function createPortal(
  position: Vector3,
  direction: Vector3,
  shape: string,
  sceneManager: SceneInstanceManager
): void {
  const portal = engine.addEntity()

  pointerEventsSystem.onPointerDown(
    {
      entity: portal,
      opts: { button: InputAction.IA_PRIMARY, hoverText: 'Next room' }
    },
    function () {
      const currentRoom = sceneManager.currentRoom
      console.log('Current Room')
      console.log(currentRoom)
      if (!currentRoom) return

      // Calculate the target room based on the current room and portal direction
      const targetRoom = new RoomCoordinate(
        currentRoom.x + direction.x,
        currentRoom.y + direction.y,
        currentRoom.z + direction.z
      )
      sceneManager.transitionToScene(targetRoom)

      const playerPos = Transform.get(engine.PlayerEntity).position
      const CameraPos = Transform.get(engine.CameraEntity).position
      // const CameraRot = Transform.get(engine.CameraEntity).rotation
      console.log(CameraPos)
      movePlayerTo({
        newRelativePosition: playerPos,
        cameraTarget: Vector3.create(CameraPos.x, 1, CameraPos.z)
      })
    }
  )
  Transform.create(portal, {
    position: position
  })

  MeshCollider.setBox(portal)

  addShape(portal, shape)
}
