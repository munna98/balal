'use client'

import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { Check, ChevronsUpDown } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RiskBadge } from '@/components/customers/RiskBadge'
import { cn } from '@/lib/utils'
import type { RiskLevelKey } from '@/types'

export type CustomerLookupItem = {
  id: string
  name: string
  mobile1: string
  photo_url: string | null
  risk_level: RiskLevelKey
}

function formatCustomerValue(customer: CustomerLookupItem | null) {
  return customer ? customer.name : ''
}

export function CustomerLookupField({
  label,
  selectedCustomer,
  onSelect,
  placeholder = 'Search customer by name or mobile',
  emptyMessage = 'No matching customers.',
  excludeIds = [],
  customers,
  action,
}: {
  label: string
  selectedCustomer: CustomerLookupItem | null
  onSelect: (customer: CustomerLookupItem | null) => void
  placeholder?: string
  emptyMessage?: string
  excludeIds?: string[]
  customers?: CustomerLookupItem[]
  action?: React.ReactNode
}) {
  const listboxId = useId()
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [query, setQuery] = useState(formatCustomerValue(selectedCustomer))
  const [results, setResults] = useState<CustomerLookupItem[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const selectedValue = formatCustomerValue(selectedCustomer)
  const previousSelectedIdRef = useRef<string | null>(selectedCustomer?.id ?? null)
  const localCustomers = useMemo(() => customers ?? [], [customers])
  const hasLocalCustomers = localCustomers.length > 0
  const isShowingSelectedValue = selectedCustomer !== null && query.trim() === selectedValue

  const filteredResults = useMemo(() => {
    const search = query.trim().toLowerCase()
    const source = hasLocalCustomers
      ? localCustomers.filter((customer) => {
          if (search.length < 2 || isShowingSelectedValue) return false

          const name = customer.name.toLowerCase()
          const mobile = customer.mobile1.toLowerCase()

          return name.includes(search) || mobile.includes(search)
        })
      : results

    return source.filter((customer) => !excludeIds.includes(customer.id))
  }, [excludeIds, hasLocalCustomers, isShowingSelectedValue, localCustomers, query, results])

  useEffect(() => {
    const previousSelectedId = previousSelectedIdRef.current
    const nextSelectedId = selectedCustomer?.id ?? null

    if (nextSelectedId && nextSelectedId !== previousSelectedId) {
      setQuery(formatCustomerValue(selectedCustomer))
    }

    if (!nextSelectedId && previousSelectedId === null && query === '') {
      setQuery('')
    }

    previousSelectedIdRef.current = nextSelectedId
  }, [query, selectedCustomer])

  useEffect(() => {
    setActiveIndex((prev) => {
      if (filteredResults.length === 0) return 0
      return Math.min(prev, filteredResults.length - 1)
    })
  }, [filteredResults.length])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (hasLocalCustomers) {
      setLoading(false)
      return
    }

    const search = query.trim()

    if (search.length < 2 || isShowingSelectedValue) {
      setResults([])
      setLoading(false)
      setOpen(false)
      return
    }

    const controller = new AbortController()
    const timeoutId = window.setTimeout(async () => {
      try {
        setLoading(true)
        const response = await fetch(
          `/api/customers?mode=lookup&limit=12&search=${encodeURIComponent(search)}`,
          { signal: controller.signal }
        )
        const json = (await response.json()) as { data?: CustomerLookupItem[] }
        if (!response.ok || !json.data) {
          setResults([])
          setOpen(true)
          return
        }
        setResults(json.data)
        setOpen(true)
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          setResults([])
        }
      } finally {
        setLoading(false)
      }
    }, 30)

    return () => {
      controller.abort()
      window.clearTimeout(timeoutId)
    }
  }, [hasLocalCustomers, isShowingSelectedValue, query])

  return (
    <div ref={containerRef} className="space-y-2">
      <Label>{label}</Label>
      <div className="flex items-start gap-2">
        <div className="relative min-w-0 flex-1">
          <div className="relative">
            <Input
              role="combobox"
              aria-expanded={open}
              aria-controls={listboxId}
              aria-autocomplete="list"
              placeholder={placeholder}
              value={query}
              onFocus={() => {
                if (query.trim().length >= 2) {
                  setOpen(true)
                }
              }}
              onChange={(event) => {
                const nextValue = event.target.value
                setQuery(nextValue)
                setOpen(nextValue.trim().length >= 2)

                if (
                  selectedCustomer &&
                  nextValue.trim() !== formatCustomerValue(selectedCustomer) &&
                  nextValue.trim() !== selectedCustomer.name
                ) {
                  onSelect(null)
                }
              }}
              onKeyDown={(event) => {
                if (!open && event.key === 'ArrowDown' && filteredResults.length) {
                  event.preventDefault()
                  setOpen(true)
                  setActiveIndex(0)
                  return
                }

                if (!open) return

                if (event.key === 'ArrowDown') {
                  event.preventDefault()
                  setActiveIndex((prev) => Math.min(prev + 1, Math.max(filteredResults.length - 1, 0)))
                } else if (event.key === 'ArrowUp') {
                  event.preventDefault()
                  setActiveIndex((prev) => Math.max(prev - 1, 0))
                } else if (event.key === 'Enter' && filteredResults[activeIndex]) {
                  event.preventDefault()
                  const customer = filteredResults[activeIndex]
                  onSelect(customer)
                  setQuery(formatCustomerValue(customer))
                  setOpen(false)
                  setResults([])
                } else if (event.key === 'Escape') {
                  setOpen(false)
                }
              }}
              className="pr-10"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute top-1/2 right-1 h-7 w-7 -translate-y-1/2 p-0"
              onClick={() => setOpen((prev) => !prev)}
              aria-label={`Toggle ${label.toLowerCase()} options`}
            >
              <ChevronsUpDown className="size-4 text-muted-foreground" />
            </Button>
          </div>

          {open ? (
            <div
              id={listboxId}
              role="listbox"
              className="absolute z-30 mt-2 max-h-72 w-full overflow-y-auto rounded-md border bg-popover p-2 shadow-md"
            >
              {loading ? (
                <p className="text-sm text-muted-foreground">Searching customers...</p>
              ) : query.trim().length < 2 ? (
                <p className="text-sm text-muted-foreground">Type at least 2 characters to search customers.</p>
              ) : filteredResults.length ? (
                <div className="space-y-1">
                  {filteredResults.map((customer, index) => (
                    <button
                      key={customer.id}
                      role="option"
                      aria-selected={selectedCustomer?.id === customer.id}
                      type="button"
                      className={cn(
                        'flex w-full items-center justify-between gap-3 rounded-md px-2 py-2 text-left text-sm hover:bg-muted',
                        (selectedCustomer?.id === customer.id || activeIndex === index) && 'bg-muted'
                      )}
                      onMouseEnter={() => setActiveIndex(index)}
                      onClick={() => {
                        onSelect(customer)
                        setQuery(formatCustomerValue(customer))
                        setOpen(false)
                        setResults([])
                      }}
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <Avatar className="size-8">
                          {customer.photo_url ? <AvatarImage src={customer.photo_url} alt={customer.name} /> : null}
                          <AvatarFallback>{customer.name.slice(0, 1).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <div className="truncate font-medium">{customer.name}</div>
                          <div className="truncate text-xs text-muted-foreground">{customer.mobile1}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <RiskBadge riskLevel={customer.risk_level} />
                        {selectedCustomer?.id === customer.id ? <Check className="size-4 text-muted-foreground" /> : null}
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">{emptyMessage}</p>
              )}
            </div>
          ) : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
    </div>
  )
}
