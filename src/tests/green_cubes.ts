import {
  engine,
  Transform,
  MeshRenderer,
  ColliderLayer,
  MeshCollider,
  Schemas,
  DeepReadonlyObject,
  Material
} from '@dcl/sdk/ecs'
import { Color3, Color4, Quaternion, Vector3 } from '@dcl/sdk/math'

// Define a custom component for controlling the rotation speed and direction
const RotateComponent = engine.defineComponent('RotateComponent', {
  speed: Schemas.Float,
  direction: Schemas.Vector3
})

// Player Entry System
function playerEntrySystem() {
  // This is a simplified way to detect player entry. In reality, you might need more robust player detection logic.
  if (Transform.has(engine.PlayerEntity)) {
    const playerPos = Transform.get(engine.PlayerEntity).position
    createRotatingCube(playerPos)
  }
}

// Function to create a new cube with a random color that rotates
function createRotatingCube(playerPos: DeepReadonlyObject<{ x: number; y: number; z: number }>) {
  const cube = engine.addEntity()
  Transform.create(cube, {
    position: Vector3.create(playerPos.x, 1, playerPos.z), // Adjust as necessary
    scale: Vector3.create(1, 1, 1) // Cube size
  })

  MeshRenderer.setBox(cube)
  RotateComponent.create(cube, {
    speed: Math.random() + 0.5, // Random speed between 0.5 and 1.5
    direction: Vector3.create(Math.random() > 0.5 ? 1 : -1, Math.random() > 0.5 ? 1 : -1, Math.random() > 0.5 ? 1 : -1) // Random rotation direction
  })

  // Random color
  Material.setPbrMaterial(cube, {
    albedoColor: Color4.Green(),
    metallic: 0.8,
    roughness: 0.1
  })
  MeshCollider.setBox(cube, ColliderLayer.CL_POINTER) // Set the cube's collider. Optional: Useful if interactions are needed

  console.log('New cube created!')
}

// Rotation System
function rotationSystem(dt: number) {
  for (const [entity, rotate] of engine.getEntitiesWith(RotateComponent)) {
    const transform = Transform.getMutable(entity)
    transform.rotation = Quaternion.multiply(
      transform.rotation,
      Quaternion.fromEulerDegrees(
        rotate.direction.x * rotate.speed * dt * 50, // Adjust rotation speed here
        rotate.direction.y * rotate.speed * dt * 50,
        rotate.direction.z * rotate.speed * dt * 50
      )
    )
  }
}

// Add the rotation system to the engine
engine.addSystem(rotationSystem)

// Player enters the scene
engine.addSystem(playerEntrySystem)
