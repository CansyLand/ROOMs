import { AvatarModifierArea, AvatarModifierType, Entity, PBAvatarModifierArea, Transform, engine } from '@dcl/sdk/ecs'
import { Vector3 } from '@dcl/sdk/math'
import { MessageBus } from '@dcl/sdk/message-bus'
import { getPlayer } from '@dcl/sdk/src/players'

type SwitchRoom = {
  playerID: string
  oldRoomID: string
  newRoomID: string
}

export class PlayerManager {
  private sceneMessageBus: MessageBus = new MessageBus()
  private myPlayerID: string = ''
  private myRoomID: string = ''
  private roomConfigs: Map<string, string[]> = new Map() // stores players in room
  private avatarModifierArea: Entity | undefined

  constructor() {
    this.initPlayerID()
    this.initMessageBus()
  }

  private initMessageBus() {
    // This receives when player switch rooms
    this.sceneMessageBus.on('switchRoom', (config: SwitchRoom) => {
      this.movePlayerFromTo(config.playerID, config.oldRoomID, config.newRoomID)
    })

    // Emit your own position to others on init
    this.sceneMessageBus.emit('switchRoom', {
      playerID: this.myPlayerID,
      oldRoomID: '00000000000000000000000000000000',
      newRoomID: '00000000000000000000000000000000'
    })
  }

  private initPlayerID() {
    if (!this.myPlayerID) {
      const myPlayer = getPlayer()
      if (myPlayer) {
        this.myPlayerID = myPlayer.userId
      }
    }
  }

  private updatePlayerVisibilityInRoom() {
    // Create Entity
    if (!this.avatarModifierArea) {
      this.avatarModifierArea = engine.addEntity()
      Transform.create(this.avatarModifierArea, {
        position: Vector3.create(8, 10, 8)
      })
    }

    // Get list of players in same room
    const players = this.roomConfigs.get(this.myRoomID)
    if (!players) return

    AvatarModifierArea.createOrReplace(this.avatarModifierArea, {
      /** the 3D size of the region */
      area: Vector3.create(13, 5, 13),
      /** list of modifiers to apply */
      modifiers: [AvatarModifierType.AMT_HIDE_AVATARS],
      /** user IDs that can enter and remain unaffected */
      excludeIds: players //players,
    })
  }

  moveMyPlayerFromTo(oldRoom: string, newRoom: string) {
    this.initPlayerID()
    this.myRoomID = newRoom
    this.sceneMessageBus.emit('switchRoom', {
      playerID: this.myPlayerID,
      oldRoomID: oldRoom,
      newRoomID: newRoom
    })
  }

  private movePlayerFromTo(playerID: string, oldRoom: string, newRoom: string) {
    this.removePlayer(oldRoom, playerID)
    this.addPlayer(newRoom, playerID)

    this.updatePlayerVisibilityInRoom()
    // console.log('Move Player ', playerID, ' from: ', oldRoom, 'to ', newRoom)
  }

  private addPlayer(roomID: string, playerID: string) {
    // Check if the room already has a list of player IDs
    let players = this.roomConfigs.get(roomID)
    if (!players) {
      // If not, initialize it with an empty array
      players = []
      this.roomConfigs.set(roomID, players)
    }
    // Add the new player ID to the array if it's not already there
    if (!players.includes(playerID)) {
      players.push(playerID)
    }
  }

  private removePlayer(roomID: string, playerID: string) {
    const players = this.roomConfigs.get(roomID)
    if (players) {
      // Remove the playerID from the array
      const index = players.indexOf(playerID)
      if (index !== -1) {
        players.splice(index, 1)
      }
      // Remove the room if it now has no players or only contains an empty string
      if (players.length === 0 || (players.length === 1 && players[0] === '')) {
        this.roomConfigs.delete(roomID)
      }
    }
  }
}
