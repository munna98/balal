'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { MoreHorizontal, Eye, Edit, Trash2, PlusCircle } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DataTable, type DataTableColumn } from '@/components/shared/DataTable'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { AdvanceForm, type AdvanceFormValues } from '@/components/advances/AdvanceForm'

export type SaleRow = {
  id: string
  customerName: string
  customerMobile1: string
  deviceName: string
  imei: string | null
  loanAmount: number
  emiAmount: number
  tenureMonths: number
  loanIssueDate: string // ISO string
  balance: number
}

function SaleActions({ sale, shopId }: { sale: SaleRow; shopId: string }) {
  const router = useRouter()
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  
  const [advanceOpen, setAdvanceOpen] = useState(false)

  async function handleDelete() {
    setIsDeleting(true)
    try {
      const res = await fetch(`/api/sales/${sale.id}`, { method: 'DELETE' })
      const json = await res.json()
      if (!res.ok) {
        toast.error(json.error || 'Failed to delete sale')
        return
      }
      toast.success('Sale deleted successfully')
      router.refresh()
    } catch (e) {
      toast.error('An error occurred during deletion')
    } finally {
      setIsDeleting(false)
      setDeleteOpen(false)
    }
  }

  async function handleAddAdvance(values: AdvanceFormValues) {
    if (!values.paid_date || typeof values.amount_paid !== 'number') return

    const res = await fetch('/api/advances', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sale_id: sale.id,
        shop_id: shopId,
        paid_date: values.paid_date,
        amount_paid: values.amount_paid,
        note: values.note || null,
      }),
    })

    if (!res.ok) {
      toast.error('Failed to add advance')
      return
    }

    toast.success('Advance added successfully')
    setAdvanceOpen(false)
    router.refresh()
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="size-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link href={`/sales/${sale.id}`}>
              <Eye className="mr-2 size-4" /> View
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={`/sales/${sale.id}/edit`}>
              <Edit className="mr-2 size-4" /> Edit
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onSelect={(e) => {
              e.preventDefault()
              setAdvanceOpen(true)
            }}
          >
            <PlusCircle className="mr-2 size-4" /> Add Advance
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-red-600 focus:text-red-600"
            onSelect={(e) => {
              e.preventDefault()
              setDeleteOpen(true)
            }}
          >
            <Trash2 className="mr-2 size-4" /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the sale for {sale.deviceName}. All related advances will also be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={(e) => {
                e.preventDefault()
                handleDelete()
              }}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={advanceOpen} onOpenChange={setAdvanceOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add advance</DialogTitle>
            <DialogDescription>Record a new advance for this loan.</DialogDescription>
          </DialogHeader>
          <AdvanceForm mode="create" onSubmit={handleAddAdvance} />
        </DialogContent>
      </Dialog>
    </>
  )
}

export function SalesDataTable({ rows, shopId }: { rows: SaleRow[]; shopId: string }) {
  const [searchQuery, setSearchQuery] = useState('')

  const columns: DataTableColumn<SaleRow>[] = [
    {
      key: 'customer',
      header: 'Customer',
      render: (row) => (
        <div>
          <Link href={`/sales/${row.id}`} className="font-medium underline-offset-4 hover:underline">
            {row.customerName}
          </Link>
          <div className="text-xs text-muted-foreground">{row.customerMobile1}</div>
        </div>
      ),
    },
    { key: 'device', header: 'Device', render: (row) => row.deviceName },
    { key: 'imei', header: 'IMEI', render: (row) => row.imei || '-' },
    {
      key: 'loan',
      header: 'Loan',
      render: (row) => row.loanAmount.toFixed(2),
    },
    {
      key: 'emi',
      header: 'EMI',
      render: (row) => row.emiAmount.toFixed(2),
    },
    { key: 'tenure', header: 'Tenure', render: (row) => `${row.tenureMonths} months` },
    {
      key: 'date',
      header: 'Date',
      render: (row) => new Date(row.loanIssueDate).toLocaleDateString(),
    },
    {
      key: 'balance',
      header: 'Balance',
      render: (row) => (
        <span className={row.balance > 0 ? 'text-red-600' : 'text-green-600'}>{row.balance.toFixed(2)}</span>
      ),
    },
    {
      key: 'actions',
      header: '',
      render: (row) => <SaleActions sale={row} shopId={shopId} />,
    },
  ]

  const filteredRows = rows.filter((row) => {
    if (!searchQuery.trim()) return true
    
    const query = searchQuery.toLowerCase()
    return (
      row.customerName.toLowerCase().includes(query) ||
      row.customerMobile1.toLowerCase().includes(query) ||
      (row.imei && row.imei.toLowerCase().includes(query))
    )
  })

  return (
    <div className="space-y-4">
      <Input
        type="search"
        placeholder="Search by customer name, mobile, or IMEI..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="max-w-md"
      />
      <DataTable columns={columns} data={filteredRows} emptyMessage="No sales found." />
    </div>
  )
}

