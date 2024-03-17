// 🔥🔥🔥🔥🔥🔥🔥🔥🔥
// Create class with RoomCoordinat
// paths to folders
// door hole
// show background only if you are in the cube
// only start systems when inside cube
// remove systems if outside cube
// package systems, cretors and so on in classes
// utils class
// room 1 no sound

//   SYSTEMS - combinable
// sinus - waves
//   position
//     constant
//     wiggle
//     follow next entity
//   rotation
//     constant
//     wiggle
//   size
//     constant
//     wiggle
//   color
//     rainbow smooth
//     rainbow click
// random position flicker

//   SWARM SHAPE
//     cube
//     sphere
//     room
//     random
//     matrix
//     wall
//     array
//     spiral
//     snake
//     linie
//      creative mathematic wonders

//    SHAPES
//     Cube
//     flat cubes
//     plane
//     line
//     line between entities
//     GLTF

// COLOR SYSTEMS

// Color Palette !!!
// gradient based on height
// gradnient based on xyz
// snake style movement
// christmas tree
// black?
// change color over time
// do nothing stay in color

//      WARABLE
//      EMOTE

// VOICES
// David Boles
// Neil - calm and deep
// George
// Lucifer
// Arnold - Courageous Valiant
// John Divine  //Christan coice
// Brian
// Theodore - Oldschool Cool
// Matthew - calm and peaceful
// Arnold - Courageous Valiant
// Carmen - calm, thoughtful

// 🔴 🔴 🔴 🔴 🔴 🔴 🔴 🔴 🔴 🔴 🔴 🔴 🔴 🔴 🔴

//
//  NO UI JUST TEXT SHAPES FOR TEXT
//
//

// sceneManager.addRoom([bigGlowShapes], [])
// sceneManager.addRoom([smallGlowShapes], [])

// MESH CUBE
// const cube = engine.addEntity()
// GltfContainer.create(cube, {
//   src: 'models/MESH CUBE 2024.glb'
// })
// Transform.create(cube, {
//   position: Vector3.create(9, 0, 7)
// })

// sceneManager.addRoom(
//   new RoomCoordinate(0, 0, 0),
//   [circularSystem], // Assuming system1, system2 are defined
//   [room0]
// )
// sceneManager.addRoom(
//   new RoomCoordinate(1, 0, 0),
//   [], // Assuming system1, system2 are defined
//   [room1]
// )
// sceneManager.addRoom(
//   new RoomCoordinate(2, 0, 0),
//   [circularSystem2], // Assuming system1, system2 are defined
//   [room2]
// )
// // engine.addSystem(circularSystem)
// // Initialize room 0,0,0
// sceneManager.loadScene(new RoomCoordinate(0, 0, 0))

// function room0() {
//   const entity = ArrayFromTo({
//     shape: ['box', 'sphere', 'cone'],
//     startPosition: Vector3.create(1, 0, 1),
//     endPosition: Vector3.create(15, 0, 15),
//     length: 10,
//     rotation: Quaternion.fromEulerDegrees(0, 45, 90)
//   })
//   return [entity]
// }

// function room1() {
//   const entity = ArrayFromTo({
//     shape: ['box'],
//     startPosition: Vector3.create(1, 0, 1),
//     endPosition: Vector3.create(13, 0, 1),
//     length: 5
//     //rotation: Quaternion.fromEulerDegrees(0, 45, 90)
//   })
//   return [entity]
// }

// function room2() {
//   const entity = ArrayFromTo({
//     shape: ['sphere'],
//     startPosition: Vector3.create(4, 0, 1),
//     endPosition: Vector3.create(2, 0, 14),
//     length: 20
//     //rotation: Quaternion.fromEulerDegrees(0, 45, 90)
//   })
//   return [entity]
// }

//   const sCube = CubeSharp({
//     shape: ['box', '', 'box'],
//     size: 5,
//     center: {
//       x: 8,
//       y: 20 - 8,
//       z: 8
//     },
//     density: 1,
//     shapeSize: 2,
//     material: {
//       albedoColor: Color4.Red(),
//       metallic: 0.8,
//       roughness: 0.1
//     }
//   })

//   changeMaterial({
//     albedoColor: Color4.Blue(),
//     metallic: 0.8,
//     roughness: 0.1
//   })

// engine.addSystem(wiggleSystem)
// engine.addSystem(changeMaterial)
