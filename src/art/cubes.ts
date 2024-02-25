import { Entity, Material, Transform, engine } from '@dcl/sdk/ecs'
import { Color4, Quaternion, Vector3 } from '@dcl/sdk/math'
import { addShape } from '../utils'
import { WiggleComponent, CansyComponent } from '../components'

interface ICubeOptions {
  shape: string[]
  size: number
  center: Vector3
  rotation?: Quaternion
  density: number
  shapeSize: number
  material: any
}

export function CubeSoft(options: ICubeOptions): Entity {
  const { shape, size, center, rotation = Quaternion.Zero(), density, shapeSize } = options
  const halfSize = size / 2
  const step = size / density

  const cubeCenter = engine.addEntity()
  Transform.create(cubeCenter, {
    position: center,
    rotation: rotation
  })

  for (let face = 0; face < 6; face++) {
    for (let row = 0; row < density; row++) {
      for (let col = 0; col < density; col++) {
        const positionOffset = calculatePositionOffset(face, row, col, step, halfSize)
        const shapeEntity = engine.addEntity()

        Transform.create(shapeEntity, {
          parent: cubeCenter,
          position: positionOffset,
          // Apply additional rotation if needed based on the face orientation
          rotation: calculateRotationForFace(face, rotation),
          scale: { x: shapeSize, y: shapeSize, z: shapeSize } // Apply shape size here
        })

        const nextShapeIndex = (face * density * density + row * density + col) % shape.length
        const nextShape = shape[nextShapeIndex]
        addShape(shapeEntity, nextShape)
      }
    }
  }

  function calculatePositionOffset(face: number, row: number, col: number, step: number, halfSize: number): Vector3 {
    let x = 0,
      y = 0,
      z = 0

    switch (face) {
      case 0: // Front face
        x = -halfSize + step * col + step / 2
        y = -halfSize + step * row + step / 2
        z = halfSize
        break
      case 1: // Back face
        x = -halfSize + step * col + step / 2
        y = -halfSize + step * row + step / 2
        z = -halfSize
        break
      case 2: // Right face
        x = halfSize
        y = -halfSize + step * row + step / 2
        z = -halfSize + step * col + step / 2
        break
      case 3: // Left face
        x = -halfSize
        y = -halfSize + step * row + step / 2
        z = -halfSize + step * col + step / 2
        break
      case 4: // Top face
        x = -halfSize + step * col + step / 2
        y = halfSize
        z = -halfSize + step * row + step / 2
        break
      case 5: // Bottom face
        x = -halfSize + step * col + step / 2
        y = -halfSize
        z = -halfSize + step * row + step / 2
        break
    }

    return Vector3.create(x, y, z)
  }

  function calculateRotationForFace(face: number, baseRotation: Quaternion): Quaternion {
    // This function returns the rotation for a shape based on the cube face and the cube's overall rotation
    // Adjust logic to match the orientation of each face
    return baseRotation // Placeholder: adjust to rotate shapes based on face orientation
  }

  return cubeCenter
}

export function CubeSharp(options: ICubeOptions): Entity {
  const { shape, size, center, rotation = Quaternion.Zero(), density, shapeSize, material } = options
  const cubeCenter = engine.addEntity()
  Transform.create(cubeCenter, {
    position: center,
    rotation: rotation
  })

  // Calculate the number of shapes per face based on the cube size and shape size
  const numShapesPerEdge = Math.floor(size / shapeSize)
  const actualStep = size / numShapesPerEdge // Adjusted step to fill the wall edge to edge

  for (let face = 0; face < 6; face++) {
    for (let row = 0; row < numShapesPerEdge; row++) {
      for (let col = 0; col < numShapesPerEdge; col++) {
        const positionOffset = calculatePositionOffset(face, row, col, actualStep, size / 2, shapeSize)
        const shapeEntity = engine.addEntity()

        Transform.create(shapeEntity, {
          parent: cubeCenter,
          position: positionOffset,
          rotation: calculateRotationForFace(face, rotation),
          scale: { x: shapeSize, y: shapeSize, z: shapeSize }
        })

        WiggleComponent.create(shapeEntity, {
          amplitude: 10,
          frequency: 10,
          phase: 10
        })

        CansyComponent.create(shapeEntity)

        Material.setPbrMaterial(shapeEntity, material)

        const nextShapeIndex =
          (face * numShapesPerEdge * numShapesPerEdge + row * numShapesPerEdge + col) % shape.length
        const nextShape = shape[nextShapeIndex]
        addShape(shapeEntity, nextShape)
      }
    }
  }

  function calculatePositionOffset(
    face: number,
    row: number,
    col: number,
    step: number,
    halfSize: number,
    shapeSize: number
  ): Vector3 {
    let x = 0,
      y = 0,
      z = 0
    const offset = step / 2 // Adjusted to use step for positioning

    // Adjustments for each face
    switch (face) {
      case 0: // Front face
        x = -halfSize + step * col + offset
        y = halfSize - step * row - offset
        z = halfSize
        break
      case 1: // Back face
        x = -halfSize + step * col + offset
        y = halfSize - step * row - offset
        z = -halfSize
        break
      case 2: // Right face
        x = halfSize
        y = halfSize - step * row - offset
        z = -halfSize + step * col + offset
        break
      case 3: // Left face
        x = -halfSize
        y = halfSize - step * row - offset
        z = halfSize - step * col - offset
        break
      case 4: // Top face
        x = -halfSize + step * col + offset
        y = halfSize
        z = -halfSize + step * row + offset
        break
      case 5: // Bottom face
        x = -halfSize + step * col + offset
        y = -halfSize
        z = halfSize - step * row - offset
        break
    }

    return Vector3.create(x, y, z)
  }

  function calculateRotationForFace(face: number, baseRotation: Quaternion): Quaternion {
    // This function would adjust the rotation for each shape based on the cube face orientation
    return baseRotation // Placeholder: adjust to rotate shapes based on face orientation
  }

  return cubeCenter
}
