import { Entity, Transform, engine } from '@dcl/sdk/ecs'
import { createSubstringExtractor, extractAndMap, generateRandomString, lerp, moveTowards } from './miscUtils'
import {
  CansyComponent,
  FollowComponent,
  OrbitalMotionComponent,
  RollingEffectComponent,
  SwarmSystemComponent,
  TransformComponent,
  WiggleComponent
} from './components'
import { Quaternion, Vector3 } from '@dcl/sdk/math'
import { CansyArtInstallation } from './artInstallation'
import { applyRandomDirectionDeviation } from './positionUtils'

let time = 0

export class SwarmSystems {
  // ROTATION 🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡
  /**
   * creates RotationComponents based on room ID
   * Applying gradual variations in rotation speed and direction.
   */

  static initRotateEntities(roomId: string, entitiesCount: number): string {
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
      TransformComponent.getMutable(entity).localTransform.rotation = Quaternion.fromEulerDegrees(0, 0, 0)

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

      SwarmSystemComponent.createOrReplace(entity, {
        degrees: degrees > 360 ? degrees % 360 : degrees,
        direction: { x: dirX, y: dirY, z: dirZ }
      })

      // Increase the gradient for the next entity
      currentGradient += gradientStep

      index++
    }

    // Add rotation system to the engine
    const systemIdentifier = `system-${generateRandomString()}`
    engine.addSystem(SwarmSystems.rotationSystem, 1, systemIdentifier)

    return systemIdentifier
  }

  private static rotationSystem(dt: number) {
    for (const [entity] of engine.getEntitiesWith(CansyComponent, SwarmSystemComponent)) {
      const component = SwarmSystemComponent.get(entity)
      let localRotation = TransformComponent.get(entity).localTransform.rotation

      TransformComponent.getMutable(entity).localTransform.rotation = Quaternion.multiply(
        localRotation,
        Quaternion.fromAngleAxis(component.degrees, component.direction)
      )
    }
  }

  // 🟡 RANDOM POSITON 🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡

  static initRandomPositions(roomId: string, entitiesCount: number): string {
    const extractor = createSubstringExtractor(roomId)
    // Assuming you've already defined `createSubstringExtractor` and `extractAndMap`
    const speed = extractAndMap(extractor, 2, 0.1, 1) // Example: speed variation from 0.1 to 1

    for (const [entity] of engine.getEntitiesWith(CansyComponent)) {
      SwarmSystemComponent.createOrReplace(entity, {
        targetPosition: {
          x: Math.random() * 12 - 6, // Random between -6 and 6
          y: Math.random() * 12 - 6,
          z: Math.random() * 12 - 6
        },
        speed: speed
      })
      console.log()
    }

    const systemIdentifier = `system-${generateRandomString()}`
    engine.addSystem(SwarmSystems.randomPositionSystem, 1, systemIdentifier)

    return systemIdentifier
  }

  private static randomPositionSystem(dt: number) {
    for (const [entity] of engine.getEntitiesWith(CansyComponent, SwarmSystemComponent, TransformComponent)) {
      const positionComp = SwarmSystemComponent.getMutable(entity)
      const transformComp = TransformComponent.getMutable(entity)

      const currentPos = transformComp.localTransform.position
      const targetPos = positionComp.targetPosition
      const speed = positionComp.speed

      // Calculate the new position, moving towards the target position based on the speed and dt
      const newPos = {
        x: moveTowards(currentPos.x, targetPos.x, speed * dt),
        y: moveTowards(currentPos.y, targetPos.y, speed * dt),
        z: moveTowards(currentPos.z, targetPos.z, speed * dt)
      }

      transformComp.localTransform.position = newPos

      // Check if the entity has reached its target position
      if (
        Math.abs(newPos.x - targetPos.x) < 0.1 &&
        Math.abs(newPos.y - targetPos.y) < 0.1 &&
        Math.abs(newPos.z - targetPos.z) < 0.1
      ) {
        // Assign a new random target position
        positionComp.targetPosition = {
          x: Math.random() * 12 - 6,
          y: Math.random() * 12 - 6,
          z: Math.random() * 12 - 6
        }
      }
    }
  }

  // 🟡 INSTANT JUMP 🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡
  static initRandomJump(roomId: string, entitiesCount: number): string {
    const systemIdentifier = `system-${generateRandomString()}`
    engine.addSystem(SwarmSystems.instantJumpSystem, 1, systemIdentifier)

    return systemIdentifier
  }

  private static instantJumpSystem() {
    const entitiesCount = CansyArtInstallation.getInstance()!.getEntitesCount()
    const randomIndex = Math.floor(Math.random() * entitiesCount)
    let index = 0

    for (const [entity] of engine.getEntitiesWith(TransformComponent)) {
      if (index == randomIndex) {
        // Generate a new random position
        const newPos = {
          x: Math.random() * 12 - 6, // Random between -6 and 6
          y: Math.random() * 12 - 6,
          z: Math.random() * 12 - 6
        }

        // Immediately update the entity's position to the new random position
        const transformComp = TransformComponent.getMutable(entity)
        transformComp.localTransform.position = newPos
      }
      index++
    }
  }

  // 🟡 FOLLOW EACH OTHER LIKE SNAKE 🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡

  static initCircularFollowSystem(roomId: string, entitiesCount: number): string {
    // Initial setup
    const extractor = createSubstringExtractor(roomId)
    extractAndMap(extractor, 2, 0, 1) // skip first 2 digits

    // Extract base rotation parameters
    const speed = extractAndMap(extractor, 2, 0.1, 1)
    const deviationIntensity = extractAndMap(extractor, 2, 0, 10)
    const sinDirection = {
      x: extractAndMap(extractor, 2, -1, 1), // Random value between -1 and 1
      y: extractAndMap(extractor, 2, -1, 1),
      z: extractAndMap(extractor, 2, -1, 1)
    }

    let firstEntity: Entity | null = null
    let lastEntity: Entity | null = null
    let previousEntity: Entity | null = null

    for (const [entity] of engine.getEntitiesWith(TransformComponent)) {
      if (firstEntity && previousEntity) {
        FollowComponent.createOrReplace(entity, {
          nextEntityId: previousEntity,
          speed: speed,
          sinDirection: sinDirection,
          deviationIntensity: deviationIntensity
        })
      } else {
        firstEntity = entity
      }
      previousEntity = entity
      lastEntity = entity
    }

    if (firstEntity && lastEntity) {
      FollowComponent.createOrReplace(firstEntity, {
        nextEntityId: lastEntity,
        speed: FollowComponent.get(lastEntity).speed
      })
    }

    const systemIdentifier = `system-${generateRandomString()}`
    engine.addSystem(SwarmSystems.circularFollowSystem, 1, systemIdentifier)

    return systemIdentifier
  }

  private static circularFollowSystem(dt: number) {
    for (const [entity] of engine.getEntitiesWith(CansyComponent, TransformComponent, FollowComponent)) {
      const transformComp = TransformComponent.getMutable(entity)
      const followComp = FollowComponent.get(entity)

      const targetEntityPos = Transform.get(followComp.nextEntityId).position

      transformComp.localTransform.position = Vector3.lerp(
        transformComp.localTransform.position,
        targetEntityPos,
        followComp.speed * dt // Use the component's speed to control the interpolation rate
      )
    }
  }

  // 🟡 PARTICLES 🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡

  static initParticleSystem(roomId: string, entitiesCount: number): string {
    const extractor = createSubstringExtractor(roomId)
    extractAndMap(extractor, 2, 0, 1) // Skip first 2 digits

    const baseSpeed = extractAndMap(extractor, 2, 0.1, 1)
    const speedDeviation = extractAndMap(extractor, 2, 0, 1)
    const directionDeviationDegrees = extractAndMap(extractor, 2, -2, 2) // Assuming deviation in degrees

    // Original direction, potentially to be adjusted for deviation
    let direction: Vector3 = {
      x: extractAndMap(extractor, 2, -1, 1),
      y: extractAndMap(extractor, 2, -1, 1),
      z: extractAndMap(extractor, 2, -1, 1)
    }

    for (const [entity] of engine.getEntitiesWith(CansyComponent)) {
      const entitySpeed = baseSpeed + Math.random() * speedDeviation * (Math.random() > 0.5 ? 1 : -1)

      // Apply direction deviation here
      if (directionDeviationDegrees !== 0) {
        direction = applyRandomDirectionDeviation(direction, directionDeviationDegrees)
      }

      // Initialize or update particle component with direction and speed
      SwarmSystemComponent.createOrReplace(entity, {
        speed: entitySpeed,
        direction: direction
      })
    }

    const systemIdentifier = `system-${generateRandomString()}`
    engine.addSystem(SwarmSystems.particleMovementSystem, 1, systemIdentifier)

    return systemIdentifier
  }

  private static particleMovementSystem(dt: number) {
    for (const [entity] of engine.getEntitiesWith(CansyComponent, SwarmSystemComponent)) {
      const particleComp = SwarmSystemComponent.get(entity)
      const transformComp = TransformComponent.getMutable(entity)

      // Calculate new position based on speed, direction, and delta time
      const direction = particleComp.direction
      const speed = particleComp.speed

      // Update the entity's position
      transformComp.localTransform.position.x += direction.x * speed * dt
      transformComp.localTransform.position.y += direction.y * speed * dt
      transformComp.localTransform.position.z += direction.z * speed * dt

      // Boundary checks for wrapping around
      if (transformComp.localTransform.position.x > 7) {
        transformComp.localTransform.position.x = -7
      } else if (transformComp.localTransform.position.x < -7) {
        transformComp.localTransform.position.x = 7
      }

      if (transformComp.localTransform.position.y > 7) {
        transformComp.localTransform.position.y = -7
      } else if (transformComp.localTransform.position.y < -7) {
        transformComp.localTransform.position.y = 7
      }

      if (transformComp.localTransform.position.z > 7) {
        transformComp.localTransform.position.z = -7
      } else if (transformComp.localTransform.position.z < -7) {
        transformComp.localTransform.position.z = 7
      }
    }
  }

  // 🟡 WIGGLE 🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡

  static initWiggleSystem(roomId: string, entitiesCount: number): string {
    const extractor = createSubstringExtractor(roomId)
    extractAndMap(extractor, 2, 0, 1) // Skip first 2 digits

    const amplitude = extractAndMap(extractor, 2, 0.01, 1)
    const wavelength = extractAndMap(extractor, 2, 0.01, 10)
    const speed = extractAndMap(extractor, 2, 0.1, 3)
    const phaseIncrement = (2 * Math.PI) / entitiesCount // Full wave distributed across all entities

    let currentPhaseOffset = 0 // Start phase offset for the first entity

    for (const [entity] of engine.getEntitiesWith(CansyComponent)) {
      WiggleComponent.createOrReplace(entity, {
        basePosition: TransformComponent.get(entity).localTransform.position, // Assuming this gets the current position
        amplitude: amplitude,
        wavelength: wavelength,
        speed: speed,
        phaseOffset: currentPhaseOffset
      })

      currentPhaseOffset += phaseIncrement // Increment phase offset for the next entity
    }

    const systemIdentifier = `system-${generateRandomString()}`
    engine.addSystem(SwarmSystems.wiggleSystem, 1, systemIdentifier)

    return systemIdentifier
  }

  private static wiggleSystem(dt: number) {
    const currentTime = (time += dt)

    for (const [entity] of engine.getEntitiesWith(TransformComponent, WiggleComponent)) {
      const wiggleComp = WiggleComponent.get(entity)
      const transformComp = TransformComponent.getMutable(entity)

      // Calculate the new position using a sine wave
      const theta = currentTime * wiggleComp.speed + wiggleComp.phaseOffset
      const waveOffset = Math.sin(theta) * wiggleComp.amplitude

      // Apply waveOffset to the entity's position
      // This example applies it vertically (y-axis), adjust as needed
      transformComp.localTransform.position.y = wiggleComp.basePosition.y + waveOffset

      // Extend this to x and z axes if desired, depending on your wave direction
    }
  }

  // 🟡 ROLLING 🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡

  static initRollingEffectSystem(roomId: string, entitiesCount: number): string {
    const extractor = createSubstringExtractor(roomId)
    const scaleAmplitude = extractAndMap(extractor, 2, 0.01, 0.1) // Keep amplitude small to avoid excessive scaling
    const wavelength = extractAndMap(extractor, 2, 0.1, 10)
    const speed = extractAndMap(extractor, 2, 0.1, 5)
    const phaseIncrement = (2 * Math.PI) / entitiesCount

    let currentPhaseOffset = 0

    for (const [entity] of engine.getEntitiesWith(CansyComponent)) {
      RollingEffectComponent.createOrReplace(entity, {
        baseScale: TransformComponent.get(entity).localTransform.scale, // Assuming this gets the current scale
        scaleAmplitude: scaleAmplitude,
        wavelength: wavelength,
        speed: speed,
        phaseOffset: currentPhaseOffset
      })

      currentPhaseOffset += phaseIncrement
    }

    const systemIdentifier = `system-${generateRandomString()}`
    engine.addSystem(SwarmSystems.rollingEffectSystem, 1, systemIdentifier)

    return systemIdentifier
  }

  private static rollingEffectSystem(dt: number) {
    time += dt

    for (const [entity] of engine.getEntitiesWith(TransformComponent, RollingEffectComponent)) {
      const effectComp = RollingEffectComponent.get(entity)
      const transformComp = TransformComponent.getMutable(entity)

      const theta = time * effectComp.speed + effectComp.phaseOffset
      const scaleOffset = Math.sin(theta) * effectComp.scaleAmplitude + 1 // +1 ensures we always have a positive scale

      // Apply scaleOffset to the entity's scale
      transformComp.localTransform.scale.x = effectComp.baseScale.x * scaleOffset
      transformComp.localTransform.scale.y = effectComp.baseScale.y * scaleOffset // Applying effect uniformly, adjust as needed
      transformComp.localTransform.scale.z = effectComp.baseScale.z * scaleOffset

      // Extend this effect to target specific axes if desired, for non-uniform scaling
    }
  }

  // 🟡 ORBITAL 🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡

  static initOrbitalMotionSystem(roomId: string): string {
    const extractor = createSubstringExtractor(roomId)
    const orbitStyle = extractAndMap(extractor, 3, 0, 1) // 0 for similar orbits, 1 for diverse orbits
    const baseRadius = extractAndMap(extractor, 2, 0.2, 7)
    const speedVariability = extractAndMap(extractor, 2, 0, 1)
    const baseSpeed = extractAndMap(extractor, 2, 0.2, 2) // 0 for uniform speed, 1 for varied speeds
    const direction = extractAndMap(extractor, 2, 0, 1) < 0.5 ? 1 : -1

    for (const [entity] of engine.getEntitiesWith(CansyComponent)) {
      const position = TransformComponent.get(entity).localTransform.position
      // Apply speed variability
      const orbitSpeed = baseSpeed + speedVariability * Math.random() * 0.5

      // Adjust orbitRadius for 3D effect based on orbitStyle
      const orbitRadiusX = baseRadius + Math.random() * orbitStyle
      const orbitRadiusY = baseRadius + Math.random() * (1 - orbitStyle)
      const orbitRadiusZ = baseRadius * orbitStyle // Enhance Z for more 3D orbits with higher orbitStyle

      // Tilt angles based on orbitStyle
      const tiltMax = Math.PI / 4 // Max tilt in radians
      const tiltAngleX = orbitStyle * tiltMax * (Math.random() - 0.5) * 2
      const tiltAngleZ = orbitStyle * tiltMax * (Math.random() - 0.5) * 2

      OrbitalMotionComponent.createOrReplace(entity, {
        orbitCenter: { x: 0, y: 0, z: 0 }, // Center at 0,0,0
        orbitRadiusX: orbitRadiusX,
        orbitRadiusY: orbitRadiusY,
        orbitRadiusZ: orbitRadiusZ,
        orbitSpeed: orbitSpeed,
        phaseOffset: Math.random() * 2 * Math.PI,
        tiltAngleX: tiltAngleX,
        tiltAngleZ: tiltAngleZ,
        direction: direction,
        startPosition: position,
        transitionProgress: 0
      })
    }

    const systemIdentifier = `system-${generateRandomString()}`
    engine.addSystem(SwarmSystems.orbitalMotionSystem, 1, systemIdentifier)

    return systemIdentifier
  }

  private static orbitalMotionSystem(dt: number) {
    time += dt

    for (const [entity] of engine.getEntitiesWith(TransformComponent, OrbitalMotionComponent)) {
      const orbitalComp = OrbitalMotionComponent.getMutable(entity)
      const transformComp = TransformComponent.getMutable(entity)

      // If transition is not complete, update progress
      if (orbitalComp.transitionProgress < 1) {
        orbitalComp.transitionProgress += dt * 0.3 // Adjust transition speed as needed
        orbitalComp.transitionProgress = Math.min(orbitalComp.transitionProgress, 1) // Clamp to max 1
      }

      // Interpolate between start position and orbit position based on transitionProgress
      const orbitPosition = SwarmSystems.calculateOrbitPosition(orbitalComp, time) // Use a function to calculate the orbit position
      transformComp.localTransform.position = {
        x: lerp(orbitalComp.startPosition.x, orbitPosition.x, orbitalComp.transitionProgress),
        y: lerp(orbitalComp.startPosition.y, orbitPosition.y, orbitalComp.transitionProgress),
        z: lerp(orbitalComp.startPosition.z, orbitPosition.z, orbitalComp.transitionProgress)
      }
    }
  }

  private static calculateOrbitPosition(orbitalComp: any, time: number) {
    // Standard orbital calculation
    const theta = time * orbitalComp.orbitSpeed * orbitalComp.direction + orbitalComp.phaseOffset
    let x = Math.cos(theta) * orbitalComp.orbitRadiusX
    let y = Math.sin(theta) * orbitalComp.orbitRadiusZ // Use Z radius for Y-axis movement in 3D space
    let z = Math.sin(theta) * orbitalComp.orbitRadiusY

    // Apply tilt to the orbit
    const tiltX = y * Math.cos(orbitalComp.tiltAngleX) - z * Math.sin(orbitalComp.tiltAngleX)
    const tiltZ = y * Math.sin(orbitalComp.tiltAngleX) + z * Math.cos(orbitalComp.tiltAngleX)
    y = tiltX
    z = tiltZ * Math.cos(orbitalComp.tiltAngleZ) - x * Math.sin(orbitalComp.tiltAngleZ)
    x = x * Math.cos(orbitalComp.tiltAngleZ) + tiltZ * Math.sin(orbitalComp.tiltAngleZ)

    // Return the calculated position as an object { x, y, z }
    return { x, y, z }
  }
}
