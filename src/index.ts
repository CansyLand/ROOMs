import { Quaternion, Vector3 } from '@dcl/sdk/math'
import { CansyArtInstallation } from './CansyArtInstallation/artInstallation'

const artInstallation = CansyArtInstallation.initInstance({
  entitiesCount: 170,
  transform: {
    position: Vector3.create(8, 0, 8),
    rotation: Quaternion.fromEulerDegrees(0, 0, 0)
  }
})

export function main() {}
