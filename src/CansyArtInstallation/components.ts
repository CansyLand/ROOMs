import { Schemas, engine } from '@dcl/sdk/ecs'
import { Quaternion, Vector3 } from '@dcl/sdk/math'

export const CansyComponent = engine.defineComponent('cansy-id', {})

export const Portal = engine.defineComponent('c-portal', {
  left: Schemas.Entity,
  right: Schemas.Entity,
  top: Schemas.Entity,
  isOpening: Schemas.Boolean,
  animationProgress: Schemas.Float,
  audioTrigger: Schemas.Boolean
})

export const TransformComponentDefaultValues = {
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

export const TransformComponent = engine.defineComponent(
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

export const ForceComponent = engine.defineComponent('force', {
  originalPosition: Schemas.Vector3,
  isMoved: Schemas.Boolean
})

// We use this component to track and group all spinning entities.
// engine.getEntitiesWith(Spinner)
export const Spinner = engine.defineComponent('spinner', { speed: Schemas.Number })

// export const WiggleComponent = engine.defineComponent('wiggle', {
//   amplitude: Schemas.Float, // Maximum rotation angle in radians
//   frequency: Schemas.Float, // How fast the wiggle occurs
//   phase: Schemas.Float // Phase offset for the start of the wiggle
// })

// 🟡🟡🟡 SWARM SYSTEMS 🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡

export const SwarmSystemComponent = engine.defineComponent('rotate', {
  degrees: Schemas.Float,
  direction: Schemas.Vector3,
  targetPosition: Schemas.Vector3,
  speed: Schemas.Float
})

export const FollowComponent = engine.defineComponent('follow', {
  nextEntityId: Schemas.Entity,
  speed: Schemas.Float,
  sinDirection: Schemas.Vector3, // Direction for sinusoidal deviation
  deviationIntensity: Schemas.Float // Scales the intensity of the deviation
})

export const WiggleComponent = engine.defineComponent('wiggle', {
  basePosition: Schemas.Vector3,
  amplitude: Schemas.Float,
  wavelength: Schemas.Float,
  speed: Schemas.Float,
  phaseOffset: Schemas.Float
})

export const RollingEffectComponent = engine.defineComponent('rollingEffect', {
  baseScale: Schemas.Vector3,
  scaleAmplitude: Schemas.Float,
  wavelength: Schemas.Float,
  speed: Schemas.Float,
  phaseOffset: Schemas.Float
})

export const OrbitalMotionComponent = engine.defineComponent('orbitalMotion', {
  orbitCenter: Schemas.Vector3, // The center point of the orbit, which will be the player's position
  orbitRadiusX: Schemas.Float, // Semi-major axis of the elliptical orbit
  orbitRadiusY: Schemas.Float, // Semi-minor axis of the elliptical orbit
  orbitRadiusZ: Schemas.Float,
  orbitSpeed: Schemas.Float, // Speed at which the entity orbits
  phaseOffset: Schemas.Float, // Phase offset to stagger the start point in the orbit
  tiltAngleX: Schemas.Float, // Tilt of the orbit around the X axis
  tiltAngleZ: Schemas.Float, // Tilt of the orbit around the Z axis
  direction: Schemas.Number, // Left or right orbit
  startPosition: Schemas.Vector3, // Initial position in the cube arrangement
  transitionProgress: Schemas.Float // Transition progress: 0 (start) to 1 (fully in orbit)
})
