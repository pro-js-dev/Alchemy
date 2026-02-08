import { Box, Typography } from '@mui/material'
import { useGameStore } from '../../store/useGameStore'
import { getItemDef } from '../../game/itemRegistry'

export function ItemInfoPanel() {
  const selectedItemId = useGameStore((s) => s.selectedItemId)
  const items = useGameStore((s) => s.items)

  if (!selectedItemId) return null

  const item = items.find((i) => i.instanceId === selectedItemId)
  if (!item) return null

  const def = getItemDef(item.definitionId)
  const mergesIntoDef = def.mergesInto ? getItemDef(def.mergesInto) : null

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', pointerEvents: 'auto' }}>
      <Box
        sx={{
          px: { xs: 2, sm: 3 },
          py: 1,
          maxWidth: { xs: '90vw', sm: 300 },
          bgcolor: 'rgba(245,235,224,0.85)',
          backdropFilter: 'blur(8px)',
          borderRadius: 2,
          border: '1px solid rgba(139,69,19,0.15)',
        }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#5d3a1a' }}>
          {def.name}
        </Typography>
        <Typography variant="caption" sx={{ color: '#8b5e3c' }}>
          {def.chain} &bull; Level {def.level}
        </Typography>
        {mergesIntoDef ? (
          <Typography variant="caption" display="block" sx={{ color: '#a08060' }}>
            Merge 2 &rarr; {mergesIntoDef.name}
          </Typography>
        ) : (
          <Typography variant="caption" display="block" sx={{ color: '#c0392b', fontWeight: 600 }}>
            Max level!
          </Typography>
        )}
      </Box>
    </Box>
  )
}
