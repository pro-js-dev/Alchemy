import { useCallback, useEffect, useState } from 'react'
import { ThemeProvider, createTheme, CssBaseline, Box, IconButton, Typography } from '@mui/material'
import { Canvas } from '@react-three/fiber'
import { ACESFilmicToneMapping, PCFSoftShadowMap } from 'three'
import { CookiesProvider } from 'react-cookie'
import { GameScene } from './components/scene/GameScene'
import { AdaptiveCamera } from './components/scene/AdaptiveCamera'
import { HUD } from './components/hud/HUD'
import { DevCalibrator } from './components/dev/DevCalibrator'
import { useGameStore } from './store/useGameStore'
import { useCalibStore } from './store/useCalibStore'

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#c0392b' },
    background: { default: '#f5ebe0' },
  },
})

function App() {
  const initBoard = useGameStore((s) => s.initBoard)
  const loadCalib = useCalibStore((s) => s.loadFromStorage)
  const [devMode, setDevMode] = useState(false)

  useEffect(() => {
    loadCalib()
    initBoard()
  }, [initBoard, loadCalib])

  const handleExitDev = useCallback(() => {
    loadCalib()
    setDevMode(false)
  }, [loadCalib])

  return (
    <CookiesProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {devMode ? (
          <DevCalibrator onExit={handleExitDev} />
        ) : (
          <Box sx={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden', bgcolor: '#f5ebe0', touchAction: 'none', WebkitUserSelect: 'none', userSelect: 'none' }}>
            <IconButton
              size="small"
              onClick={() => setDevMode(true)}
              title="Dev Calibrator"
              sx={{ position: 'absolute', bottom: 8, right: 8, zIndex: 10, opacity: 0.3, '&:hover': { opacity: 1 }, display: { xs: 'none', sm: 'inline-flex' } }}
            >
              <Typography variant="caption" sx={{ color: '#8b5e3c' }}>DEV</Typography>
            </IconButton>
            <Canvas
              orthographic
              camera={{
                position: [0, 20, 0],
                zoom: 70,
                near: 0.1,
                far: 100,
              }}
              shadows={{ type: PCFSoftShadowMap }}
              gl={{ toneMapping: ACESFilmicToneMapping, toneMappingExposure: 1.2 }}
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
            >
              <color attach="background" args={['#f5ebe0']} />
              <AdaptiveCamera />
              <GameScene />
            </Canvas>
            <HUD />
          </Box>
        )}
      </ThemeProvider>
    </CookiesProvider>
  )
}

export default App
