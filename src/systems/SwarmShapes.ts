import { Transform, engine } from '@dcl/sdk/ecs'
import { CansyComponent } from '../components'
import { addShape, createSubstringExtractor, getQuaternion, mapNumberToRange, rotateVector } from '../utils'
import { artInstallation } from '..'
import { Quaternion } from '@dcl/sdk/math'

// all entites have the same parent which is in the center of the scene
// all swarm shapes should arrange around the center point
// we have 180 entities to form swarm shapes

// a 6 sided cube
export function cubeShape(roomId: string, entitiesCount: number) {
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
    Transform.createOrReplace(entity, {
      parent: artInstallation.parent(),
      position: { x, y, z },
      scale: { x: entityScale, y: entityScale, z: entityScale }
    })

    addShape(entity, 'box')

    i++ // Move to the next entity
  }
}

export function sphereShape(roomId: string, entitiesCount: number) {
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

    if (CansyComponent.has(entity)) {
      Transform.createOrReplace(entity, {
        parent: artInstallation.parent(),
        position: { x: radius * x, y: radius * y, z: radius * z },
        scale: { x: entityScale, y: entityScale, z: entityScale }
      })
    }
    i++

    addShape(entity, 'box')
  }
}

export function planeShape(roomId: string, entitiesCount: number) {
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

    Transform.createOrReplace(entity, {
      parent: artInstallation.parent(),
      position: position,
      rotation: planeRotation,
      scale: { x: entityScale, y: entityScale, z: entityScale }
    })

    addShape(entity, 'box')
    i++
  }
}
