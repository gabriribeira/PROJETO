import backgroundLevel2 from '../img/level2/background.png'
import mountains from '../img/level2/mountains.png'
import plameiras from '../img/level2/palmeiras.png'
import barco from '../img/level2/barco.png'
import lgPlatformLevel2 from '../img/level2/lgPlatform.png'
import mdPlatformLevel2 from '../img/level2/mdPlatform.png'
import spriteFireFlowerShootLeft from '../img/spriteFireFlowerShootLeft.png'
import spriteFireFlowerShootRight from '../img/spriteFireFlowerShootRight.png'

export const images = {
    mario: {
        shoot: {
            fireFlower: {
                right: spriteFireFlowerShootRight,
                left: spriteFireFlowerShootLeft
            }
        }
    },
    levels: {
        1: {
            background: ''
        },
        2: {
            background: backgroundLevel2,
            mountains,
            lgPlatform: lgPlatformLevel2,
            mdPlatform: mdPlatformLevel2,
            palmeiras: plameiras,
            barco: barco,
        }
    }
}