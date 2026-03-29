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
  type PaymentStatusTab,
  type AgingFilter,
  paymentsListPath,
} from './payments-search-params'

type Props = {
  tab: PaymentStatusTab
  aging: AgingFilter
}

export function PaymentsFilters({ tab, aging }: Props) {
  const router = useRouter()

  return (
    <div className="flex flex-wrap items-end gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="payments-status" className="text-muted-foreground text-xs">
          Status
        </Label>
        <Select
          value={tab}
          onValueChange={(value) =>
            router.push(paymentsListPath(value as PaymentStatusTab, aging), {
              scroll: false,
            })
          }
        >
          <SelectTrigger id="payments-status" size="sm" className="min-w-[10.5rem]">
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
        <Label htmlFor="payments-aging" className="text-muted-foreground text-xs">
          Aging
        </Label>
        <Select
          value={aging}
          onValueChange={(value) =>
            router.push(paymentsListPath(tab, value as AgingFilter), {
              scroll: false,
            })
          }
        >
          <SelectTrigger id="payments-aging" size="sm" className="min-w-[10.5rem]">
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
