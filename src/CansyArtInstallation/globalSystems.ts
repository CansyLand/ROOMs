import { engine, Transform, AudioSource, VisibilityComponent } from '@dcl/sdk/ecs'
import { Vector3 } from '@dcl/sdk/math'
import { CansyComponent, Portal, TransformComponent } from './components'
import { CansyArtInstallation } from './artInstallation'
import { lerp, lerpWithEasing } from './miscUtils'

// Manages the Transform of entities

let playerIsInCube = false

export function checkIfPlayerIsInCube(dt: number) {
  const distance = 7
  const artInstallation = CansyArtInstallation.getInstance()
  if (!artInstallation) return
  const artPos = artInstallation.getParentTransfrom().position
  if (!artPos) return
  if (!Transform.has(engine.PlayerEntity)) return
  const playerPos = Transform.get(engine.PlayerEntity).position
  if (
    playerPos.x > artPos.x - distance &&
    playerPos.x < artPos.x + distance &&
    playerPos.z < artPos.z + distance &&
    playerPos.z > artPos.z - distance &&
    playerPos.y > 7
  ) {
    playerIsInCube = true
    artInstallation.playMusic()
    // artInstallation.showInstallation() // already implemented by MESH
  } else {
    playerIsInCube = false
    artInstallation.stopMusic()
    artInstallation.clear()
  }
}

export function updateAbstractTransformSystem(dt: number) {
  if (!playerIsInCube) return

  const artInstallation = CansyArtInstallation.getInstance()
  if (!artInstallation) return

  for (const [entity] of engine.getEntitiesWith(CansyComponent, Transform)) {
    const transformComp = TransformComponent.getMutable(entity)
    const entityTransform = Transform.getMutable(entity)

    // Calculate Global Transform Position (no need for rotation and scale)
    const parentTransfrom = artInstallation.getTransform()
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
export function forceFieldSystem(dt: number) {
  if (!playerIsInCube) return

  if (!Transform.has(engine.PlayerEntity)) return
  const playerPos = Transform.get(engine.PlayerEntity).position
  const forceFieldRadius = 3 // Set to 3 meters as specified

  for (const [entity] of engine.getEntitiesWith(TransformComponent)) {
    const transformComp = TransformComponent.getMutable(entity)

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

let portalsVisible = false

export function portalAnimationSystem(dt: number) {
  if (!playerIsInCube) {
    if (portalsVisible) {
      // If player is not in cube make portals invisible
      for (const [portal] of engine.getEntitiesWith(Portal, VisibilityComponent)) {
        const p = Portal.get(portal)
        VisibilityComponent.getMutable(p.left).visible = false
        VisibilityComponent.getMutable(p.right).visible = false
        VisibilityComponent.getMutable(p.top).visible = false
      }
      portalsVisible = false
    }

    return
  } else {
    // If player is in cube and portals are invisible make them visible
    if (!portalsVisible) {
      for (const [portal] of engine.getEntitiesWith(Portal, VisibilityComponent)) {
        const p = Portal.get(portal)
        VisibilityComponent.getMutable(p.left).visible = true
        VisibilityComponent.getMutable(p.right).visible = true
        VisibilityComponent.getMutable(p.top).visible = true
      }
      portalsVisible = true
    }
  }

  for (const [portal] of engine.getEntitiesWith(Portal, Transform)) {
    const portalComp = Portal.getMutable(portal)
    const portalTransform = Transform.get(portal)
    if (!Transform.has(engine.PlayerEntity)) return
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
    updatePortalComponents(portalComp, dt)
  }
}

function updatePortalComponents(portalComp: any, dt: number) {
  if (!playerIsInCube) return

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
    portalComp.audioTrigger = true
  }

  if (portalComp.animationProgress > 0 && portalComp.animationProgress < 1 && portalComp.audioTrigger) {
    AudioSource.createOrReplace(portalComp.top, {
      audioClipUrl: 'audio/confirm_style_4_echo_003.mp3',
      loop: false,
      playing: true
    })
    portalComp.audioTrigger = false
  }
}
