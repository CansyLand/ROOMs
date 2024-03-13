// Assuming the SceneManager and other dependencies are correctly imported
import { SceneManager } from './SceneManager' // Adjust path as needed
import {
  AudioSource,
  GltfContainer,
  InputAction,
  MeshCollider,
  Transform,
  engine,
  pointerEventsSystem
} from '@dcl/sdk/ecs'
import { addShape, movePlayerThroughPortal } from '../utils'
import { Quaternion, Vector3 } from '@dcl/sdk/math'
import { RoomCoordinate } from './RoomCoordinate'
import { C_Portal } from '../components'

export class PortalCreator {
  constructor(private sceneManager: SceneManager) {}

  createPortal(position: Vector3, rotation: Vector3, direction: Vector3, shape: string, hoverText: string): void {
    const portal = engine.addEntity()

    pointerEventsSystem.onPointerDown(
      {
        entity: portal,
        opts: { button: InputAction.IA_POINTER, hoverText: hoverText, maxDistance: 6 }
      },
      () => this.handlePortalInteraction(direction)
    )

    Transform.create(portal, {
      position: position,
      rotation: Quaternion.fromEulerDegrees(rotation.x, rotation.y, rotation.z)
    })

    GltfContainer.create(portal, {
      src: 'models/portal_collider.glb'
    })

    const portal_right = engine.addEntity()
    Transform.create(portal_right, {
      parent: portal,
      position: Vector3.create(0, 0, 0),
      scale: Vector3.create(0.5, 1, 1)
    })
    GltfContainer.create(portal_right, {
      src: 'models/portal_frame.glb'
    })

    const portal_left = engine.addEntity()
    Transform.create(portal_left, {
      parent: portal,
      position: Vector3.create(0, 0, 0),
      scale: Vector3.create(0.5, 1, 1)
    })
    GltfContainer.create(portal_left, {
      src: 'models/portal_frame.glb'
    })

    const portal_top = engine.addEntity()
    Transform.create(portal_top, {
      parent: portal,
      position: Vector3.create(0, 0, 0),
      scale: Vector3.create(1, 0, 1)
    })
    GltfContainer.create(portal_top, {
      src: 'models/portal_frame_top.glb'
    })

    C_Portal.create(portal, {
      right: portal_right,
      left: portal_left,
      top: portal_top,
      audioTrigger: true
    })
  }

  private handlePortalInteraction(direction: Vector3): void {
    const currentRoom = this.sceneManager.getCurrentRoom()
    console.log('Current Room:', currentRoom)
    if (!currentRoom) return

    const targetRoom = new RoomCoordinate(
      currentRoom.x + direction.x,
      currentRoom.y + direction.y,
      currentRoom.z + direction.z
    )
    this.sceneManager.transitionToScene(targetRoom)
    // rotateCamera(); // Uncomment if camera rotation is needed
    movePlayerThroughPortal() // Assuming this is defined elsewhere
  }
}
