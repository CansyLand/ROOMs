import { Material, engine } from '@dcl/sdk/ecs'
import { CansyComponent } from './components'

export function changeMaterial(material: any) {
  for (const [entity] of engine.getEntitiesWith(CansyComponent)) {
    Material.setPbrMaterial(entity, material)
  }
}

export function getRandomHexColor(): string {
  const letters = '0123456789ABCDEF'
  let color = '#'
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)]
  }
  return color
}
