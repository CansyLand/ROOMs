import { Schemas, Transform, engine } from '@dcl/sdk/ecs'
import { C_TransformComponent, CansyComponent } from '../components'
import { Quaternion, Vector3 } from '@dcl/sdk/math'
import { createSubstringExtractor, extractAndMap, generateRandomString } from '../utils'

// export function wiggleSystem(dt: number) {
//     // const time = engine.getTime(); // Assuming a method to get the current time
//     const entitiesWithWiggle = engine.getEntitiesWith(CansyComponent, Transform)

//     for (const [entity, _wiggle, _transform] of entitiesWithWiggle) {
//       const wiggle = WiggleComponent.get(entity)
//       const transform = Transform.getMutable(entity)

//       const angle = Math.sin(dt * wiggle.frequency + wiggle.phase) * wiggle.amplitude
//       // Here we apply the wiggle effect. This example rotates around the Y axis.
//       // Adjust this logic if you need to wiggle in a different manner (e.g., position or different axis)
//       transform.rotation = Quaternion.multiply(Quaternion.fromAngleAxis(angle, Vector3.Up()), transform.rotation)
//       transform.rotation = Quaternion.add(Quaternion.fromAngleAxis(angle, Vector3.Up()), transform.rotation)
//       // transform.rotation = Quaternion.fromEulerDegrees(0, angle * 10, 0)
//     }
//   }

const RotateComponent = engine.defineComponent('rotate', {
  degrees: Schemas.Float,
  direction: Schemas.Vector3
})

/**
 * creates RotationComponents based on room ID
 * Applying gradual variations in rotation speed and direction.
 */

export function rotateEntities(roomId: string, entitiesCount: number): string {
  console.log('Start rotation system')

  // Initial setup
  const extractor = createSubstringExtractor(roomId)
  extractAndMap(extractor, 2, 0, 1) // skip first 2 digits

  // Extract base rotation parameters
  const baseDegrees = extractAndMap(extractor, 2, -10, 10)
  const gradient = extractAndMap(extractor, 3, 0, 10)

  // Apply gradient influence
  const gradientEffect = gradient > 5

  // Determine variation influence
  const degreesVariation = extractAndMap(extractor, 2, 0, 1)
  const directionVariation = extractAndMap(extractor, 2, 0, 1)

  const baseX = extractAndMap(extractor, 3, -1, 1)
  const baseY = extractAndMap(extractor, 3, -1, 1)
  const baseZ = extractAndMap(extractor, 3, -1, 1)

  // Calculate the gradient step
  const gradientStep = 1 / entitiesCount // Defines how much the gradient effect increases per entity

  let currentGradient = 0 // Initialize current gradient value
  let index = 0

  for (const [entity] of engine.getEntitiesWith(CansyComponent)) {
    C_TransformComponent.getMutable(entity).localTransform.rotation = Quaternion.fromEulerDegrees(0, 0, 0)

    // Calculate degrees and direction variation based on current gradient
    const gradientMultiplier = gradientEffect ? currentGradient : 1 // Use current gradient if effect is active, else use full variation
    const adjustedVariationStepDegrees = (degreesVariation * 10 * gradientMultiplier) / entitiesCount

    const degrees = baseDegrees + (degreesVariation ? index * adjustedVariationStepDegrees : 0)

    // Adjust direction based on variation and current gradient
    const variationMultiplier = (directionVariation ? Math.random() * 2 - 1 : 0) * gradientMultiplier
    let dirX = baseX + variationMultiplier * directionVariation
    let dirY = baseY + variationMultiplier * directionVariation
    let dirZ = baseZ + variationMultiplier * directionVariation

    // Clamping x, y, z to ensure they stay within -1 to 1
    dirX = Math.max(-1, Math.min(1, dirX))
    dirY = Math.max(-1, Math.min(1, dirY))
    dirZ = Math.max(-1, Math.min(1, dirZ))

    RotateComponent.createOrReplace(entity, {
      degrees: degrees > 360 ? degrees % 360 : degrees,
      direction: { x: dirX, y: dirY, z: dirZ }
    })

    // Increase the gradient for the next entity
    currentGradient += gradientStep

    index++
  }

  // Add rotation system to the engine
  const systemIdentifier = `system-${generateRandomString()}`
  engine.addSystem(rotationSystem, 1, systemIdentifier)

  return systemIdentifier
}

export function rotationSystem(dt: number) {
  for (const [entity] of engine.getEntitiesWith(CansyComponent, RotateComponent)) {
    const component = RotateComponent.get(entity)
    let localRotation = C_TransformComponent.get(entity).localTransform.rotation

    C_TransformComponent.getMutable(entity).localTransform.rotation = Quaternion.multiply(
      localRotation,
      Quaternion.fromAngleAxis(component.degrees, component.direction)
    )
  }
}

// Bilboard
