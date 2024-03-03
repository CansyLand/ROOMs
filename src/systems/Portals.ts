// Assuming the SceneManager and other dependencies are correctly imported
import { SceneManager } from './SceneManager' // Adjust path as needed
import { InputAction, MeshCollider, Transform, engine, pointerEventsSystem } from '@dcl/sdk/ecs'
import { addShape, movePlayerThroughPortal } from '../utils'
import { Vector3 } from '@dcl/sdk/math'
import { RoomCoordinate } from './RoomCoordinate'

export class PortalCreator {
  constructor(private sceneManager: SceneManager) {}

  createPortal(position: Vector3, direction: Vector3, shape: string): void {
    const portal = engine.addEntity()

    pointerEventsSystem.onPointerDown(
      {
        entity: portal,
        opts: { button: InputAction.IA_POINTER, hoverText: 'Next room' }
      },
      () => this.handlePortalInteraction(direction)
    )

    Transform.create(portal, { position: position })
    MeshCollider.setBox(portal)
    addShape(portal, shape)
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
