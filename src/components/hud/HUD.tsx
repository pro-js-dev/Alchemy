import { Box } from '@mui/material'
import { ScorePanel } from './ScorePanel'
import { ItemInfoPanel } from './ItemInfoPanel'

export function HUD() {
  return (
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'none',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        pb: { xs: 1, sm: 2 },
      }}
    >
      <ScorePanel />
      <ItemInfoPanel />
    </Box>
  )
}
