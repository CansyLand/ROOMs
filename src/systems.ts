import { engine, Transform, inputSystem, PointerEvents, InputAction, PointerEventType, Material } from '@dcl/sdk/ecs'
import { Color4, Quaternion, Vector3 } from '@dcl/sdk/math'
import {
  Spinner,
  WiggleComponent,
  CansyComponent,
  C_ForceComponent,
  C_TransformComponent,
  C_Portal
} from './components'
import { getRandomHexColor, lerp } from './utils'
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

export function C_portalAnimationSystem(dt: number) {
  for (const [portal] of engine.getEntitiesWith(C_Portal, Transform)) {
    const portalComp = C_Portal.getMutable(portal)
    const portalTransform = Transform.get(portal)
    const playerPos = Transform.get(engine.PlayerEntity).position

    // Calculate distance to player
    const distance = Vector3.distance(portalTransform.position, playerPos)

    // Determine if opening or closing and update portal component state
    portalComp.isOpening = distance < 6
    if (portalComp.isOpening) {
      portalComp.animationProgress += dt * 1 //portalComp.speed // Increase progress for opening
    } else {
      portalComp.animationProgress -= dt * 1 //portalComp.speed // Decrease progress for closing
    }
    portalComp.animationProgress = Math.max(0, Math.min(1, portalComp.animationProgress)) // Clamp progress between 0 and 1

    // Update portal components based on distance
    C_updatePortalComponents(portalComp, dt)
  }
}

function C_updatePortalComponents(portalComp: any, dt: number) {
  const leftBar = Transform.getMutable(portalComp.left)
  const rightBar = Transform.getMutable(portalComp.right)
  const topBar = Transform.getMutable(portalComp.top)

  const portalScale = 4
  const topBarPosition = 4

  // Adjusting scaleFactor logic for smoother transition
  // Use continuous scale factor for smoother transitions
  let scaleFactor =
    portalComp.animationProgress <= 0.5
      ? portalComp.animationProgress / 0.5
      : (portalComp.animationProgress - 0.5) / 0.5

  if (portalComp.isOpening) {
    if (portalComp.animationProgress <= 0.5) {
      // Only rise during the first half of the opening progress
      leftBar.scale.y = rightBar.scale.y = portalScale * scaleFactor
      topBar.position.y = 2 * scaleFactor
      topBar.scale.y = 0.5 * scaleFactor
      topBar.scale.x = 0.1 // Keep top bar minimally scaled until moving to sides
    } else {
      // Ensure vertical bars are fully risen before expanding horizontally
      leftBar.scale.y = rightBar.scale.y = portalScale
      topBar.position.y = topBarPosition

      // Now handle the horizontal expansion with easing
      scaleFactor = (portalComp.animationProgress - 0.5) / 0.5 // Reset scaleFactor for second phase
      // leftBar.position.x = lerp(0, -0.5, scaleFactor) // Easing from center to left
      // rightBar.position.x = lerp(0, 0.5, scaleFactor) // Easing from center to right
      // topBar.scale.x = lerp(0.1, 1, scaleFactor) // Gradually increase the scale of the top bar
      leftBar.position.x = lerpWithEasing(0, -0.5, scaleFactor) // Easing from center to left
      rightBar.position.x = lerpWithEasing(0, 0.5, scaleFactor) // Easing from center to right
      topBar.scale.x = lerpWithEasing(0.1, 1, scaleFactor) // Gradually increase the scale of the top bar
    }
  } else {
    // Reverse the logic for closing
    if (portalComp.animationProgress >= 0.5) {
      // Start by moving bars together
      // leftBar.position.x = lerp(-0.5, 0, 1 - scaleFactor)
      // rightBar.position.x = lerp(0.5, 0, 1 - scaleFactor)
      // topBar.scale.x = lerp(1, 0.1, 1 - scaleFactor)
      leftBar.position.x = lerpWithEasing(0, -0.5, scaleFactor) // Easing from center to left
      rightBar.position.x = lerpWithEasing(0, 0.5, scaleFactor) // Easing from center to right
      topBar.scale.x = lerpWithEasing(0.1, 1, scaleFactor) // Gradually increase the scale of the top bar
    } else {
      // Then lower them once they're together
      leftBar.scale.y = rightBar.scale.y = lerp(2, 0, 1 - scaleFactor * 2)
      topBar.position.y = lerp(2, 0, 1 - scaleFactor * 2)
      topBar.scale.y = 0
    }
  }

  // Adjust for exact opening/closing to avoid jumps
  if (portalComp.animationProgress <= 0) {
    leftBar.position.x = rightBar.position.x = 0
    leftBar.scale.y = rightBar.scale.y = topBar.scale.x = 0
    topBar.position.y = 0
  } else if (portalComp.animationProgress >= 1) {
    leftBar.position.x = -0.5
    rightBar.position.x = 0.5
    leftBar.scale.y = rightBar.scale.y = portalScale
    topBar.scale.x = 1
    topBar.position.y = topBarPosition
  }
}

// Ease-out function: starts fast, then decelerates
function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3)
}

// Adjust the lerp function to include easing
function lerpWithEasing(start: number, end: number, t: number) {
  // Apply an easing function to 't'
  const tEased = easeOutCubic(t)
  return lerp(start, end, tEased)
}

// /**
//  * All cubes rotating behavior
//  */
// export function circularSystem(dt: number) {
//   const entitiesWithSpinner = engine.getEntitiesWith(Spinner, Transform)
//   for (const [entity, _spinner, _transform] of entitiesWithSpinner) {
//     const mutableTransform = Transform.getMutable(entity)
//     const spinnerData = Spinner.get(entity)

//     mutableTransform.rotation = Quaternion.multiply(
//       mutableTransform.rotation,
//       Quaternion.fromAngleAxis(dt * spinnerData.speed, Vector3.Forward())
//     )
//   }
// }

// export function circularSystem2(dt: number) {
//   const entitiesWithSpinner = engine.getEntitiesWith(Spinner, Transform)
//   for (const [entity, _spinner, _transform] of entitiesWithSpinner) {
//     const mutableTransform = Transform.getMutable(entity)
//     const spinnerData = Spinner.get(entity)

//     mutableTransform.rotation = Quaternion.multiply(
//       mutableTransform.rotation,
//       Quaternion.fromAngleAxis(dt * spinnerData.speed * 100, Vector3.Up())
//     )
//   }
// }

// /**
//  * Search for the cubes that has pointerEvents, and when there is a click change the color.
//  */
// export function changeColorSystem() {
//   for (const [entity] of engine.getEntitiesWith(CansyComponent, PointerEvents)) {
//     if (inputSystem.isTriggered(InputAction.IA_POINTER, PointerEventType.PET_DOWN, entity)) {
//       Material.setPbrMaterial(entity, { albedoColor: Color4.fromHexString(getRandomHexColor()) })
//     }
//   }
// }

// export function wiggleSystem(dt: number) {
//   // const time = engine.getTime(); // Assuming a method to get the current time
//   const entitiesWithWiggle = engine.getEntitiesWith(WiggleComponent, Transform)

//   for (const [entity, _wiggle, _transform] of entitiesWithWiggle) {
//     const wiggle = WiggleComponent.get(entity)
//     const transform = Transform.getMutable(entity)

//     const angle = Math.sin(dt * wiggle.frequency + wiggle.phase) * wiggle.amplitude
//     // Here we apply the wiggle effect. This example rotates around the Y axis.
//     // Adjust this logic if you need to wiggle in a different manner (e.g., position or different axis)
//     transform.rotation = Quaternion.multiply(Quaternion.fromAngleAxis(angle, Vector3.Up()), transform.rotation)
//     transform.rotation = Quaternion.add(Quaternion.fromAngleAxis(angle, Vector3.Up()), transform.rotation)
//     // transform.rotation = Quaternion.fromEulerDegrees(0, angle * 10, 0)
//   }
// }
