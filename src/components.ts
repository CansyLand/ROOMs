import { Schemas, engine } from '@dcl/sdk/ecs'
import { Quaternion, Vector3 } from '@dcl/sdk/math'

export const CansyComponent = engine.defineComponent('cansy-id', {})

export const C_TransformComponentDefaultValues = {
  localTransform: {
    position: Vector3.Zero(),
    rotation: Quaternion.Zero(),
    scale: Vector3.create(1, 1, 1)
  },
  globalTransform: {
    position: Vector3.Zero(),
    rotation: Quaternion.Zero(),
    scale: Vector3.create(1, 1, 1)
  },
  deviationTransform: {
    position: Vector3.Zero(),
    rotation: Quaternion.Zero(),
    scale: Vector3.Zero()
  }
}

export const C_TransformComponent = engine.defineComponent(
  'abstract-transform',
  {
    localTransform: Schemas.Map({
      position: Schemas.Vector3,
      rotation: Schemas.Quaternion,
      scale: Schemas.Vector3
    }),
    globalTransform: Schemas.Map({
      position: Schemas.Vector3,
      rotation: Schemas.Quaternion,
      scale: Schemas.Vector3
    }),
    deviationTransform: Schemas.Map({
      position: Schemas.Vector3,
      rotation: Schemas.Quaternion,
      scale: Schemas.Vector3
    })
  }
  // ,C_TransformComponentDefaultValues
)

export const C_ForceComponent = engine.defineComponent('force', {
  originalPosition: Schemas.Vector3,
  isMoved: Schemas.Boolean
})

// We use this component to track and group all spinning entities.
// engine.getEntitiesWith(Spinner)
export const Spinner = engine.defineComponent('spinner', { speed: Schemas.Number })

export const WiggleComponent = engine.defineComponent('wiggle', {
  amplitude: Schemas.Float, // Maximum rotation angle in radians
  frequency: Schemas.Float, // How fast the wiggle occurs
  phase: Schemas.Float // Phase offset for the start of the wiggle
})
