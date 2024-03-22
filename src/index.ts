import { Quaternion, Vector3 } from '@dcl/sdk/math'
import { CansyArtInstallation } from './CansyArtInstallation/artInstallation'
import { GltfContainer, InputAction, Transform, VisibilityComponent, engine, pointerEventsSystem } from '@dcl/sdk/ecs'
import { movePlayerTo } from '~system/RestrictedActions'

const artInstallation = CansyArtInstallation.initInstance({
  entitiesCount: 170,
  transform: {
    position: Vector3.create(8, 0, 8),
    rotation: Quaternion.fromEulerDegrees(0, 0, 0)
  }
})

export function main() {
  // CUBE
  const cube = engine.addEntity()
  GltfContainer.create(cube, {
    src: 'models/cansy_cube_4.glb'
  })
  Transform.create(cube, {
    position: Vector3.create(8, 0, 8)
  })

  // BUTTON TO TELEPORT INTO THE CUBE

  // const arrow = engine.addEntity()
  // GltfContainer.create(arrow, {
  //   src: 'models/arrow.glb'
  // })
  // Transform.create(arrow, {
  //   position: Vector3.create(8, 0, 8)
  // })
  // pointerEventsSystem.onPointerDown(
  //   {
  //     entity: arrow,
  //     opts: {
  //       button: InputAction.IA_POINTER,
  //       hoverText: 'Click'
  //     }
  //   },
  //   function () {
  //     movePlayerTo({
  //       newRelativePosition: Vector3.create(8, 16, 8)
  //     })
  //   }
  // )
}
