import { Entity, Material, Schemas, engine } from '@dcl/sdk/ecs'
import { Color4 } from '@dcl/sdk/math'
import { CansyComponent } from './components'
import { createSubstringExtractor, extractAndMap, generateRandomString } from './miscUtils'

const ColorComponent = engine.defineComponent('colorGradient', {
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

class GlowingColor {
  constructor(public r: number, public g: number, public b: number) {}

  static interpolate(color1: GlowingColor, color2: GlowingColor, fraction: number): GlowingColor {
    return new GlowingColor(
      color1.r + (color2.r - color1.r) * fraction,
      color1.g + (color2.g - color1.g) * fraction,
      color1.b + (color2.b - color1.b) * fraction
    )
  }
}

export class ColorSystems {
  private static colorCycle = [
    new GlowingColor(2, 2, 4),
    new GlowingColor(4, 2, 2),
    new GlowingColor(2, 4, 2),
    new GlowingColor(4, 4, 2)
  ]
  private static cycleDuration = 5 // seconds

  static initColorComponent(entity: Entity): void {
    const defaultColor = Color4.create(4, 4, 4, 1)
    ColorComponent.create(entity, {
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
      cycleDuration: 5,
      deviationStrength: 1.0
    })
  }

  static initRandomColor(roomId: string, entitiesCount: number): string {
    console.log('Start random color system')
    const extractor = createSubstringExtractor(roomId)
    extractAndMap(extractor, 10, 0, 1) // Example use, adjust as necessary

    const r = extractAndMap(extractor, 3, 2, 4)
    const g = extractAndMap(extractor, 3, 2, 4)
    const b = extractAndMap(extractor, 3, 2, 4)

    for (const [entity] of engine.getEntitiesWith(CansyComponent)) {
      ColorComponent.getMutable(entity).colors.base = { r, g, b, a: 1 }
      Material.setPbrMaterial(entity, {
        albedoColor: { r, g, b, a: 1 },
        // emissiveColor: { r, g, b },
        // emissiveIntensity: 4,
        metallic: 0.8,
        roughness: 0.1
      })
    }

    const systemIdentifier = `system-${generateRandomString()}`
    engine.addSystem(ColorSystems.doNothing, 1, systemIdentifier)
    return systemIdentifier
  }

  private static doNothing(dt: number) {
    for (const [entity] of engine.getEntitiesWith(CansyComponent)) {
    }
  }

  private static colorRollingSystem(dt: number): void {
    let cycleTime = 0
    cycleTime += dt
    const cycleFraction = (cycleTime % ColorSystems.cycleDuration) / ColorSystems.cycleDuration
    const colorIndex = Math.floor(cycleFraction * ColorSystems.colorCycle.length)
    const nextColorIndex = (colorIndex + 1) % ColorSystems.colorCycle.length
    const colorFraction = (cycleFraction * ColorSystems.colorCycle.length) % 1
    const currentColor = ColorSystems.colorCycle[colorIndex]
    const nextColor = ColorSystems.colorCycle[nextColorIndex]
    const interpolatedColor = GlowingColor.interpolate(currentColor, nextColor, colorFraction)

    for (const [entity] of engine.getEntitiesWith(CansyComponent)) {
      const finalColor = {
        r: Math.max(2, Math.min(interpolatedColor.r, 4)),
        g: Math.max(2, Math.min(interpolatedColor.g, 4)),
        b: Math.max(2, Math.min(interpolatedColor.b, 4)),
        a: 1
      }
      Material.setPbrMaterial(entity, { albedoColor: finalColor, metallic: 0.8, roughness: 0.1 })
    }
  }
}
