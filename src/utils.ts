import { Entity, GltfContainer, Material, MeshRenderer, engine } from '@dcl/sdk/ecs'
import { Vector3 } from '@dcl/sdk/math'
import { CansyComponent } from './components'

export function getRandomHexColor(): string {
  const letters = '0123456789ABCDEF'
  let color = '#'
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)]
  }
  return color
}

// Calculate the position for an index along a line defined by startPosition and endPosition
export function calculatePositionAlongLine(
  startPosition: Vector3,
  endPosition: Vector3,
  index: number,
  totalLength: number
): Vector3 {
  // Manually calculate the difference for each component
  const differenceX = endPosition.x - startPosition.x
  const differenceY = endPosition.y - startPosition.y
  const differenceZ = endPosition.z - startPosition.z

  // Calculate the step for each component based on the total length
  const stepX = differenceX / Math.max(1, totalLength - 1)
  const stepY = differenceY / Math.max(1, totalLength - 1)
  const stepZ = differenceZ / Math.max(1, totalLength - 1)

  // Calculate the new position based on the index
  const positionX = startPosition.x + stepX * index
  const positionY = startPosition.y + stepY * index
  const positionZ = startPosition.z + stepZ * index

  // Return a new Vector3 with the calculated position
  return Vector3.create(positionX, positionY, positionZ)
}

export function addShape(entity: Entity, shape: string): void {
  switch (shape) {
    case 'box':
      MeshRenderer.setBox(entity)
      break

    case 'plane':
      MeshRenderer.setPlane(entity)
      break

    case 'sphere':
      MeshRenderer.setSphere(entity)
      break

    case 'cylinder':
      MeshRenderer.setCylinder(entity, 1, 1)
      break

    case 'cone':
      MeshRenderer.setCylinder(entity, 0, 1)
      break

    default:
      GltfContainer.create(entity, {
        src: shape
      })
      break
  }
}

export function changeMaterial(material: any) {
  for (const [entity] of engine.getEntitiesWith(CansyComponent)) {
    Material.setPbrMaterial(entity, material)
  }
}
