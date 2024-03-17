import { Entity, GltfContainer, InputAction, Transform, engine, pointerEventsSystem } from '@dcl/sdk/ecs'
import { Quaternion, Vector3 } from '@dcl/sdk/math'
import { RoomCoordinate } from './roomCoordinates'
import { Portal } from './components'
import { movePlayerThroughPortal } from './positionUtils'
import { SceneManager } from './sceneManager'

// interface PortalConfig {
//   position: Vector3
//   rotation: Vector3
//   direction: Vector3
//   shape: string
//   hoverText: string
// }

const MAX_INTERACTION_DISTANCE = 6
const MODEL_PATH = 'models'
const FRAME_SCALE = { x: 0.5, y: 1, z: 1 }
const TOP_FRAME_SCALE = { x: 1, y: 0, z: 1 }

export class PortalCreator {
  direction = {
    north: Vector3.create(0, 0, -1),
    east: Vector3.create(-1, 0, 0),
    south: Vector3.create(0, 0, 1),
    west: Vector3.create(1, 0, 0)
  }

  constructor(private sceneManager: SceneManager) {}

  createPortal(position: Vector3, rotation: Vector3, direction: Vector3, hoverText: string): void {
    const portal = engine.addEntity()

    pointerEventsSystem.onPointerDown(
      {
        entity: portal,
        opts: { button: InputAction.IA_POINTER, hoverText: hoverText, maxDistance: MAX_INTERACTION_DISTANCE }
      },
      () => this.handlePortalInteraction(direction)
    )

    Transform.create(portal, {
      position,
      rotation: Quaternion.fromEulerDegrees(rotation.x, rotation.y, rotation.z)
    })

    GltfContainer.create(portal, {
      src: `${MODEL_PATH}/portal_collider.glb`
    })

    // Save entities for poertals animation system
    Portal.create(portal, {
      right: this.createPortalPart(portal, FRAME_SCALE, 'portal_frame.glb'),
      left: this.createPortalPart(portal, FRAME_SCALE, 'portal_frame.glb'),
      top: this.createPortalPart(portal, TOP_FRAME_SCALE, 'portal_frame_top.glb'),
      audioTrigger: true
    })
  }

  private createPortalPart(parent: Entity, scale: Vector3, modelFile: string): Entity {
    const part = engine.addEntity()
    Transform.create(part, {
      parent,
      scale: Vector3.create(scale.x, scale.y, scale.z)
    })
    GltfContainer.create(part, {
      src: `${MODEL_PATH}/${modelFile}`
    })

    return part
  }

  private handlePortalInteraction(direction: Vector3): void {
    const currentRoom = this.sceneManager.getCurrentRoom()
    if (!currentRoom) return

    const targetRoom = new RoomCoordinate(
      currentRoom.x + direction.x,
      currentRoom.y + direction.y,
      currentRoom.z + direction.z
    )
    this.sceneManager.transitionToScene(targetRoom)
    movePlayerThroughPortal()
  }
}
