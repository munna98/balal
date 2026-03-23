'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { MoreHorizontal, Eye, Edit, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { DataTable, type DataTableColumn } from '@/components/shared/DataTable'
import { RiskBadge } from '@/components/customers/RiskBadge'
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

export type CustomerRow = {
  id: string
  name: string
  photo_url: string | null
  mobile1: string
  risk_level: 'DANGER' | 'WARNING' | 'NEUTRAL' | 'RELIABLE' | 'SAFE'
  salesCount: number
  balance: number
  search: string
}

function CustomerActions({ customer }: { customer: CustomerRow }) {
  const router = useRouter()
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  async function handleDelete() {
    setIsDeleting(true)
    try {
      const res = await fetch(`/api/customers/${customer.id}`, {
        method: 'DELETE',
      })
      const json = await res.json()
      if (!res.ok) {
        toast.error(json.error || 'Failed to delete customer')
        return
      }
      toast.success('Customer deleted successfully')
      router.refresh()
    } catch (e) {
      toast.error('An error occurred during deletion')
    } finally {
      setIsDeleting(false)
      setDeleteOpen(false)
    }
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
            <Link href={`/customers/${customer.id}`}>
              <Eye className="mr-2 size-4" /> View
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={`/customers/${customer.id}/edit`}>
              <Edit className="mr-2 size-4" /> Edit
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-red-600 focus:text-red-600"
            onSelect={(e) => {
              e.preventDefault() // prevent closing menu immediately to show dialog
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
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{customer.name}". If this customer has existing sales, the deletion will fail.
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
    </>
  )
}

export function CustomersDataTable({ customers }: { customers: CustomerRow[] }) {
  const columns: DataTableColumn<CustomerRow>[] = [
    {
      key: 'photo_url',
      header: 'Photo',
      render: (row) => (
        <Avatar className="size-8">
          {row.photo_url ? <AvatarImage src={row.photo_url} alt={row.name} /> : null}
          <AvatarFallback>Photo</AvatarFallback>
        </Avatar>
      ),
    },
    {
      key: 'name',
      header: 'Name',
      render: (row) => (
        <Link href={`/customers/${row.id}`} className="font-medium underline-offset-4 hover:underline">
          {row.name}
        </Link>
      ),
    },
    {
      key: 'mobile1',
      header: 'Mobile',
      render: (row) => row.mobile1,
    },
    {
      key: 'risk',
      header: 'Risk',
      render: (row) => <RiskBadge riskLevel={row.risk_level} />,
    },
    {
      key: 'salesCount',
      header: 'Sales',
      render: (row) => row.salesCount,
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
      render: (row) => <CustomerActions customer={row} />,
    },
  ]

  return (
    <DataTable
      columns={columns}
      data={customers}
      searchKey="search"
      emptyMessage="No customers found."
    />
  )
}
