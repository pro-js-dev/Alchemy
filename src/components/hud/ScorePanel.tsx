import { Box, LinearProgress, Typography } from '@mui/material'
import { useGameStore } from '../../store/useGameStore'

const SCORE_STEP = 100

export function ScorePanel() {
  const score = useGameStore((s) => s.score)
  const moves = useGameStore((s) => s.moves)

  const progress = (score % SCORE_STEP) / SCORE_STEP * 100
  const level = Math.floor(score / SCORE_STEP) + 1

  return (
    <Box sx={{ pointerEvents: 'auto' }}>
      <LinearProgress
        variant="determinate"
        value={progress}
        sx={{
          height: 6,
          borderRadius: 0,
          bgcolor: 'rgba(139,69,19,0.12)',
          '& .MuiLinearProgress-bar': {
            bgcolor: '#c0392b',
            borderRadius: 0,
          },
        }}
      />
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          px: { xs: 1.5, sm: 2 },
          py: 0.5,
          minHeight: 32,
        }}
      >
        <Typography variant="caption" sx={{ color: '#8b5e3c', fontWeight: 600 }}>
          Lv. {level}
        </Typography>
        <Typography variant="caption" sx={{ color: '#8b5e3c', fontWeight: 700, fontSize: '0.85rem' }}>
          {score}
        </Typography>
        <Typography variant="caption" sx={{ color: '#a08060' }}>
          {moves} moves
        </Typography>
      </Box>
    </Box>
  )
}
