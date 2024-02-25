import { engine, Transform, inputSystem, PointerEvents, InputAction, PointerEventType, Material } from '@dcl/sdk/ecs'
import { Color4, Quaternion, Vector3 } from '@dcl/sdk/math'
import { Spinner, WiggleComponent, CansyComponent } from './components'
import { getRandomHexColor } from './utils'

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
