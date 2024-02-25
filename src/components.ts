import { Schemas, engine } from '@dcl/sdk/ecs'

// We use this component to track and group all spinning entities.
// engine.getEntitiesWith(Spinner)
export const Spinner = engine.defineComponent('spinner', { speed: Schemas.Number })

// We use this component to track and group all the cubes.
// engine.getEntitiesWith(Cube)
export const CansyComponent = engine.defineComponent('cansy-id', {})

export const WiggleComponent = engine.defineComponent('wiggle', {
  amplitude: Schemas.Float, // Maximum rotation angle in radians
  frequency: Schemas.Float, // How fast the wiggle occurs
  phase: Schemas.Float // Phase offset for the start of the wiggle
})
