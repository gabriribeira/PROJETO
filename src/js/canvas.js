import gsap from 'gsap'
import {
  createImage,
  createImageAsync,
  isOnTopOfPlatform,
  collisionTop,
  isOnTopOfPlatformCircle,
  hitBottomOfPlatform,
  hitSideOfPlatform,
  objectsTouch
} from './utils.js'

import mar from '../img/mar.png'
import platform from '../img/platform.png'
import casas from '../img/casas.png'
import background from '../img/ceu.png'
import dunas from '../img/dunas.png'

import platformSmallTall from '../img/platformSmallTall.png'
import block from '../img/block.png'
import blockTri from '../img/blockTri.png'
import boias from '../img/boias.png'
import flamengo from '../img/flamengo.png'
import guardaSolVermelho from '../img/guarda_sol_vermelho.png'
import guardaSolAmarelo from '../img/guarda_sol_amarelo.png'
import mdPlatform from '../img/mdPlatform.png'
import lgPlatform from '../img/lgPlatform.png'
import tPlatform from '../img/tPlatform.png'
import xtPlatform from '../img/xtPlatform.png'
import flagPoleSprite from '../img/farol_destruido.png'

import spriteMarioRunLeft from '../img/spriteRunLeft.png'
import spriteMarioRunRight from '../img/spriteRunRight.png'
import standRight from '../img/standRight.png'
import standLeft from '../img/standLeft.png'
import spriteJumpRight from '../img/spriteJumpRight.png'
import spriteJumpLeft from '../img/spriteJumpLeft.png'

import spriteFireFlowerRunRight from '../img/spriteFireFlowerRunRight.png'
import spriteFireFlowerRunLeft from '../img/spriteFireFlowerRunLeft.png'
import fireFlowerStandRight from '../img/fireFlowerStandRight.png'
import fireFlowerStandLeft from '../img/fireFlowerStandLeft.png'
import spriteFireFlowerJumpRight from '../img/spriteFireFlowerJumpRight.png'
import spriteFireFlowerJumpLeft from '../img/spriteFireFlowerJumpLeft.png'

import sal from '../img/sal.png'
import moeda from '../img/moeda.png'
import tijolo from '../img/tijolo.png'

import spriteGoomba from '../img/spriteGoomba.png'
import polvoInimigo from '../img/polvo.png'
import crabInimigo from '../img/crab.png'

import placaFarol from '../img/placa_farol.png'
import placaMar from '../img/placa_mar.png'
import placaMover from '../img/placa_mover.png'
import placaPower from '../img/placa_powerup.png'
import placaSaltar from '../img/placa_saltar.png'
import placaInimigo from '../img/placa_inimigos.png'
import placaTiros from '../img/placa_tiros.png'

import { audio } from './audio.js'
import { images } from './images.js'

const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

canvas.width = 1280
canvas.height = 720

let gravity = 1.5

class Player {
  constructor() {
    this.shooting = false
    this.speed = 10
    this.position = {
      x: 100,
      y: 100
    }
    this.velocity = {
      x: 0,
      y: 0
    }

    this.scale = 0.3
    this.width = 400 * this.scale
    this.height = 404 * this.scale

    this.image = createImage(standRight)
    this.frames = 0
    this.sprites = {
      stand: {
        right: createImage(standRight),
        left: createImage(standLeft),
        fireFlower: {
          right: createImage(fireFlowerStandRight),
          left: createImage(fireFlowerStandLeft)
        }
      },
      run: {
        right: createImage(spriteMarioRunRight),
        left: createImage(spriteMarioRunLeft),
        fireFlower: {
          right: createImage(spriteFireFlowerRunRight),
          left: createImage(spriteFireFlowerRunLeft)
        }
      },
      jump: {
        right: createImage(spriteJumpRight),
        left: createImage(spriteJumpLeft),
        fireFlower: {
          right: createImage(spriteFireFlowerJumpRight),
          left: createImage(spriteFireFlowerJumpLeft)
        }
      },
      shoot: {
        fireFlower: {
          right: createImage(images.mario.shoot.fireFlower.right),
          left: createImage(images.mario.shoot.fireFlower.left)
        }
      }
    }

    this.currentSprite = this.sprites.stand.right
    this.currentCropWidth = 401
    this.powerUps = {
      fireFlower: false
    }
    this.invincible = false
    this.opacity = 1
  }

  draw() {
    c.save()
    c.globalAlpha = this.opacity
    c.drawImage(
        this.currentSprite,
        this.currentCropWidth * this.frames,
        0,
        this.currentCropWidth,
        401,
        this.position.x,
        this.position.y,
        this.width,
        this.height
    )
    c.restore()
  }

  update() {
    this.frames++
    const { currentSprite, sprites } = this

    if (currentSprite === sprites.stand.right ||
            currentSprite === sprites.stand.left ||
            currentSprite === sprites.stand.fireFlower.left ||
            currentSprite === sprites.stand.fireFlower.right)
      this.frames = 0
    else if (
        this.frames > 28 &&
        (currentSprite === sprites.run.right ||
            currentSprite === sprites.run.left ||
            currentSprite === sprites.run.fireFlower.right ||
            currentSprite === sprites.run.fireFlower.left)
    )
      this.frames = 0
    else if (
        currentSprite === sprites.jump.right ||
        currentSprite === sprites.jump.left ||
        currentSprite === sprites.jump.fireFlower.right ||
        currentSprite === sprites.jump.fireFlower.left ||
        currentSprite === sprites.shoot.fireFlower.left ||
        currentSprite === sprites.shoot.fireFlower.right
    )
      this.frames = 0

    this.draw()
    this.position.x += this.velocity.x
    this.position.y += this.velocity.y

    if (this.position.y + this.height + this.velocity.y <= canvas.height)
      this.velocity.y += gravity

    if (this.invincible) {
      if (this.opacity === 1) this.opacity = 0
      else this.opacity = 1
    } else this.opacity = 1
  }
}

class Platform {
  constructor({ x, y, image, block, text }) {
    this.position = {
      x,
      y
    }

    this.velocity = {
      x: 0
    }

    this.image = image
    this.width = image.width
    this.height = image.height
    this.block = block
  }

  draw() {
    c.drawImage(this.image, this.position.x, this.position.y)
  }

  update() {
    this.draw()
    this.position.x += this.velocity.x
  }
}

class GenericObject {
  constructor({ x, y, image }) {
    this.position = {
      x,
      y
    }

    this.velocity = {
      x: 0
    }

    this.image = image
    this.width = image.width
    this.height = image.height
  }

  draw() {
    c.drawImage(this.image, this.position.x, this.position.y)
  }

  update() {
    this.draw()
    this.position.x += this.velocity.x
  }
}

class Mar {
  constructor({ x, y, image }) {
    this.position = {
      x,
      y
    }

    this.velocity = {
      x: 0
    }

    this.image = image
    this.width = image.width
    this.height = image.height
  }

  draw() {
    c.drawImage(this.image, this.position.x, this.position.y)
  }

  update() {
    this.draw()
    this.position.x += this.velocity.x
  }
}

class FrontObject {
  constructor({ x, y, image }) {
    this.position = {
      x,
      y
    }

    this.velocity = {
      x: 0
    }

    this.image = image
    this.width = image.width
    this.height = image.height
  }

  draw() {
    c.drawImage(this.image, this.position.x, this.position.y)
  }

  update() {
    this.draw()
    this.position.x += this.velocity.x
  }
}

class Polvo {
  constructor({
                position,
                velocity,
                distance = {
                  limit: 50,
                  traveled: 0
                }
              }) {
    this.position = {
      x: position.x,
      y: position.y
    }

    this.velocity = {
      x: velocity.x,
      y: velocity.y
    }

    this.width = 100
    this.height = 100

    this.image = createImage(polvoInimigo)
    this.frames = 0

    this.distance = distance
  }

  draw() {
    c.drawImage(this.image, this.position.x, this.position.y)
  }

  update() {
    this.draw()
    this.position.x += this.velocity.x
    this.position.y += this.velocity.y

    if (this.position.y + this.height + this.velocity.y <= canvas.height)
      this.velocity.y += gravity

    // walk the polvo back and forth
    this.distance.traveled += Math.abs(this.velocity.x)

    if (this.distance.traveled > this.distance.limit) {
      this.distance.traveled = 0
      this.velocity.x = -this.velocity.x
    }
  }
}

class Crab {
  constructor({
                position,
                velocity,
                distance = {
                  limit: 50,
                  traveled: 0
                }
              }) {
    this.position = {
      x: position.x,
      y: position.y
    }

    this.velocity = {
      x: velocity.x,
      y: velocity.y
    }

    this.width = 80
    this.height = 80

    this.image = createImage(crabInimigo)
    this.frames = 0

    this.distance = distance
  }

  draw() {
    c.drawImage(this.image, this.position.x, this.position.y)
  }

  update() {
    this.draw()
    this.position.x += this.velocity.x
    this.position.y += this.velocity.y

    if (this.position.y + this.height + this.velocity.y <= canvas.height)
      this.velocity.y += gravity

    // walk the crab back and forth
    this.distance.traveled += Math.abs(this.velocity.x)

    if (this.distance.traveled > this.distance.limit) {
      this.distance.traveled = 0
      this.velocity.x = -this.velocity.x
    }
  }
}

class FireFlower {
  constructor({ position, velocity }) {
    this.position = {
      x: position.x,
      y: position.y
    }

    this.velocity = {
      x: velocity.x,
      y: velocity.y
    }

    this.width = 52
    this.height = 47

    this.image = createImage(sal)
  }

  draw() {
    // c.fillStyle = 'red'
    // c.fillRect(this.position.x, this.position.y, this.width, this.height)

    c.drawImage(this.image, this.position.x, this.position.y)
  }

  update() {
    this.draw()
    this.position.x += this.velocity.x
    this.position.y += this.velocity.y

    if (this.position.y + this.height + this.velocity.y <= canvas.height)
      this.velocity.y += gravity
  }
}

class Collectable {
  constructor({ position, velocity, image }) {
    this.position = {
      x: position.x,
      y: position.y
    }

    this.velocity = {
      x: velocity.x,
      y: velocity.y
    }

    this.width = image.width
    this.height = image.height

    this.image = image
  }

  draw() {
    c.drawImage(this.image, this.position.x, this.position.y)
  }

  update() {
    this.draw()
    this.position.x += this.velocity.x
    this.position.y += this.velocity.y

    if (this.position.y + this.height + this.velocity.y <= canvas.height)
      this.velocity.y += gravity
  }
}

class Particle {
  constructor({
                position,
                velocity,
                radius,
                color = '#654428',
                fireball = false,
                fades = false
              }) {
    this.position = {
      x: position.x,
      y: position.y
    }

    this.velocity = {
      x: velocity.x,
      y: velocity.y
    }

    this.radius = radius
    this.ttl = 300
    this.color = color
    this.fireball = fireball
    this.opacity = 1
    this.fades = fades
  }

  draw() {
    c.save()
    c.globalAlpha = this.opacity
    c.beginPath()
    c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2, false)
    c.fillStyle = this.color
    c.fill()
    c.closePath()
    c.restore()
  }

  update() {
    this.ttl--
    this.draw()
    this.position.x += this.velocity.x
    this.position.y += this.velocity.y

    if (this.position.y + this.radius + this.velocity.y <= canvas.height)
      this.velocity.y += gravity * 0.4

    if (this.fades && this.opacity > 0) {
      this.opacity -= 0.01
    }

    if (this.opacity < 0) this.opacity = 0
  }
}

let platformImage
let platformSmallTallImage
let blockTriImage
let lgPlatformImage
let tPlatformImage
let xtPlatformImage
let blockImage
let guardaSolVermelhoImage
let guardaSolAmareloImage
let boiasImage
let flamingoImage

let player = new Player()
let platforms = []
let genericObjects = []
let frontObjects = []
let mares = []
let goombas = []
let polvos = []
let crabs = []
let particles = []
let fireFlowers = []

let lastKey
let keys

let scrollOffset
let flagPole
let flagPoleImage
let game

let currentLevel = 1




















function selectLevel(currentLevel) {
  if (!audio.musicLevel1.playing()) audio.musicLevel1.play()
  switch (currentLevel) {
    case 0:
      init0()
      break
    case 1:
      init()
      break
    case 2:
      initLevel2()
      break
  }
}

async function init0() {
  player = new Player()
  keys = {
    right: {
      pressed: false
    },
    left: {
      pressed: false
    }
  }
  scrollOffset = 0

  game = {
    disableUserInput: false
  }

  platformImage = await createImageAsync(platform)
  platformSmallTallImage = await createImageAsync(platformSmallTall)
  blockTriImage = await createImageAsync(blockTri)
  blockImage = await createImageAsync(block)
  lgPlatformImage = await createImageAsync(lgPlatform)
  tPlatformImage = await createImageAsync(tPlatform)
  xtPlatformImage = await createImageAsync(xtPlatform)
  flagPoleImage = await createImageAsync(flagPoleSprite)
  flamingoImage = await createImageAsync(flamengo)
  guardaSolAmareloImage = await createImageAsync(guardaSolAmarelo)
  guardaSolVermelhoImage = await createImageAsync(guardaSolVermelho)
  boiasImage = await createImageAsync(boias)

  fireFlowers = [
    new FireFlower({
      position: {
        x: 2670,
        y: 100
      },
      velocity: {
        x: 0,
        y: 0
      }
    })
  ]

  player = new Player()

  const polvoWidth = 100

  crabs = [
      new Crab({
        position: {
          x: 4840,
          y:100,
        },
        velocity: {
          x: 0,
          y:0,
        },
        distance: {
          limit: 0,
          traveled: 0
        }
      }),
  ]

  polvos = [
    new Polvo({
      position: {
        x:2100,
        y: 100
      },
      velocity: {
        x: -1,
        y:0
      },
      distance: {
        limit: 200,
        traveled: 0
      }
    }),
    new Polvo({
      position: {
        x:3400,
        y: 100
      },
      velocity: {
        x: -1,
        y:0
      },
      distance: {
        limit: 200,
        traveled: 0
      }
    }),
    new Polvo({
      position: {
        x:3400 + polvoWidth,
        y: 100
      },
      velocity: {
        x: -1,
        y:0
      },
      distance: {
        limit: 200,
        traveled: 0
      }
    }),
    new Polvo({
      position: {
        x:3400 + polvoWidth + polvoWidth,
        y: 100
      },
      velocity: {
        x: -1,
        y:0
      },
      distance: {
        limit: 200,
        traveled: 0
      }
    }),
    new Polvo({
      position: {
        x:3400 + polvoWidth + polvoWidth + polvoWidth,
        y: 100
      },
      velocity: {
        x: -1,
        y:0
      },
      distance: {
        limit: 200,
        traveled: 0
      }
    }),
    new Polvo({
      position: {
        x:3400 + polvoWidth + polvoWidth + polvoWidth + polvoWidth,
        y: 100
      },
      velocity: {
        x: -1,
        y:0
      },
      distance: {
        limit: 200,
        traveled: 0
      }
    }),
    new Polvo({
      position: {
        x:4850,
        y: 350
      },
      velocity: {
        x: 0,
        y:0
      },
      distance: {
        limit: 0,
        traveled: 0
      }
    })

  ]

  frontObjects = [
    new FrontObject({
      x: 400,
      y: 340,
      image: createImage(placaMover)
    }),
    new FrontObject({
      x: 1200,
      y: 340,
      image: createImage(placaSaltar)
    }),
    new FrontObject({
      x: 1700,
      y: 340,
      image: createImage(placaInimigo)
    }),
    new FrontObject({
      x: 2300,
      y: 340,
      image: createImage(placaPower)
    }),
    new FrontObject({
      x: 2900,
      y: 340,
      image: createImage(placaTiros)
    }),
    new FrontObject({
      x: 3800,
      y: 340,
      image: createImage(placaMar)
    }),
    new FrontObject({
      x: 5400,
      y: 340,
      image: createImage(placaFarol)
    }),
  ]

  particles = []
  platforms = [
    new Platform({
      x: 1500,
      y: 370,
      image: blockTriImage,
      block: true
    }),
    new Platform({
      x: 1580,
      y: 275,
      image: blockImage,
      block: true
    }),
    new Platform({
      x: 2600,
      y: 330,
      image: guardaSolAmareloImage,
      block: true
    }),
    new Platform({
      x: 4000,
      y: 350,
      image: boiasImage,
      block: true
    }),
    new Platform({
      x: 4400,
      y: 375,
      image: blockTriImage,
      block: true
    }),
    new Platform({
      x: 4700,
      y: 225,
      image: blockImage,
      block: true
    }),
    new Platform({
      x: 4850,
      y: 425,
      image: blockImage,
      block: true
    }),
    new Platform({
      x: 5000,
      y: 325,
      image: blockImage,
      block: true
    }),
    new Platform({
      x: 5350,
      y: 225,
      image: blockImage,
      block: true
    }),
  ]

  flagPole = new GenericObject({
    x: 5600,
    // x: 500,
    y: canvas.height - lgPlatformImage.height -  flagPoleImage.height - 100,
    image: flagPoleImage
  })

  genericObjects = [

    new GenericObject({
      x: -1,
      y: -1,
      image: createImage(background)
    }),

    new GenericObject({
      x: 3100,
      y: 200,
      image: createImage(casas)
    }),

  ]

  mares= [
    new Mar({
      x: -1,
      y: 560,
      image: createImage(mar)
    }),
  ]


  scrollOffset = 0

  const platformsMap = [
    'lg',
    'lg',
    'lg',
    'lg',
    'lg',
    'gap',
    'gap',
    'gap',
    'gap',
    'gap',
    'lg',
    'lg',
  ]

  let platformDistance = 0

  platformsMap.forEach((symbol) => {
    switch (symbol) {

      case 'lg':
        platforms.push(
            new Platform({
              x: platformDistance,
              y: canvas.height - lgPlatformImage.height - 100,
              image: lgPlatformImage,
              block: true,
              text: platformDistance
            })
        )

        platformDistance += lgPlatformImage.width - 2

        break

      case 'gap':
        platformDistance += 175

        break

      case 't':
        platforms.push(
            new Platform({
              x: platformDistance,
              y: canvas.height - tPlatformImage.height,
              image: tPlatformImage,
              block: true
            })
        )

        platformDistance += tPlatformImage.width - 2

        break

      case 'xt':
        platforms.push(
            new Platform({
              x: platformDistance,
              y: canvas.height - xtPlatformImage.height,
              image: xtPlatformImage,
              block: true,
              text: platformDistance
            })
        )

        platformDistance += xtPlatformImage.width - 2

        break
    }


  })
}









































async function init() {
  player = new Player()
  keys = {
    right: {
      pressed: false
    },
    left: {
      pressed: false
    }
  }
  scrollOffset = 0

  game = {
    disableUserInput: false
  }

  platformImage = await createImageAsync(platform)
  platformSmallTallImage = await createImageAsync(platformSmallTall)
  blockTriImage = await createImageAsync(blockTri)
  blockImage = await createImageAsync(block)
  lgPlatformImage = await createImageAsync(lgPlatform)
  tPlatformImage = await createImageAsync(tPlatform)
  xtPlatformImage = await createImageAsync(xtPlatform)
  flagPoleImage = await createImageAsync(flagPoleSprite)
  flamingoImage = await createImageAsync(flamengo)
  guardaSolAmareloImage = await createImageAsync(guardaSolAmarelo)
  guardaSolVermelhoImage = await createImageAsync(guardaSolVermelho)
  boiasImage = await createImageAsync(boias)

  fireFlowers = [
    new FireFlower({
      position: {
        x: 1991 + lgPlatformImage.width - tPlatformImage.width + 100,
        y: 100
      },
      velocity: {
        x: 0,
        y: 0
      }
    })
  ]

  player = new Player()

  const polvoWidth = 100
  polvos = [
      new Polvo({
        position: {
          x:500 + lgPlatformImage.width - polvoWidth,
          y: 100
        },
        velocity: {
          x: -1,
          y:0
        },
        distance: {
          limit: 200,
          traveled: 0
        }
      }),
    new Polvo({
      position: {
        x:3600,
        y: 100
      },
      velocity: {
        x: -0.8,
        y:0
      },
      distance: {
        limit: 150,
        traveled: 0
      }
    }),
    new Polvo({
      position: {
        x:3700,
        y: 100
      },
      velocity: {
        x: -0.8,
        y:0
      },
      distance: {
        limit: 150,
        traveled: 0
      }
    }),
    new Polvo({
      position: {
        x:3800,
        y: 100
      },
      velocity: {
        x: -0.8,
        y:0
      },
      distance: {
        limit: 150,
        traveled: 0
      }
    }),
    new Polvo({
      position: {
        x:3900,
        y: 100
      },
      velocity: {
        x: -0.8,
        y:0
      },
      distance: {
        limit: 150,
        traveled: 0
      }
    }),
    new Polvo({
      position: {
        x:4000,
        y: 100
      },
      velocity: {
        x: -0.8,
        y:0
      },
      distance: {
        limit: 150,
        traveled: 0
      }
    }),
    new Polvo({
      position: {
        x:6000,
        y: 100
      },
      velocity: {
        x: -0.8,
        y:0
      },
      distance: {
        limit: 150,
        traveled: 0
      }
    }),
  ]

  crabs = [
    new Crab({
      position: {
        x:900,
        y: 100
      },
      velocity: {
        x: -0.5,
        y:0
      },
      distance: {
        limit: 100,
        traveled: 0
      }
    }),
    new Crab({
      position: {
        x: 1991 + lgPlatformImage.width - tPlatformImage.width + 100,
        y: 400
      },
      velocity: {
        x: -0.8,
        y:0
      },
      distance: {
        limit: 150,
        traveled: 0
      }
    }),
    new Crab({
      position: {
        x:5050,
        y: 100
      },
      velocity: {
        x: -0.8,
        y:0
      },
      distance: {
        limit: 150,
        traveled: 0
      }
    })
  ]

  particles = []
  platforms = [
    new Platform({
      x: 908 + 100,
      y: 300,
      image: blockTriImage,
      block: true
    }),
    new Platform({
      x: 1991 + lgPlatformImage.width - tPlatformImage.width,
      y: canvas.height - lgPlatformImage.height - tPlatformImage.height - 250,
      image: tPlatformImage,
      block: false
    }),
    new Platform({
      x: 1991 + lgPlatformImage.width - tPlatformImage.width - 100,
      y:
          canvas.height -
          lgPlatformImage.height -
          tPlatformImage.height - 75,
      image: blockImage,
      block: true
    }),
    new Platform({
      x: 1991 + lgPlatformImage.width - tPlatformImage.width + 300,
      y:
          canvas.height -
          lgPlatformImage.height -
          tPlatformImage.height + 50,
      image: blockImage,
      block: true
    }),
    new Platform({
      x: 5712 + xtPlatformImage.width + 500,
      y: canvas.height - xtPlatformImage.height,
      image: blockImage,
      block: true,
    }),
    new Platform({
      x: 6116 + 175 + 500,
      y: canvas.height - xtPlatformImage.height,
      image: blockImage,
      block: true
    }),
    new Platform({
      x: 6116 + 175 * 2 + 300,
      y: canvas.height - xtPlatformImage.height - 200,
      image: blockImage,
      block: true
    }),
    new Platform({
      x: 6116 + 175 * 3,
      y: canvas.height - xtPlatformImage.height - 100,
      image: blockImage,
      block: true
    }),
    new Platform({
      x: 7200,
      y: 500,
      image: blockImage,
      block: true
    }),
    new Platform({
      x: 8000 + 300,
      y: canvas.height - lgPlatformImage.height - 100,
      image: lgPlatformImage,
      block: true,
    }),
    new Platform({
      x: 8000 + 300,
      y: canvas.height - lgPlatformImage.height - 100,
      image: lgPlatformImage,
      block: true,
    }),

  ]

  flagPole = new GenericObject({
    x: 10000 + 600,
    y: canvas.height - lgPlatformImage.height -  flagPoleImage.height - 100,
    image: flagPoleImage
  })


  genericObjects = [
    new GenericObject({
      x: -1,
      y: -1,
      image: createImage(background)
    }),
    new GenericObject({
      x: -1,
      y: 100,
      image: createImage(casas)
    }),
    new GenericObject({
      x: 3400,
      y: 330,
      image: createImage(dunas)
    }),
  ]

  mares= [
    new Mar({
      x: 0,
      y: 560,
      image: createImage(mar)
    }),
  ]


  scrollOffset = 0

  const platformsMap = [
    'lg',
    'lg',
    'gap',
    'lg',
    'gap',
    'gap',
    'gap',
    'lg',
    'gap',
    't',
    'gap',
    'xt',
    'gap',
    'xt',
    'gap',
    'gap',
    'xt',
    'gap',
    'gap',
    'gap',
    'gap',
    'gap',
    'gap',
    'gap',
    'gap',
    'gap',
    'lg'
  ]

  let platformDistance = 0

  platformsMap.forEach((symbol) => {
    switch (symbol) {

      case 'lg':
        platforms.push(
            new Platform({
              x: platformDistance,
              y: canvas.height - lgPlatformImage.height - 100,
              image: lgPlatformImage,
              block: true,
              text: platformDistance
            })
        )

        platformDistance += lgPlatformImage.width - 2

        break

      case 'gap':
        platformDistance += 175

        break

      case 't':
        platforms.push(
            new Platform({
              x: platformDistance,
              y: canvas.height - tPlatformImage.height,
              image: tPlatformImage,
              block: true
            })
        )

        platformDistance += tPlatformImage.width - 2

        break

      case 'xt':
        platforms.push(
            new Platform({
              x: platformDistance,
              y: canvas.height - xtPlatformImage.height,
              image: xtPlatformImage,
              block: true,
              text: platformDistance
            })
        )

        platformDistance += xtPlatformImage.width - 2

        break
    }


  })
}









































async function initLevel2() {
  player = new Player()
  keys = {
    right: {
      pressed: false
    },
    left: {
      pressed: false
    }
  }
  scrollOffset = 0

  game = {
    disableUserInput: false
  }

  blockTriImage = await createImageAsync(blockTri)
  blockImage = await createImageAsync(block)
  lgPlatformImage = await createImageAsync(images.levels[2].lgPlatform)
  tPlatformImage = await createImageAsync(tPlatform)
  xtPlatformImage = await createImageAsync(xtPlatform)
  flagPoleImage = await createImageAsync(flagPoleSprite)
  const mountains = await createImageAsync(images.levels[2].mountains)
  const mdPlatformImage = await createImageAsync(images.levels[2].mdPlatform)

  flagPole = new GenericObject({
    x: 7680,
    // x: 500,
    y: canvas.height - lgPlatformImage.height - flagPoleImage.height,
    image: flagPoleImage
  })

  fireFlowers = [
    new FireFlower({
      position: {
        x: 4734 - 28,
        y: 100
      },
      velocity: {
        x: 0,
        y: 0
      }
    })
  ]

  player = new Player()

  particles = []
  platforms = [
    new Platform({
      x: 903 + mdPlatformImage.width + 115,
      y: 300,
      image: blockTriImage,
      block: true
    }),
    new Platform({
      x: 903 + mdPlatformImage.width + 115 + blockTriImage.width,
      y: 300,
      image: blockTriImage,
      block: true
    }),
    new Platform({
      x: 1878 + lgPlatformImage.width + 175,
      y: 360,
      image: blockImage,
      block: true
    }),
    new Platform({
      x: 1878 + lgPlatformImage.width + 155 + 200,
      y: 300,
      image: blockImage,
      block: true
    }),
    new Platform({
      x: 1878 + lgPlatformImage.width + 155 + 200 + 200,
      y: 330,
      image: blockImage,
      block: true
    }),
    new Platform({
      x: 1878 + lgPlatformImage.width + 155 + 200 + 200 + 200,
      y: 240,
      image: blockImage,
      block: true
    }),
    new Platform({
      x: 4734 - mdPlatformImage.width / 2,
      y: canvas.height - lgPlatformImage.height - mdPlatformImage.height,
      image: mdPlatformImage
    }),
    new Platform({
      x: 5987,
      y: canvas.height - lgPlatformImage.height - mdPlatformImage.height,
      image: mdPlatformImage
    }),
    new Platform({
      x: 5987,
      y: canvas.height - lgPlatformImage.height - mdPlatformImage.height * 2,
      image: mdPlatformImage
    }),
    new Platform({
      x: 6787,
      y: canvas.height - lgPlatformImage.height - mdPlatformImage.height,
      image: mdPlatformImage
    }),
    new Platform({
      x: 6787,
      y: canvas.height - lgPlatformImage.height - mdPlatformImage.height * 2,
      image: mdPlatformImage
    }),
    new Platform({
      x: 6787,
      y: canvas.height - lgPlatformImage.height - mdPlatformImage.height * 3,
      image: mdPlatformImage
    })
  ]
  genericObjects = [
    new GenericObject({
      x: -1,
      y: -1,
      image: createImage(images.levels[2].background)
    }),
    new GenericObject({
      x: -1,
      y: canvas.height - mountains.height,
      image: mountains
    })
  ]

  scrollOffset = 0

  const platformsMap = [
    'lg',
    'md',
    'gap',
    'gap',
    'gap',
    'lg',
    'gap',
    'gap',
    'gap',
    'gap',
    'gap',
    'gap',
    'lg',
    'lg',
    'gap',
    'gap',
    'md',
    'gap',
    'gap',
    'md',
    'gap',
    'gap',
    'lg'
  ]

  let platformDistance = 0

  platformsMap.forEach((symbol) => {
    switch (symbol) {
      case 'md':
        platforms.push(
            new Platform({
              x: platformDistance,
              y: canvas.height - mdPlatformImage.height,
              image: mdPlatformImage,
              block: true,
              text: platformDistance
            })
        )

        platformDistance += mdPlatformImage.width - 3

        break
      case 'lg':
        platforms.push(
            new Platform({
              x: platformDistance - 2,
              y: canvas.height - lgPlatformImage.height,
              image: lgPlatformImage,
              block: true,
              text: platformDistance
            })
        )

        platformDistance += lgPlatformImage.width - 3

        break

      case 'gap':
        platformDistance += 175

        break

      case 't':
        platforms.push(
            new Platform({
              x: platformDistance,
              y: canvas.height - tPlatformImage.height,
              image: tPlatformImage,
              block: true
            })
        )

        platformDistance += tPlatformImage.width - 2

        break

      case 'xt':
        platforms.push(
            new Platform({
              x: platformDistance,
              y: canvas.height - xtPlatformImage.height,
              image: xtPlatformImage,
              block: true,
              text: platformDistance
            })
        )

        platformDistance += xtPlatformImage.width - 2

        break
    }
  })
}

function animate() {
  requestAnimationFrame(animate)
  c.fillStyle = 'white'
  c.fillRect(0, 0, canvas.width, canvas.height)

  genericObjects.forEach((genericObject) => {
    genericObject.update()
    genericObject.velocity.x = 0
  })

  frontObjects.forEach((frontObject) => {
    frontObject.update()
    frontObject.velocity.x = 0
  })

  particles.forEach((particle, i) => {
    particle.update()

    if (
        particle.fireball &&
        (particle.position.x - particle.radius >= canvas.width ||
            particle.position.x + particle.radius <= 0)
    )
      setTimeout(() => {
        particles.splice(i, 1)
      }, 0)
  })

  platforms.forEach((platform) => {
    platform.update()
    platform.velocity.x = 0
  })

  mares.forEach((Mar) => {
    Mar.update()
    Mar.velocity.x = 0
  })

  if (flagPole) {
    flagPole.update()
    flagPole.velocity.x = 0

    // mario touches flagpole
    // win condition
    // complete level
    if (
        !game.disableUserInput &&
        objectsTouch({
          object1: player,
          object2: flagPole
        })
    ) {
      audio.completeLevel.play()
      audio.musicLevel1.stop()
      game.disableUserInput = true
      player.velocity.x = 0
      player.velocity.y = 0
      gravity = 0

      player.currentSprite = player.sprites.stand.right

      if (player.powerUps.fireFlower)
        player.currentSprite = player.sprites.stand.fireFlower.right

      // flagpole slide
      setTimeout(() => {
        audio.descend.play()
      }, 200)
      gsap.to(player.position, {
        y: canvas.height - lgPlatformImage.height - player.height - 100,
        duration: 1,
        onComplete() {
          player.currentSprite = player.sprites.run.right

          if (player.powerUps.fireFlower)
            player.currentSprite = player.sprites.run.fireFlower.right
        }
      })

      gsap.to(player.position, {
        delay: 1,
        x: canvas.width,
        duration: 2,
        ease: 'power1.in'
      })

      // fireworks
      const particleCount = 300
      const radians = (Math.PI * 2) / particleCount
      const power = 8
      let increment = 1

      const intervalId = setInterval(() => {
        for (let i = 0; i < particleCount; i++) {
          particles.push(
              new Particle({
                position: {
                  x: (canvas.width / 4) * increment,
                  y: canvas.height / 2
                },
                velocity: {
                  x: Math.cos(radians * i) * power * Math.random(),
                  y: Math.sin(radians * i) * power * Math.random()
                },
                radius: 3 * Math.random(),
                color: `hsl(${Math.random() * 200}, 50%, 50%)`,
                fades: true
              })
          )
        }

        audio.fireworkBurst.play()
        audio.fireworkWhistle.play()

        if (increment === 3) clearInterval(intervalId)

        increment++
      }, 1000)

      // switch to the next level
      setTimeout(() => {
        currentLevel++
        gravity = 1.5
        selectLevel(currentLevel)
      }, 8000)
    }
  }

  // mario obtains powerup
  fireFlowers.forEach((fireFlower, i) => {
    if (
        objectsTouch({
          object1: player,
          object2: fireFlower
        })
    ) {
      audio.obtainPowerUp.play()
      player.powerUps.fireFlower = true
      setTimeout(() => {
        fireFlowers.splice(i, 1)
      }, 0)
    } else fireFlower.update()
  })

  goombas.forEach((goomba, index) => {
    goomba.update()

    // remove goomba on fireball hit
    particles.forEach((particle, particleIndex) => {
      if (
          particle.fireball &&
          particle.position.x + particle.radius >= goomba.position.x &&
          particle.position.y + particle.radius >= goomba.position.y &&
          particle.position.x - particle.radius <=
          goomba.position.x + goomba.width &&
          particle.position.y - particle.radius <=
          goomba.position.y + goomba.height
      ) {
        for (let i = 0; i < 50; i++) {
          particles.push(
              new Particle({
                position: {
                  x: goomba.position.x + goomba.width / 2,
                  y: goomba.position.y + goomba.height / 2
                },
                velocity: {
                  x: (Math.random() - 0.5) * 7,
                  y: (Math.random() - 0.5) * 15
                },
                radius: Math.random() * 3
              })
          )
        }
        setTimeout(() => {
          goombas.splice(index, 1)
          particles.splice(particleIndex, 1)
        }, 0)
      }
    })

    // goomba stomp squish / squash
    if (
        collisionTop({
          object1: player,
          object2: goomba
        })
    ) {
      audio.goombaSquash.play()

      for (let i = 0; i < 50; i++) {
        particles.push(
            new Particle({
              position: {
                x: goomba.position.x + goomba.width / 2,
                y: goomba.position.y + goomba.height / 2
              },
              velocity: {
                x: (Math.random() - 0.5) * 7,
                y: (Math.random() - 0.5) * 15
              },
              radius: Math.random() * 3
            })
        )
      }
      player.velocity.y -= 40
      setTimeout(() => {
        goombas.splice(index, 1)
      }, 0)
    } else if (
        player.position.x + player.width >= goomba.position.x &&
        player.position.y + player.height >= goomba.position.y &&
        player.position.x <= goomba.position.x + goomba.width
    ) {
      // player hits goomba
      // lose fireflower / lose powerup
      if (player.powerUps.fireFlower) {
        player.invincible = true
        player.powerUps.fireFlower = false
        audio.losePowerUp.play()

        setTimeout(() => {
          player.invincible = false
        }, 1000)
      } else if (!player.invincible) {
        audio.die.play()
        selectLevel(currentLevel)
      }
    }
  })

  crabs.forEach((crab, index) => {
    crab.update()

    // remove crab on fireball hit
    particles.forEach((particle, particleIndex) => {
      if (
          particle.fireball &&
          particle.position.x + particle.radius >= crab.position.x &&
          particle.position.y + particle.radius >= crab.position.y &&
          particle.position.x - particle.radius <=
          crab.position.x + crab.width &&
          particle.position.y - particle.radius <=
          crab.position.y + crab.height
      ) {
        for (let i = 0; i < 50; i++) {
          particles.push(
              new Particle({
                position: {
                  x: crab.position.x + crab.width / 2,
                  y: crab.position.y + crab.height / 2
                },
                velocity: {
                  x: (Math.random() - 0.5) * 7,
                  y: (Math.random() - 0.5) * 15
                },
                radius: Math.random() * 3
              })
          )
        }
        setTimeout(() => {
          crabs.splice(index, 1)
          particles.splice(particleIndex, 1)
        }, 0)
      }
    })

    // crab stomp squish / squash
    if (
        collisionTop({
          object1: player,
          object2: crab
        })
    ) {
      audio.goombaSquash.play()

      for (let i = 0; i < 50; i++) {
        particles.push(
            new Particle({
              position: {
                x: crab.position.x + crab.width / 2,
                y: crab.position.y + crab.height / 2
              },
              velocity: {
                x: (Math.random() - 0.5) * 7,
                y: (Math.random() - 0.5) * 15
              },
              radius: Math.random() * 3
            })
        )
      }
      player.velocity.y -= 40
      setTimeout(() => {
        crabs.splice(index, 1)
      }, 0)
    } else if (
        player.position.x + player.width >= crab.position.x &&
        player.position.y + player.height >= crab.position.y &&
        player.position.x <= crab.position.x + crab.width
    ) {
      // player hits crab
      // lose fireflower / lose powerup
      if (player.powerUps.fireFlower) {
        player.invincible = true
        player.powerUps.fireFlower = false
        audio.losePowerUp.play()

        setTimeout(() => {
          player.invincible = false
        }, 1000)
      } else if (!player.invincible) {
        audio.die.play()
        selectLevel(currentLevel)
      }
    }
  })

  polvos.forEach((polvo, index) => {
    polvo.update()

    // remove polvo on fireball hit
    particles.forEach((particle, particleIndex) => {
      if (
          particle.fireball &&
          particle.position.x + particle.radius >= polvo.position.x &&
          particle.position.y + particle.radius >= polvo.position.y &&
          particle.position.x - particle.radius <=
          polvo.position.x + polvo.width &&
          particle.position.y - particle.radius <=
          polvo.position.y + polvo.height
      ) {
        for (let i = 0; i < 50; i++) {
          particles.push(
              new Particle({
                position: {
                  x: polvo.position.x + polvo.width / 2,
                  y: polvo.position.y + polvo.height / 2
                },
                velocity: {
                  x: (Math.random() - 0.5) * 7,
                  y: (Math.random() - 0.5) * 15
                },
                radius: Math.random() * 3
              })
          )
        }
        setTimeout(() => {
          polvos.splice(index, 1)
          particles.splice(particleIndex, 1)
        }, 0)
      }
    })

    // polvo stomp squish / squash
    if (
        collisionTop({
          object1: player,
          object2: polvo
        })
    ) {
      audio.goombaSquash.play()

      for (let i = 0; i < 50; i++) {
        particles.push(
            new Particle({
              position: {
                x: polvo.position.x + polvo.width / 2,
                y: polvo.position.y + polvo.height / 2
              },
              velocity: {
                x: (Math.random() - 0.5) * 7,
                y: (Math.random() - 0.5) * 15
              },
              radius: Math.random() * 3
            })
        )
      }
      player.velocity.y -= 40
      setTimeout(() => {
        polvos.splice(index, 1)
      }, 0)
    } else if (
        player.position.x + player.width >= polvo.position.x &&
        player.position.y + player.height >= polvo.position.y &&
        player.position.x <= polvo.position.x + polvo.width
    ) {
      // player hits enemy
      // lose fireflower / lose powerup
      if (player.powerUps.fireFlower) {
        player.invincible = true
        player.powerUps.fireFlower = false
        audio.losePowerUp.play()

        setTimeout(() => {
          player.invincible = false
        }, 1000)
      } else if (!player.invincible) {
        audio.die.play()
        selectLevel(currentLevel)
      }
    }
  })



  player.update()



  if (game.disableUserInput) return



  // scrolling code starts
  let hitSide = false
  if (keys.right.pressed && player.position.x < 400) {
    player.velocity.x = player.speed
  } else if (
      (keys.left.pressed && player.position.x > 100) ||
      (keys.left.pressed && scrollOffset === 0 && player.position.x > 0)
  ) {
    player.velocity.x = -player.speed
  } else {
    player.velocity.x = 0

    // scrolling code
    if (keys.right.pressed) {
      for (let i = 0; i < platforms.length; i++) {
        const platform = platforms[i]
        platform.velocity.x = -player.speed

        if (
            platform.block &&
            hitSideOfPlatform({
              object: player,
              platform
            })
        ) {
          platforms.forEach((platform) => {
            platform.velocity.x = 0
          })

          hitSide = true
          break
        }
      }

      if (!hitSide) {
        scrollOffset += player.speed

        flagPole.velocity.x = -player.speed

        genericObjects.forEach((genericObject) => {
          genericObject.velocity.x = -player.speed * 0.4
        })

        mares.forEach((Mar) => {
          Mar.velocity.x = -player.speed * 0.7
        })

        frontObjects.forEach((frontObject) => {
          frontObject.velocity.x = -player.speed
        })

        crabs.forEach((crab) => {
          crab.position.x -= player.speed
        })

        polvos.forEach((polvo) => {
          polvo.position.x -= player.speed
        })

        fireFlowers.forEach((fireFlower) => {
          fireFlower.position.x -= player.speed
        })

        particles.forEach((particle) => {
          particle.position.x -= player.speed
        })
      }
    } else if (keys.left.pressed && scrollOffset > 0) {
      for (let i = 0; i < platforms.length; i++) {
        const platform = platforms[i]
        platform.velocity.x = player.speed

        if (
            platform.block &&
            hitSideOfPlatform({
              object: player,
              platform
            })
        ) {
          platforms.forEach((platform) => {
            platform.velocity.x = 0
          })

          hitSide = true
          break
        }
      }

      if (!hitSide) {
        scrollOffset -= player.speed

        flagPole.velocity.x = player.speed

        genericObjects.forEach((genericObject) => {
          genericObject.velocity.x = player.speed * 0.2
        })

        mares.forEach((Mar) => {
          Mar.velocity.x = player.speed * 0.5
        })

        frontObjects.forEach((frontObject) => {
          frontObject.velocity.x = player.speed
        })

        crabs.forEach((crab) => {
          crab.position.x += player.speed
        })

        polvos.forEach((polvo) => {
          polvo.position.x += player.speed
        })

        fireFlowers.forEach((fireFlower) => {
          fireFlower.position.x += player.speed
        })

        particles.forEach((particle) => {
          particle.position.x += player.speed
        })
      }
    }
  }

  // platform collision detection
  platforms.forEach((platform) => {
    if (
        isOnTopOfPlatform({
          object: player,
          platform
        })
    ) {
      player.velocity.y = 0
    }

    if (
        platform.block &&
        hitBottomOfPlatform({
          object: player,
          platform
        })
    ) {
      player.velocity.y = -player.velocity.y
    }

    if (
        platform.block &&
        hitSideOfPlatform({
          object: player,
          platform
        })
    ) {
      player.velocity.x = 0
    }

    // particles bounce
    particles.forEach((particle, index) => {
      if (
          isOnTopOfPlatformCircle({
            object: particle,
            platform
          })
      ) {
        const bounce = 0.9
        particle.velocity.y = -particle.velocity.y * 0.99

        if (particle.radius - 0.4 < 0) particles.splice(index, 1)
        else particle.radius -= 0.4
      }

      if (particle.ttl < 0) particles.splice(index, 1)
    })

    crabs.forEach((crab) => {
      if (
          isOnTopOfPlatform({
            object: crab,
            platform
          })
      )
        crab.velocity.y = 0
    })

    polvos.forEach((polvo) => {
      if (
          isOnTopOfPlatform({
            object: polvo,
            platform
          })
      )
        polvo.velocity.y = 0
    })

    fireFlowers.forEach((fireFlower) => {
      if (
          isOnTopOfPlatform({
            object: fireFlower,
            platform
          })
      )
        fireFlower.velocity.y = 0
    })
  })

  // lose condition
  if (player.position.y > canvas.height) {
    audio.die.play()
    selectLevel(currentLevel)
  }

  // sprite switching

  if (player.shooting) {
    player.currentSprite = player.sprites.shoot.fireFlower.right

    if (lastKey === 'left')
      player.currentSprite = player.sprites.shoot.fireFlower.left

    return
  }

  // sprite jump
  if (player.velocity.y !== 0) return

  if (
      keys.right.pressed &&
      lastKey === 'right' &&
      player.currentSprite !== player.sprites.run.right
  ) {
    player.currentSprite = player.sprites.run.right
  } else if (
      keys.left.pressed &&
      lastKey === 'left' &&
      player.currentSprite !== player.sprites.run.left
  ) {
    player.currentSprite = player.sprites.run.left
  } else if (
      !keys.left.pressed &&
      lastKey === 'left' &&
      player.currentSprite !== player.sprites.stand.left
  ) {
    player.currentSprite = player.sprites.stand.left
  } else if (
      !keys.right.pressed &&
      lastKey === 'right' &&
      player.currentSprite !== player.sprites.stand.right
  ) {
    player.currentSprite = player.sprites.stand.right
  }

  // fireflower sprites
  if (!player.powerUps.fireFlower) return

  if (
      keys.right.pressed &&
      lastKey === 'right' &&
      player.currentSprite !== player.sprites.run.fireFlower.right
  ) {
    player.currentSprite = player.sprites.run.fireFlower.right
  } else if (
      keys.left.pressed &&
      lastKey === 'left' &&
      player.currentSprite !== player.sprites.run.fireFlower.left
  ) {
    player.currentSprite = player.sprites.run.fireFlower.left
  } else if (
      !keys.left.pressed &&
      lastKey === 'left' &&
      player.currentSprite !== player.sprites.stand.fireFlower.left
  ) {
    player.currentSprite = player.sprites.stand.fireFlower.left
  } else if (
      !keys.right.pressed &&
      lastKey === 'right' &&
      player.currentSprite !== player.sprites.stand.fireFlower.right
  ) {
    player.currentSprite = player.sprites.stand.fireFlower.right
  }
} // animation loop ends

selectLevel(1)
// init()
// initLevel2()
animate()

addEventListener('keydown', ({ keyCode }) => {
  if (game.disableUserInput) return

  switch (keyCode) {
    case 65:
      console.log('left')
      keys.left.pressed = true
      lastKey = 'left'

      break

    case 37:
      console.log('left')
      keys.left.pressed = true
      lastKey = 'left'

      break

    case 83:
      console.log('down')
      break

    case 40:
      console.log('down')
      break

    case 68:
      console.log('right')
      keys.right.pressed = true
      lastKey = 'right'

      break

    case 39:
      console.log('right')
      keys.right.pressed = true
      lastKey = 'right'

      break

    case 87:
      console.log('up')
      player.velocity.y -= 25

      audio.jump.play()

      if (lastKey === 'right') player.currentSprite = player.sprites.jump.right
      else player.currentSprite = player.sprites.jump.left

      if (!player.powerUps.fireFlower) break

      if (lastKey === 'right')
        player.currentSprite = player.sprites.jump.fireFlower.right
      else player.currentSprite = player.sprites.jump.fireFlower.left

      break

    case 38:
      console.log('up')
      player.velocity.y -= 25

      audio.jump.play()

      if (lastKey === 'right') player.currentSprite = player.sprites.jump.right
      else player.currentSprite = player.sprites.jump.left

      if (!player.powerUps.fireFlower) break

      if (lastKey === 'right')
        player.currentSprite = player.sprites.jump.fireFlower.right
      else player.currentSprite = player.sprites.jump.fireFlower.left

      break


    case 32:
      console.log('space')

      if (!player.powerUps.fireFlower) return

      player.shooting = true

      setTimeout(() => {
        player.shooting = false
      }, 100)

      audio.fireFlowerShot.play()

      let velocity = 15
      if (lastKey === 'left') velocity = -velocity

      particles.push(
          new Particle({
            position: {
              x: player.position.x + player.width / 2,
              y: player.position.y + player.height / 2
            },
            velocity: {
              x: velocity,
              y: 0
            },
            radius: 5,
            color: 'red',
            fireball: true
          })
      )
      break
  }
})

addEventListener('keyup', ({ keyCode }) => {
  if (game.disableUserInput) return

  switch (keyCode) {
    case 65:
      console.log('left')
      keys.left.pressed = false
      break

    case 37:
      console.log('left')
      keys.left.pressed = false
      break

    case 83:
      console.log('down')
      break

    case 40:
      console.log('down')
      break

    case 68:
      console.log('right')
      keys.right.pressed = false

      break

    case 39:
      console.log('right')
      keys.right.pressed = false

      break

    case 87:
      console.log('up')
      break

    case 38:
      console.log('up')
      break

  }
})