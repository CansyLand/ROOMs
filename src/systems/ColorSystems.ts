import { Entity, Material, Schemas, Transform, engine } from '@dcl/sdk/ecs'
import { createSubstringExtractor, extractAndMap, generateRandomString } from '../utils'
import { CansyComponent } from '../components'
import { Color4, Vector3 } from '@dcl/sdk/math'

const C_ColorComponent = engine.defineComponent('colorGradient', {
  colors: Schemas.Map({
    base: Schemas.Color4,
    deviation: Schemas.Color4,
    bottom: Schemas.Map({ color: Schemas.Color4, active: Schemas.Boolean }),
    top: Schemas.Map({ color: Schemas.Color4, active: Schemas.Boolean }),
    left: Schemas.Map({ color: Schemas.Color4, active: Schemas.Boolean }),
    right: Schemas.Map({ color: Schemas.Color4, active: Schemas.Boolean }),
    front: Schemas.Map({ color: Schemas.Color4, active: Schemas.Boolean }),
    back: Schemas.Map({ color: Schemas.Color4, active: Schemas.Boolean })
  }),
  bounds: Schemas.Map({
    maxX: Schemas.Number,
    minX: Schemas.Number,
    maxY: Schemas.Number,
    minY: Schemas.Number,
    maxZ: Schemas.Number,
    minZ: Schemas.Number
  }),
  cycleDuration: Schemas.Number, // Duration for color cycling or other time-based effects
  deviationStrength: Schemas.Number
})

export function C_initColorComponent(entity: Entity) {
  // Define common color and active status for reuse
  const defaultColor = Color4.create(4, 4, 4, 1)

  // Use the function to create color objects
  C_ColorComponent.create(entity, {
    colors: {
      base: defaultColor,
      deviation: defaultColor,
      bottom: { color: defaultColor, active: false },
      top: { color: defaultColor, active: false },
      left: { color: defaultColor, active: false },
      right: { color: defaultColor, active: false },
      front: { color: defaultColor, active: false },
      back: { color: defaultColor, active: false }
    },
    bounds: {
      maxX: 7,
      minX: -7,
      maxY: 7,
      minY: -7,
      maxZ: 7,
      minZ: -7
    },
    cycleDuration: 5, // Duration for color cycling
    deviationStrength: 1.0 // Strength of the deviation effect
  })
}

class GlowingColor {
  constructor(public r: number, public g: number, public b: number) {}

  static interpolate(color1: GlowingColor, color2: GlowingColor, fraction: number) {
    // Linearly interpolates between two colors
    return new GlowingColor(
      color1.r + (color2.r - color1.r) * fraction,
      color1.g + (color2.g - color1.g) * fraction,
      color1.b + (color2.b - color1.b) * fraction
    )
  }
}

// Define a cycle of glowing colors
const colorCycle = [
  new GlowingColor(2, 2, 4), // Glowing Blue
  new GlowingColor(4, 2, 2), // Glowing Red
  new GlowingColor(2, 4, 2), // Glowing Green
  new GlowingColor(4, 4, 2) // Glowing Yellow
  // Add more colors if desired
]

// 🔴 RANDOM COLOR ////////////////////////////////////////////////////////////

export function C_initRandomColor(roomId: string, entitiesCount: number): string {
  console.log('Start random color system')

  // Initial setup
  const extractor = createSubstringExtractor(roomId)
  extractAndMap(extractor, 10, 0, 1) // skip first 10 digits

  // Extract base rotation parameters
  const r = extractAndMap(extractor, 3, 2, 4)
  const g = extractAndMap(extractor, 3, 2, 4)
  const b = extractAndMap(extractor, 3, 2, 4)

  for (const [entity] of engine.getEntitiesWith(CansyComponent)) {
    C_ColorComponent.getMutable(entity).colors.base = { r: r, g: g, b: b, a: 1 }
    Material.setPbrMaterial(entity, {
      albedoColor: { r: r, g: g, b: b, a: 1 },
      metallic: 0.8,
      roughness: 0.1
    })
  }

  //const static = extractAndMap(extractor, 2, 0, 1)

  // Add system to the engine
  const systemIdentifier = `system-${generateRandomString()}`
  engine.addSystem(doNothing, 1, systemIdentifier)
  //engine.addSystem(C_colorRollingSystem, 1, systemIdentifier)

  return systemIdentifier
}

export function doNothing(dt: number) {
  // for (const [entity] of engine.getEntitiesWith(CansyComponent)) {
  // }
}

let cycleTime = 0
const cycleDuration = 5 // Duration in seconds to complete a full color cycle

function C_colorRollingSystem(dt: number) {
  cycleTime += dt
  const cycleFraction = (cycleTime % cycleDuration) / cycleDuration

  // Determine the current and next color index based on the cycle fraction
  const colorIndex = Math.floor(cycleFraction * colorCycle.length)
  const nextColorIndex = (colorIndex + 1) % colorCycle.length

  // Calculate the fraction between the current and next color
  const colorFraction = (cycleFraction * colorCycle.length) % 1

  // Interpolate between the current and next color
  const currentColor = colorCycle[colorIndex]
  const nextColor = colorCycle[nextColorIndex]
  const interpolatedColor = GlowingColor.interpolate(currentColor, nextColor, colorFraction)

  for (const [entity] of engine.getEntitiesWith(CansyComponent)) {
    // Ensure the color values are adjusted back into the glowing range if necessary
    // This adjustment ensures values are kept within the 2 to 4 range for glowing effects
    const finalColor = {
      r: Math.max(2, Math.min(interpolatedColor.r, 4)),
      g: Math.max(2, Math.min(interpolatedColor.g, 4)),
      b: Math.max(2, Math.min(interpolatedColor.b, 4)),
      a: 1
    }

    // Update the entity's color
    Material.setPbrMaterial(entity, {
      albedoColor: finalColor,
      metallic: 0.8,
      roughness: 0.1
    })
  }
}

// 🔴 GRADIENT ////////////////////////////////////////////////////////////

function extractColor(extractor: any, start: number, end: number) {
  return {
    r: extractAndMap(extractor, 3, start, end),
    g: extractAndMap(extractor, 3, start, end),
    b: extractAndMap(extractor, 3, start, end),
    a: 1 // Assuming alpha is always 1 for these colors
  }
}

function interpolateColors(color1: Color4, color2: Color4, fraction: number) {
  return {
    r: color1.r + (color2.r - color1.r) * fraction,
    g: color1.g + (color2.g - color1.g) * fraction,
    b: color1.b + (color2.b - color1.b) * fraction,
    a: 1 // Maintain alpha at 1
  }
}

// export function C_initColorGradient(roomId: string, entitiesCount: number): string {
//   console.log('Start color gradient system')

//   // Setup and color extraction
//   const extractor = createSubstringExtractor(roomId)
//   const colorOne = extractColor(extractor, 2, 4)
//   const colorTwo = extractColor(extractor, 2, 4)

//   // Direction indexes
//   const directionIndexOne = extractAndMap(extractor, 2, 1, 6)
//   const directionIndexTwo = extractAndMap(extractor, 2, 1, 6)

//   for (const [entity] of engine.getEntitiesWith(CansyComponent)) {
//     const positionY = Transform.get(entity).position.y
//     const normalizedHeight = (positionY + 7) / 14 // Simplified normalization

//     // Apply interpolated color based on entity height
//     const interpolatedColor = interpolateColors(colorTwo, colorOne, normalizedHeight)
//     updateDirectionColor(directionIndexOne, entity, colorOne)
//     updateDirectionColor(directionIndexTwo, entity, colorTwo)

//     // Update entity material
//     Material.setPbrMaterial(entity, {
//       albedoColor: interpolatedColor,
//       metallic: 0.8,
//       roughness: 0.1
//     })
//   }

//   // Register and return system identifier
//   const systemIdentifier = `system-${generateRandomString()}`
//   engine.addSystem(C_colorRollingSystem, 1, systemIdentifier)

//   return systemIdentifier
// }

// function updateDirectionColor(
//   index: number,
//   entity: Entity,
//   newColor: { r: number; g: number; b: number; a: number }
// ): void {
//   const colorComponent = C_ColorComponent.getMutable(entity)
//   const adjustedIndex = index - 1

//   switch (adjustedIndex) {
//     case 0:
//       colorComponent.colors.top = newColor
//       break
//     case 1:
//       colorComponent.colors.bottom = newColor
//       break
//     case 2:
//       colorComponent.colors.left = newColor
//       break
//     case 3:
//       colorComponent.colors.right = newColor
//       break
//     case 4:
//       colorComponent.colors.front = newColor
//       break
//     case 5:
//       colorComponent.colors.back = newColor
//       break
//     default:
//       console.error('Invalid direction index:', index)
//       // Handle the error case, perhaps setting a default or leaving the color unchanged
//       break
//   }
// }

// function C_updateGradientSystem(dt: number) {
//   for (const [entity] of engine.getEntitiesWith(CansyComponent)) {
//     const colorComp = C_ColorComponent.get(entity)
//     const transform = Transform.get(entity)
//     const { position } = transform

//     // Calculate normalized positions within bounds for each axis
//     const normalizedX = (position.x - colorComp.bounds.minX) / (colorComp.bounds.maxX - colorComp.bounds.minX)
//     const normalizedY = (position.y - colorComp.bounds.minY) / (colorComp.bounds.maxY - colorComp.bounds.minY)
//     const normalizedZ = (position.z - colorComp.bounds.minZ) / (colorComp.bounds.maxZ - colorComp.bounds.minZ)

//     // Interpolate color based on position; example for vertical gradient (top-bottom)
//     // Extend the logic similarly for left-right, front-back based on normalized positions
//     const interpolatedColor = interpolateColors(colorComp.colors.bottom, colorComp.colors.top, normalizedY)

//     // Apply the interpolated color
//     Material.setPbrMaterial(entity, {
//       albedoColor: interpolatedColor,
//       metallic: 0.8,
//       roughness: 0.1
//     })
//   }
// }

// COLOR SYSTEMS

// Color Palette !!!
// gradient based on height
// gradnient based on xyz + move in random direction at random speed
// snake style movement
// christmas tree
// black?
// change color over time
// change color on proximity
// brightness wobble
