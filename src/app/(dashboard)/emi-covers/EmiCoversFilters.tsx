'use client'

import { useRouter } from 'next/navigation'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  type EmiCoverStatusTab,
  type AgingFilter,
  emiCoversListPath,
} from './emi-covers-search-params'

type Props = {
  tab: EmiCoverStatusTab
  aging: AgingFilter
}

export function EmiCoversFilters({ tab, aging }: Props) {
  const router = useRouter()

  return (
    <div className="flex flex-wrap items-end gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="emi_covers-status" className="text-muted-foreground text-xs">
          Status
        </Label>
        <Select
          value={tab}
          onValueChange={(value) =>
            router.push(emiCoversListPath(value as EmiCoverStatusTab, aging), {
              scroll: false,
            })
          }
        >
          <SelectTrigger id="emi_covers-status" size="sm" className="min-w-[10.5rem]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="outstanding">Outstanding</SelectItem>
            <SelectItem value="settled">Settled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="emi_covers-aging" className="text-muted-foreground text-xs">
          Aging
        </Label>
        <Select
          value={aging}
          onValueChange={(value) =>
            router.push(emiCoversListPath(tab, value as AgingFilter), {
              scroll: false,
            })
          }
        >
          <SelectTrigger id="emi_covers-aging" size="sm" className="min-w-[10.5rem]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All ages</SelectItem>
            <SelectItem value="0-30">0-30 days</SelectItem>
            <SelectItem value="30-60">30-60 days</SelectItem>
            <SelectItem value="60-90">60-90 days</SelectItem>
            <SelectItem value="90plus">90+ days</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
