// import { Color4 } from '@dcl/sdk/math'
// import { sceneManager } from '..'
// import { CubeSharp } from './cubes'
// import { createSubstringExtractor, mapNumberToRange } from '../utils'
// import { Entity } from '@dcl/sdk/ecs'

// export function bigGlowShapes(): Entity {
//   const id = sceneManager.getCurrentRoomId()
//   const substring = createSubstringExtractor(id)

//   const sizeValue = parseInt(substring(2))
//   const size = mapNumberToRange(sizeValue, 0.25, 14)

//   const shapeSizeValue = parseInt(substring(2))
//   const shapeSize = mapNumberToRange(shapeSizeValue, 0.25, 4)

//   //   const density = parseInt(id.substring(0, 2), 16)
//   const rValue = parseInt(substring(2))
//   const r = mapNumberToRange(rValue, 0, 10)
//   const gValue = parseInt(substring(2))
//   const g = mapNumberToRange(gValue, 0, 10)
//   const bValue = parseInt(substring(2))
//   const b = mapNumberToRange(bValue, 0, 10)

//   console.log(size, ' ', shapeSize, ' ', r, ' ', g, ' ', b, ' ')

//   return CubeSharp({
//     shape: ['box', '', 'box'],
//     size: size,
//     center: {
//       x: 8,
//       y: 20 - 8,
//       z: 8
//     },
//     density: 1, // unused
//     shapeSize: shapeSize,
//     material: {
//       albedoColor: Color4.create(r, g, b, 1),
//       metallic: 0.8,
//       roughness: 0.1
//     }
//   })
// }

// export function smallGlowShapes(): Entity {
//   const id = sceneManager.getCurrentRoomId()
//   const substring = createSubstringExtractor(id)

//   const sizeValue = parseInt(substring(2))
//   const size = mapNumberToRange(sizeValue, 10, 14)

//   const shapeSizeValue = parseInt(substring(2))
//   const shapeSize = mapNumberToRange(shapeSizeValue, 0.1, 0.5)

//   //   const density = parseInt(id.substring(0, 2), 16)
//   const rValue = parseInt(substring(2))
//   const r = mapNumberToRange(rValue, 0, 10)
//   const gValue = parseInt(substring(2))
//   const g = mapNumberToRange(gValue, 0, 10)
//   const bValue = parseInt(substring(2))
//   const b = mapNumberToRange(bValue, 0, 10)

//   console.log(size, ' ', shapeSize, ' ', r, ' ', g, ' ', b, ' ')

//   return CubeSharp({
//     shape: ['box', '', 'box'],
//     size: size,
//     center: {
//       x: 8,
//       y: 20 - 8,
//       z: 8
//     },
//     density: 1, // unused
//     shapeSize: shapeSize,
//     material: {
//       albedoColor: Color4.create(r, g, b, 1),
//       metallic: 0.8,
//       roughness: 0.1
//     }
//   })
// }
