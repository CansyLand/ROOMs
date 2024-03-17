// all entites have the same parent which is in the center of the scene
// all swarm shapes should arrange around the center point 0,0,0
// we have 180 entities to form swarm shapes

import { Transform, engine } from '@dcl/sdk/ecs'
import { addShape, createSubstringExtractor, mapNumberToRange } from './miscUtils'
import { CansyComponent, TransformComponent } from './components'
import { getQuaternion, rotateVector } from './quaternionUtils'
import { CansyArtInstallation } from './artInstallation'
import { Quaternion } from '@dcl/sdk/math'

export class SwarmShapes {
  //       ______________
  //     /             /|
  //    /             / |
  //   +------------+   |
  //   |            |   |
  //   |            |   +
  //   |            |  /
  //   |            | /
  //   +------------+

  static cubeShape(roomId: string, entitiesCount: number) {
    console.log('Shape one, Room ID:', roomId)
    const substring = createSubstringExtractor(roomId)
    substring(2) // Unused extraction, consider removing or using this data

    const shapeSize = mapNumberToRange(parseInt(substring(2), 10), 1, 10)
    const entityScale = mapNumberToRange(parseInt(substring(2), 10), 0.1, 0.5)
    const entitiesPerFace = entitiesCount / 6
    const sideLength = Math.sqrt(entitiesPerFace) | 0 // Approximate entities in a row/col, truncating for simplicity

    // Assuming a simple cube where all sides are equal
    const spacing = shapeSize / sideLength

    let i = 0 // Keep track of the entity index
    for (const [entity] of engine.getEntitiesWith(CansyComponent)) {
      const faceIndex = Math.floor(i / entitiesPerFace) // Determine which face the entity belongs to
      const positionInFace = i % entitiesPerFace // Position index on the current face
      const row = Math.floor(positionInFace / sideLength)
      const col = positionInFace % sideLength

      // Calculate position offsets based on face index
      let x = 0,
        y = 0,
        z = 0
      switch (faceIndex) {
        case 0: // Front
          x = (col - sideLength / 2) * spacing
          y = (row - sideLength / 2) * spacing
          z = shapeSize / 2 // Push out to front face
          break
        case 1: // Back
          x = (col - sideLength / 2) * spacing
          y = (row - sideLength / 2) * spacing
          z = -shapeSize / 2 // Push out to back face
          break
        case 2: // Top
          x = (col - sideLength / 2) * spacing
          y = shapeSize / 2 // Push up to top face
          z = (row - sideLength / 2) * spacing
          break
        case 3: // Bottom
          x = (col - sideLength / 2) * spacing
          y = -shapeSize / 2 // Push down to bottom face
          z = (row - sideLength / 2) * spacing
          break
        case 4: // Right
          x = shapeSize / 2 // Push out to right face
          y = (row - sideLength / 2) * spacing
          z = (col - sideLength / 2) * spacing
          break
        case 5: // Left
          x = -shapeSize / 2 // Push out to left face
          y = (row - sideLength / 2) * spacing
          z = (col - sideLength / 2) * spacing
          break
      }

      // Update entity position
      // Transform.createOrReplace(entity, {
      //   parent: artInstallation.parent(),
      //   position: { x, y, z },
      //   scale: { x: entityScale, y: entityScale, z: entityScale }
      // })

      const locTrans = TransformComponent.getMutable(entity).localTransform
      locTrans.position = { x, y, z }
      locTrans.scale = { x: entityScale, y: entityScale, z: entityScale }

      addShape(entity, 'box')

      i++ // Move to the next entity
    }
  }

  //            ____
  //        .X+.      .
  //      .Xx+-.       .
  //      XXx++-..
  //      XXxx++--..
  //      `XXXxx+++--'
  //        `XXXxxx'
  //           ""

  static sphereShape(roomId: string, entitiesCount: number) {
    console.log('Shape sphere, Room ID:', roomId)
    const substring = createSubstringExtractor(roomId)
    const radius = mapNumberToRange(parseInt(substring(2), 10), 0.1, 5) // Determine the sphere radius
    const entityScale = mapNumberToRange(parseInt(substring(2), 10), 0.1, 0.5)

    // Calculate even distribution steps
    const phiStep = Math.PI * (3 - Math.sqrt(5)) // Golden angle in radians for distribution

    let i = 0 // Entity counter
    for (const [entity] of engine.getEntitiesWith(CansyComponent)) {
      const y = 1 - (i / (entitiesCount - 1)) * 2 // y goes from 1 to -1
      const radiusAtY = Math.sqrt(1 - y * y) // radius at y

      const phi = i * phiStep // Golden angle increment

      const x = Math.cos(phi) * radiusAtY
      const z = Math.sin(phi) * radiusAtY

      // if (CansyComponent.has(entity)) {
      //   Transform.createOrReplace(entity, {
      //     parent: artInstallation.parent(),
      //     position: { x: radius * x, y: radius * y, z: radius * z },
      //     scale: { x: entityScale, y: entityScale, z: entityScale }
      //   })
      // }
      const locTrans = TransformComponent.getMutable(entity).localTransform
      locTrans.position = { x: radius * x, y: radius * y, z: radius * z }
      locTrans.scale = { x: entityScale, y: entityScale, z: entityScale }
      i++

      addShape(entity, 'box')
    }
  }

  //            ____
  //        .X+.      .
  //      .Xx+-.       .
  //      XXx++-..
  //      XXxx++--..
  //      `XXXxx+++--'
  //        `XXXxxx'
  //           ""

  static fibonacciSphereShape(roomId: string, entitiesCount: number) {
    console.log('Shape Fibonacci Sphere, Room ID:', roomId)
    const substring = createSubstringExtractor(roomId)

    const radius = mapNumberToRange(parseInt(substring(2), 10), 0.5, 5) // Sphere radius
    const goldenAngle = Math.PI * (3 - Math.sqrt(5)) // Golden angle

    let i = 0
    for (const [entity] of engine.getEntitiesWith(CansyComponent)) {
      const y = 1 - (i / (entitiesCount - 1)) * 2 // y goes from 1 to -1
      const radiusAtY = Math.sqrt(1 - y * y) * radius // radius at y

      const theta = goldenAngle * i // Angle increment

      const x = Math.cos(theta) * radiusAtY
      const z = Math.sin(theta) * radiusAtY

      // Transform.createOrReplace(entity, {
      //   parent: artInstallation.parent(),
      //   position: { x, y: radius * y, z },
      //   scale: { x: 0.2, y: 0.2, z: 0.2 } // Adjust scale as needed
      // })

      const locTrans = TransformComponent.getMutable(entity).localTransform
      locTrans.position = { x, y: radius * y, z }
      locTrans.scale = { x: 0.2, y: 0.2, z: 0.2 }

      addShape(entity, 'box')
      i++
    }
  }

  //         ____________
  //        /  /  /  /  /
  //       /__/__/__/__/
  //      /  /  /  /  /
  //     /__/__/__/__/
  //    /  /  /  /  /
  //   /__/__/__/__/

  static planeShape(roomId: string, entitiesCount: number) {
    console.log('Shape plane, Room ID:', roomId)
    const substring = createSubstringExtractor(roomId)

    // Determine the scale of entities to ensure they fit within the bounds
    const entityScale = mapNumberToRange(parseInt(substring(2), 10), 0.1, 0.5)

    const planeRotation = getQuaternion(roomId)

    // Assuming a square plane for simplicity, calculate how many entities can fit per side
    const sideLength = Math.sqrt(entitiesCount)
    const spacing = 12 / sideLength // 12m wide, centered at 0, so ranging from -6 to +6

    let i = 0
    for (const [entity] of engine.getEntitiesWith(CansyComponent)) {
      const row = Math.floor(i / sideLength)
      const col = i % sideLength

      // Calculate position before rotation
      let position = {
        x: (col - (sideLength / 2 - 0.5)) * spacing,
        y: 0, // Start with a horizontal plane
        z: (row - (sideLength / 2 - 0.5)) * spacing
      }

      // Rotate position around the center (0,0,0)
      //Quaternion.multiply(planeRotation)
      position = rotateVector(position, planeRotation)

      // Transform.createOrReplace(entity, {
      //   parent: artInstallation.parent(),
      //   position: position,
      //   rotation: planeRotation,
      //   scale: { x: entityScale, y: entityScale, z: entityScale }
      // })

      const locTrans = TransformComponent.getMutable(entity).localTransform
      locTrans.position = position
      locTrans.rotation = planeRotation
      locTrans.scale = { x: entityScale, y: entityScale, z: entityScale }

      addShape(entity, 'box')
      i++
    }
  }

  //           *      *
  //         *        *    *
  //             *  *
  //        *         *     *
  //            *         *
  //       *      *  *
  //           *         *

  static randomShape(roomId: string, entitiesCount: number) {
    console.log('Shape random, Room ID:', roomId)
    const substring = createSubstringExtractor(roomId)
    // Get base scale and scale variation
    const baseScale = mapNumberToRange(parseInt(substring(2), 10), 0.1, 1)
    const scaleVariation = mapNumberToRange(parseInt(substring(2), 10), 0, 1)

    const parent = CansyArtInstallation.getInstance()!.getEntity()

    for (const [entity] of engine.getEntitiesWith(CansyComponent)) {
      // Generate a random position within the bounds of -6 to +6 for x, y, and z
      const position = {
        x: Math.random() * 12 - 6,
        y: Math.random() * 12 - 6,
        z: Math.random() * 12 - 6
      }

      // Calculate a random scale factor based on the baseScale and scaleVariation
      const variationFactor = Math.random() * scaleVariation // 0 to scaleVariation
      const scaleAdjustment = 1 - variationFactor + Math.random() * variationFactor * 2 // Random between (1-scaleVariation) and (1+scaleVariation)
      const entityScale = baseScale * scaleAdjustment

      // Apply position and scale to entity
      Transform.createOrReplace(entity, {
        parent: parent,
        position: position,
        scale: { x: entityScale, y: entityScale, z: entityScale }
      })

      const locTrans = TransformComponent.getMutable(entity).localTransform
      locTrans.position = position
      locTrans.scale = { x: entityScale, y: entityScale, z: entityScale }

      addShape(entity, 'box')
    }
  }

  //
  //      /__/__/__/\
  //     /__/__/__/\/\
  //    /__/__/__/\/\/\
  //    \__\__\__\/\/\/
  //     \__\__\__\/\/
  //      \__\__\__\/
  //

  static matrixShape(roomId: string, entitiesCount: number) {
    console.log('Shape matrix, Room ID:', roomId)
    const substring = createSubstringExtractor(roomId)
    substring(2) // skipping the first 2 digits
    // Use substring to determine the scale - affects entity spacing within the cube
    const scale = mapNumberToRange(parseInt(substring(2), 10), 0.01, 1)

    // The cube's total side length in meters
    const cubeSize = 12 // Cube spans from -6 to +6 in each dimension

    // Determine how many entities can be placed along one side of the cube
    // This formula distributes entities evenly throughout the volume
    const entitiesPerSide = Math.cbrt(entitiesCount)

    // Calculate spacing between entities based on the number of entities per side
    // This spacing is adjusted to fit the cube's dimensions
    const spacing = cubeSize / entitiesPerSide

    let i = 0 // Entity counter
    for (const [entity] of engine.getEntitiesWith(CansyComponent)) {
      // Calculate 3D grid position (z, y, x) within the cube volume
      const z = Math.floor(i / (entitiesPerSide * entitiesPerSide))
      const y = Math.floor((i % (entitiesPerSide * entitiesPerSide)) / entitiesPerSide)
      const x = i % entitiesPerSide

      // Convert grid positions to world coordinates, ensuring the cube is centered at (0,0,0)
      const position = {
        x: (x - entitiesPerSide / 2) * spacing + spacing / 2,
        y: (y - entitiesPerSide / 2) * spacing + spacing / 2,
        z: (z - entitiesPerSide / 2) * spacing + spacing / 2
      }

      // Update entity position and scale
      // Transform.createOrReplace(entity, {
      //   parent: artInstallation.parent(),
      //   position: position,
      //   scale: { x: scale, y: scale, z: scale } // Apply uniform scale
      // })

      const locTrans = TransformComponent.getMutable(entity).localTransform
      locTrans.position = position
      locTrans.scale = { x: scale, y: scale, z: scale }

      addShape(entity, 'box')
      i++
    }
  }

  //
  //              ###########
  //           #
  //         #     ########
  //       #     #           #
  //      #     #    ####      #
  //      #    #    #    #      #
  //      #    #     #    #     #
  //       #     #       #     #
  //         #     ##### #    #
  //           #            #
  //              #########
  //

  static spiralShape(roomId: string, entitiesCount: number) {
    console.log('Shape spiral, Room ID:', roomId)
    const substring = createSubstringExtractor(roomId)

    // Example parameter determinations (customize as needed)
    const baseRadius = 1 // Starting radius at the bottom of the spiral
    const expansionRate = mapNumberToRange(parseInt(substring(2), 10), 0.05, 0.2) // How quickly the spiral expands
    const heightIncrement = 12 / entitiesCount // Total height divided by the number of entities
    const totalTurns = mapNumberToRange(parseInt(substring(3), 10), 2, 10) // Total revolutions from bottom to top

    const scale = mapNumberToRange(parseInt(substring(2), 10), 0.01, 1)

    let currentPosition = { x: 0, y: -6, z: 0 } // Starting at the bottom center

    for (const [entity] of engine.getEntitiesWith(CansyComponent)) {
      const yPosition = currentPosition.y + 6 + heightIncrement // Calculate new Y position
      const angle = (yPosition / 12) * Math.PI * 2 * totalTurns // Adjust angle based on new Y position
      const radius = baseRadius + expansionRate * yPosition // Expand radius as we move up

      // Create a new position object for each entity
      let newPosition = {
        x: Math.cos(angle) * radius,
        y: yPosition - 6, // Adjust back to original reference frame
        z: Math.sin(angle) * radius
      }

      // Update the currentPosition.y for the next iteration
      currentPosition.y += heightIncrement

      // Transform.createOrReplace(entity, {
      //   parent: artInstallation.parent(),
      //   position: newPosition,
      //   scale: { x: scale, y: scale, z: scale }
      // })

      const locTrans = TransformComponent.getMutable(entity).localTransform
      locTrans.position = newPosition
      locTrans.scale = { x: scale, y: scale, z: scale }

      addShape(entity, 'box')
    }
  }

  //
  //
  //                   ########
  //              ####           #####
  //            #                      #
  //           #     ####                #
  //           #    #     #               #
  //           #     #     #              #
  //            #          #              #
  //               ##### #              #
  //
  //
  //

  static goldenSpiralShape(roomId: string, entitiesCount: number) {
    console.log('Shape goldenSpiral, Room ID:', roomId)
    const substring = createSubstringExtractor(roomId)

    // Golden ratio and initial parameters
    const phi = (1 + Math.sqrt(5)) / 2 // The golden ratio
    const baseRadius = 0.5 // Starting with a small base radius to control expansion
    const maxTurns = mapNumberToRange(parseInt(substring(3), 10), 2, 5) // Reduce turns to limit size
    const angleIncrement = (Math.PI * 2) / phi // Angle increment per entity to mimic golden ratio
    const verticalSpread = 12 // Total vertical space available
    const verticalIncrement = verticalSpread / entitiesCount // How much we move up each step
    const maxRadius = mapNumberToRange(parseInt(substring(2), 10), 1, 6) // Reduce turns to limit size

    let currentAngle = 0
    let currentRadius = baseRadius
    let currentPositionY = -6 // Start from the bottom of our allowed space

    const parent = CansyArtInstallation.getInstance()!.getEntity()

    for (const [entity] of engine.getEntitiesWith(CansyComponent)) {
      // Calculate position based on polar coordinates and current parameters
      const x = Math.cos(currentAngle) * currentRadius
      const z = Math.sin(currentAngle) * currentRadius

      // Update parameters for the next entity
      currentAngle += angleIncrement
      currentRadius = baseRadius + (maxRadius * (currentPositionY + 6)) / verticalSpread
      currentPositionY += verticalIncrement

      if (currentPositionY > 6) break // Ensure we don't exceed the height limit

      Transform.createOrReplace(entity, {
        parent: parent,
        position: { x, y: currentPositionY, z },
        scale: { x: 0.2, y: 0.2, z: 0.2 } // Adjust scale as needed
      })

      const locTrans = TransformComponent.getMutable(entity).localTransform
      locTrans.position = { x, y: currentPositionY, z }
      locTrans.scale = { x: 0.2, y: 0.2, z: 0.2 }

      addShape(entity, 'box')
    }
  }

  //
  //       .-'''-.
  //    .'        '.
  //   /            \
  //  ;              ;
  //  |              |
  //  ;              ;
  //   \            /
  //    '.        .'
  //      '-.  .-'
  //       _-''-_
  //     '        '
  //

  static lissajousCurveShape(roomId: string, entitiesCount: number) {
    console.log('Shape Lissajous Curve, Room ID:', roomId)
    const substring = createSubstringExtractor(roomId)

    const artInstallation = CansyArtInstallation.getInstance()!.getEntity()

    const parentScale = mapNumberToRange(parseInt(substring(2), 10), 0.01, 1)
    Transform.createOrReplace(artInstallation, {
      position: { x: 8, y: 20 - 8, z: 8 },
      scale: { x: parentScale, y: parentScale, z: parentScale }
    })

    // Extract variables from roomId to customize the curve
    const aFrequency = mapNumberToRange(parseInt(substring(2), 10), 1, 5) // Frequency for X axis
    const bFrequency = mapNumberToRange(parseInt(substring(3), 10), 1, 5) // Frequency for Z axis
    const aPhase = mapNumberToRange(parseInt(substring(4), 10), 0, Math.PI) // Phase shift for X
    const bPhase = mapNumberToRange(parseInt(substring(5), 10), 0, Math.PI) // Phase shift for Z
    const maxAmplitude = 6 // Max amplitude to fit within the cube

    const scale = mapNumberToRange(parseInt(substring(2), 10), 0.01, 0.5)

    let step = 0
    const stepSize = (2 * Math.PI) / entitiesCount // Complete a loop in 2π radians

    for (const [entity] of engine.getEntitiesWith(CansyComponent)) {
      const x = maxAmplitude * Math.sin(aFrequency * step + aPhase)
      const z = maxAmplitude * Math.sin(bFrequency * step + bPhase)
      // Y-axis can either remain constant, vary like a sine wave, or based on another pattern
      const y = maxAmplitude * Math.sin((aFrequency + bFrequency) * 0.5 * step) // Example variation

      // Transform.createOrReplace(entity, {
      //   parent: artInstallation.parent(),
      //   position: { x, y, z },
      //   scale: { x: scale, y: scale, z: scale } // Adjust scale as desired
      // })

      const locTrans = TransformComponent.getMutable(entity).localTransform
      locTrans.position = { x, y, z }
      locTrans.scale = { x: scale, y: scale, z: scale }

      addShape(entity, 'box')
      step += stepSize
    }
  }

  //
  //           __
  //          /\ \
  //         / /\ \
  //        / /__\_\
  //        \/_____/
  //

  static mobiusStripShape(roomId: string, entitiesCount: number) {
    console.log('Shape Möbius Strip, Room ID:', roomId)
    const substring = createSubstringExtractor(roomId)

    // Parameters influenced by roomId
    const stripWidth = mapNumberToRange(parseInt(substring(2), 10), 0.1, 12) // Width of the strip
    const twists = mapNumberToRange(parseInt(substring(3), 10), 1, 10) // Number of half-twists

    const radius = 3 // Fixed radius to ensure it fits within the 6m constraint from the center
    const stepSize = (2 * Math.PI) / entitiesCount // Complete a loop in 2π radians

    let index = 0 // External index to track the entity's order

    for (const [entity] of engine.getEntitiesWith(CansyComponent)) {
      // Assuming the transformation calculations are done here based on the index
      const t = index * stepSize // Adjust this based on your actual logic for position calculation
      const twistAngle = t * twists

      const x = Math.cos(t) * (radius + stripWidth * Math.cos(twistAngle / 2))
      const y = Math.sin(t) * (radius + stripWidth * Math.cos(twistAngle / 2))
      const z = stripWidth * Math.sin(twistAngle / 2)

      const entityScale = 0.3 // Adjust as necessary

      // Transform.createOrReplace(entity, {
      //   parent: artInstallation.parent(),
      //   position: { x, y, z },
      //   scale: { x: entityScale, y: entityScale, z: entityScale },
      //   rotation: Quaternion.fromEulerDegrees(0, 0, (twistAngle * 180) / Math.PI) // Apply rotation to simulate twist
      // })

      const locTrans = TransformComponent.getMutable(entity).localTransform
      locTrans.position = { x, y, z }
      locTrans.scale = { x: entityScale, y: entityScale, z: entityScale }
      locTrans.rotation = Quaternion.fromEulerDegrees(0, 0, (twistAngle * 180) / Math.PI) // Apply rotation to simulate twist

      addShape(entity, 'box')

      index++ // Increment index after each entity is processed
    }
  }

  //       .-""""""-.
  //    ,'            `.
  //   /     ,' `.      \
  //  :    /      \     :
  //  :    \      /     :
  //   \     `-.-'     /
  //    `.           ,'
  //      `-.____.-'
  //

  static torusKnotShape(roomId: string, entitiesCount: number) {
    console.log('Shape Torus Knot, Room ID:', roomId)
    const substring = createSubstringExtractor(roomId)

    // Parameters for the torus knot
    const p = mapNumberToRange(parseInt(substring(2), 10), 1, 50) // Wraps around the axis
    const q = mapNumberToRange(parseInt(substring(3), 10), 1, 50) // Wraps through the hole
    const radius = 3 // Radius of the torus itself
    const tubeRadius = mapNumberToRange(parseInt(substring(3), 10), 0.5, 5) // Radius of the tube

    let theta = 0
    const step = (2 * Math.PI) / entitiesCount

    for (const [entity] of engine.getEntitiesWith(CansyComponent)) {
      theta += step
      const phi = (p / q) * theta
      const r = radius + tubeRadius * Math.cos(q * theta)

      const x = r * Math.cos(p * theta)
      const y = r * Math.sin(p * theta)
      const z = tubeRadius * Math.sin(q * theta)

      // Transform.createOrReplace(entity, {
      //   parent: artInstallation.parent(),
      //   position: { x, y, z },
      //   scale: { x: 0.2, y: 0.2, z: 0.2 } // Adjust scale as needed
      // })

      const locTrans = TransformComponent.getMutable(entity).localTransform
      locTrans.position = { x, y, z }
      locTrans.scale = { x: 0.2, y: 0.2, z: 0.2 }

      addShape(entity, 'box')
    }
  }
}
