import { engine, Transform, AvatarShape } from '@dcl/sdk/ecs'
import { Vector3, Color3 } from '@dcl/sdk/math'
import { getUserData } from '~system/UserIdentity'

async function createNPC() {
  let userData = await getUserData({})
  console.log(userData.data)

  if (!userData.data || !userData.data.avatar || !userData.data.avatar.wearables) return

  const myAvatar = engine.addEntity()

  AvatarShape.create(myAvatar, {
    id: 'Manequin',
    name: 'NPC-NAME',
    wearables: userData.data.avatar.wearables,
    emotes: [],
    expressionTriggerId: 'robot',
    skinColor: Color3.create(1, 0, 0),
    eyeColor: Color3.create(1, 0, 0),
    hairColor: Color3.create(1, 0, 0),
    talking: true
  })

  Transform.create(myAvatar, {
    position: Vector3.create(4, 0.25, 5)
  })
}

createNPC()
