import { engine, Transform, inputSystem, PointerEvents, InputAction, PointerEventType, Material } from '@dcl/sdk/ecs'
import { Color4, Quaternion, Vector3 } from '@dcl/sdk/math'
import { Spinner, WiggleComponent, CansyComponent, C_ForceComponent, C_TransformComponent } from './components'
import { getRandomHexColor } from './utils'
import { artInstallation } from '.'

// Manages the Transform of entities

export function C_updateAbstractTransformSystem(dt: number) {
  for (const [entity] of engine.getEntitiesWith(CansyComponent)) {
    const transformComp = C_TransformComponent.getMutable(entity)
    const entityTransform = Transform.getMutable(entity)

    // Calculate Global Transform Position (no need for rotation and scale)
    const parentTransfrom = artInstallation.getParentTransform()
    transformComp.globalTransform.position = Vector3.add(
      transformComp.localTransform.position,
      parentTransfrom.position!
    )

    // Update Entity's Actual Transform with the computed values
    entityTransform.position = Vector3.add(
      transformComp.localTransform.position,
      transformComp.deviationTransform.position
    )
    entityTransform.rotation = transformComp.localTransform.rotation
    entityTransform.scale = transformComp.localTransform.scale
  }
}

// pushes entites away from player if to close
export function C_forceFieldSystem(dt: number) {
  const playerPos = Transform.get(engine.PlayerEntity).position
  const forceFieldRadius = 3 // Set to 3 meters as specified

  for (const [entity] of engine.getEntitiesWith(C_TransformComponent)) {
    const transformComp = C_TransformComponent.getMutable(entity)

    // Calculate distance based on the entity's globalTransform position
    const directionToPlayer = Vector3.subtract(playerPos, transformComp.globalTransform.position)
    const distanceToPlayer = Vector3.length(directionToPlayer)

    // Check if the player is within the forceFieldRadius
    if (distanceToPlayer < forceFieldRadius) {
      // Calculate the deviation needed to push the entity away from the player
      const moveDirection = Vector3.normalize(directionToPlayer)
      const moveDistance = forceFieldRadius - distanceToPlayer // The amount to push away

      // Update the deviationTransform.position to push the entity away
      transformComp.deviationTransform.position = Vector3.subtract(
        Vector3.Zero(),
        Vector3.scale(moveDirection, moveDistance)
      )
    } else {
      // Reset the deviationTransform.position if the player is outside the forceFieldRadius
      transformComp.deviationTransform.position = Vector3.Zero()
    }
  }
}

/**
 * All cubes rotating behavior
 */
export function circularSystem(dt: number) {
  const entitiesWithSpinner = engine.getEntitiesWith(Spinner, Transform)
  for (const [entity, _spinner, _transform] of entitiesWithSpinner) {
    const mutableTransform = Transform.getMutable(entity)
    const spinnerData = Spinner.get(entity)

    mutableTransform.rotation = Quaternion.multiply(
      mutableTransform.rotation,
      Quaternion.fromAngleAxis(dt * spinnerData.speed, Vector3.Forward())
    )
  }
}

export function circularSystem2(dt: number) {
  const entitiesWithSpinner = engine.getEntitiesWith(Spinner, Transform)
  for (const [entity, _spinner, _transform] of entitiesWithSpinner) {
    const mutableTransform = Transform.getMutable(entity)
    const spinnerData = Spinner.get(entity)

    mutableTransform.rotation = Quaternion.multiply(
      mutableTransform.rotation,
      Quaternion.fromAngleAxis(dt * spinnerData.speed * 100, Vector3.Up())
    )
  }
}

/**
 * Search for the cubes that has pointerEvents, and when there is a click change the color.
 */
export function changeColorSystem() {
  for (const [entity] of engine.getEntitiesWith(CansyComponent, PointerEvents)) {
    if (inputSystem.isTriggered(InputAction.IA_POINTER, PointerEventType.PET_DOWN, entity)) {
      Material.setPbrMaterial(entity, { albedoColor: Color4.fromHexString(getRandomHexColor()) })
    }
  }
}

export function wiggleSystem(dt: number) {
  // const time = engine.getTime(); // Assuming a method to get the current time
  const entitiesWithWiggle = engine.getEntitiesWith(WiggleComponent, Transform)

  for (const [entity, _wiggle, _transform] of entitiesWithWiggle) {
    const wiggle = WiggleComponent.get(entity)
    const transform = Transform.getMutable(entity)

    const angle = Math.sin(dt * wiggle.frequency + wiggle.phase) * wiggle.amplitude
    // Here we apply the wiggle effect. This example rotates around the Y axis.
    // Adjust this logic if you need to wiggle in a different manner (e.g., position or different axis)
    transform.rotation = Quaternion.multiply(Quaternion.fromAngleAxis(angle, Vector3.Up()), transform.rotation)
    transform.rotation = Quaternion.add(Quaternion.fromAngleAxis(angle, Vector3.Up()), transform.rotation)
    // transform.rotation = Quaternion.fromEulerDegrees(0, angle * 10, 0)
  }
}
