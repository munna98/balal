'use client'

import type { RiskLevelKey } from '@/types'
import { RISK_LEVELS } from '@/lib/constants'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

export function RiskBadge({ riskLevel }: { riskLevel: RiskLevelKey }) {
  const risk = RISK_LEVELS[riskLevel]

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge className={`${risk.color} text-white`}>{`${risk.level} · ${risk.label}`}</Badge>
        </TooltipTrigger>
        <TooltipContent>{risk.description}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
