import { engine, Transform, Material, MeshRenderer, Name } from '@dcl/sdk/ecs'
import { Color4, Vector3 } from '@dcl/sdk/math'

// Initial position and movement variables
let positionY = 1
let speed = 0.02
let direction = 1

// Sphere entity creation
const sphere = engine.addEntity()

// Assign a sphere shape
MeshRenderer.setSphere(sphere)

// Create a Transform component with initial position
Transform.create(sphere, {
  position: Vector3.create(5, positionY, 5),
  scale: Vector3.create(1, 1, 1) // Adjust scale as needed
})

// Assign red material to the sphere
Material.setPbrMaterial(sphere, {
  albedoColor: Color4.Red(),
  metallic: 0.5,
  roughness: 0.5
})

// Movement system
function moveSystem(dt: number) {
  for (const [entity] of engine.getEntitiesWith(Transform)) {
    const transform = Transform.getMutable(entity)
    // Check if entity is our sphere
    if (entity === sphere) {
      positionY += speed * direction
      transform.position.y = positionY
      // Reverse direction at the peak of the movement
      if (positionY > 2 || positionY < 1) {
        direction *= -1
      }
    }
  }
}

// Add the system to the engine
engine.addSystem(moveSystem)
