const SOUND_PATHS = {
  select: '/sounds/select.ogg',
  deselect: '/sounds/deselect.ogg',
  move: '/sounds/move.ogg',
  merge: '/sounds/merge.ogg',
  maxMerge: '/sounds/max_merge.ogg',
  spawn: '/sounds/spawn.ogg',
  error: '/sounds/error.ogg',
  hover: '/sounds/hover.ogg',
} as const

type SoundName = keyof typeof SOUND_PATHS

const audioCache = new Map<string, HTMLAudioElement>()

function getAudio(name: SoundName): HTMLAudioElement {
  const path = SOUND_PATHS[name]
  let audio = audioCache.get(path)
  if (!audio) {
    audio = new Audio(path)
    audioCache.set(path, audio)
  }
  return audio
}

export function playSound(name: SoundName, volume = 0.5) {
  const audio = getAudio(name)
  audio.volume = volume
  audio.currentTime = 0
  audio.play().catch(() => {
    // Браузер блокирует autoplay до первого взаимодействия — тихо игнорируем
  })
}
