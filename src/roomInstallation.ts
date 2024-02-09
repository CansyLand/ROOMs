import { Entity, Transform, engine } from '@dcl/sdk/ecs'
import { Quaternion, Vector3 } from '@dcl/sdk/math'
import { addShape, calculatePositionAlongLine } from './utils'
import { IArrayOptions } from './types'
import { Spinner } from './components'

export function ArrayFromTo(options: IArrayOptions): Entity {
  const { shape, startPosition, endPosition, length, rotation } = options
  const array = engine.addEntity()
  Transform.create(array, {
    position: startPosition,
    rotation: rotation ? rotation : Quaternion.Zero()
  })

  for (let index = 0; index < length; index++) {
    const arrayChild = engine.addEntity()

    // Use the utility function to calculate position
    const position = calculatePositionAlongLine(startPosition, endPosition, index, length)

    Transform.create(arrayChild, {
      parent: array,
      position: position
    })

    Spinner.create(arrayChild, {
      speed: 20
    })

    // Loop through shape array, assigning shapes to each child entity
    const nextShapeIndex = index % shape.length
    const nextShape = shape[nextShapeIndex]
    // Add shape to the arrayChild based on nextShape
    addShape(arrayChild, nextShape) // Ensure you have this function defined or adjust accordingly
  }

  return array
}
