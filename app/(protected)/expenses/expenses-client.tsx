"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/currency"
import { Plus, Search, Edit, Trash2, TrendingDown, Receipt, Calendar, DollarSign } from "lucide-react"
import PageHeader from "@/components/page-header"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Textarea } from "@/components/ui/textarea"
import { ConfirmationModal } from "@/components/ui/confirmation-modal"

import { ExpenseRecord, Vendor } from "@/types/expense"

type ExpensesClientProps = {
  initialExpenses: ExpenseRecord[]
  vendors: Vendor[]
}

export function ExpensesClient({ initialExpenses, vendors }: ExpensesClientProps) {
  const [expenses, setExpenses] = useState<ExpenseRecord[]>(initialExpenses)
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState<ExpenseRecord | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const router = useRouter()
  const supabase = createClient()

  const fetchExpenses = async () => {
    const { data, error } = await supabase.from("expenses").select("*, vendors(*)").order("expense_date", { ascending: false })
    if (error) {
      console.error("Error fetching expenses:", error)
    } else {
      setExpenses(data)
    }
  }

  const [formData, setFormData] = useState({
    expense_date: new Date().toISOString().split("T")[0],
    category: "feed",
    description: "",
    amount: "",
    vendor_id: "",
    payment_method: "cash",
    receipt_number: "",
    notes: "",
  })

  const resetForm = () => {
    setFormData({
      expense_date: new Date().toISOString().split("T")[0],
      category: "feed",
      description: "",
      amount: "",
      vendor_id: "",
      payment_method: "cash",
      receipt_number: "",
      notes: "",
    })
    setEditingRecord(null)
  }

  const handleOpenDialog = (record?: ExpenseRecord) => {
    if (record) {
      setEditingRecord(record)
      setFormData({
        expense_date: record.expense_date,
        category: record.category,
        description: record.description,
        amount: record.amount.toString(),
        vendor_id: record.vendor_id || "",
        payment_method: record.payment_method,
        receipt_number: record.receipt_number || "",
        notes: record.notes || "",
      })
    } else {
      resetForm()
    }
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    resetForm()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const expenseData = {
        expense_date: formData.expense_date,
        category: formData.category,
        description: formData.description,
        amount: Number.parseFloat(formData.amount),
        vendor_id: formData.vendor_id || null,
        payment_method: formData.payment_method,
        receipt_number: formData.receipt_number || null,
        notes: formData.notes || null,
        user_id: user.id,
      }

      if (editingRecord) {
        const { error } = await supabase.from("expenses").update(expenseData).eq("id", editingRecord.id)

        if (error) throw error
      } else {
        const { error } = await supabase.from("expenses").insert([expenseData])

        if (error) throw error
      }
 
      handleCloseDialog()
      await fetchExpenses() // Re-fetch data after successful CRUD
      router.refresh()
    } catch (error) {
      console.error("Error saving expense:", error)
    } finally {
      setIsLoading(false)
    }
  }
 
  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from("expenses").delete().eq("id", id)

      if (error) throw error

      await fetchExpenses() // Re-fetch data after successful delete
      router.refresh()
    } catch (error) {
      console.error("Error deleting expense:", error)
    }
  }

  const filteredExpenses = expenses.filter(
    (record) =>
      record.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.vendors?.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const paginatedExpenses = filteredExpenses.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
  const totalPages = Math.ceil(filteredExpenses.length / itemsPerPage)

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      feed: "bg-orange-500/10 text-orange-500 border-orange-500/20",
      veterinary: "bg-red-500/10 text-red-500 border-red-500/20",
      equipment: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      utilities: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
      labor: "bg-green-500/10 text-green-500 border-green-500/20",
      maintenance: "bg-purple-500/10 text-purple-500 border-purple-500/20",
      other: "bg-gray-500/10 text-gray-500 border-gray-500/20",
    }
    return colors[category] || colors.other
  }

  // Calculate stats
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0)
  const monthlyExpenses = expenses
    .filter((e) => {
      const expenseDate = new Date(e.expense_date)
      const currentMonth = new Date().getMonth()
      const currentYear = new Date().getFullYear()
      return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear
    })
    .reduce((sum, expense) => sum + expense.amount, 0)
  const expensesByCategory = expenses.reduce(
    (acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount
      return acc
    },
    {} as Record<string, number>,
  )
  const topCategory = Object.entries(expensesByCategory).sort(([, a], [, b]) => b - a)[0]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Expenses Management"
        description="Track and manage your farm's operational expenses"
        buttonText="Add Expense"
        onButtonClick={() => handleOpenDialog()}
      />

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalExpenses)}</div>
            <p className="text-xs text-muted-foreground">All time expenses</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(monthlyExpenses)}</div>
            <p className="text-xs text-muted-foreground">Current month expenses</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Records</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{expenses.length}</div>
            <p className="text-xs text-muted-foreground">Expense entries</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Category</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{topCategory?.[0] || "N/A"}</div>
            <p className="text-xs text-muted-foreground">{formatCurrency(topCategory?.[1] || 0)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search expenses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Expenses Table */}
      <div>
        <CardHeader className="px-0 pb-4">
          <CardTitle>Expense Records</CardTitle>
          <CardDescription>Complete history of all farm expenses and operational costs.</CardDescription>
        </CardHeader>
        <Card>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Payment Method</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedExpenses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      No expenses found. Add your first expense to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedExpenses.map((record, index) => (
                    <TableRow key={record.id} className={index % 2 === 0 ? "bg-gray-100" : ""}>
                      <TableCell>{new Date(record.expense_date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge className={getCategoryColor(record.category)}>{record.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{record.description}</div>
                          {record.receipt_number && (
                            <div className="text-sm text-muted-foreground">Receipt: {record.receipt_number}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{record.vendors?.name || "-"}</TableCell>
                      <TableCell className="font-medium">{formatCurrency(record.amount)}</TableCell>
                      <TableCell className="capitalize">{record.payment_method.replace("_", " ")}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(record)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <ConfirmationModal
                            title="Confirm Deletion"
                            description="Are you sure you want to delete this expense record? This action cannot be undone."
                            onConfirm={() => handleDelete(record.id)}
                          >
                            <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </ConfirmationModal>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
          <CardFooter className="flex justify-between">
            <div className="text-sm text-muted-foreground">
              Showing {paginatedExpenses.length} of {filteredExpenses.length} expenses
            </div>
            <div className="flex gap-2">
              <Button onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1} variant="outline">
                Previous
              </Button>
              <Button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                variant="outline"
              >
                Next
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingRecord ? "Edit Expense Record" : "Add Expense Record"}</DialogTitle>
            <DialogDescription>
              {editingRecord ? "Update the expense record details." : "Record a new expense for your farm operations."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expense_date">Date *</Label>
                  <Input
                    id="expense_date"
                    type="date"
                    value={formData.expense_date}
                    onChange={(e) => setFormData({ ...formData, expense_date: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="feed">Feed</SelectItem>
                      <SelectItem value="veterinary">Veterinary</SelectItem>
                      <SelectItem value="equipment">Equipment</SelectItem>
                      <SelectItem value="utilities">Utilities</SelectItem>
                      <SelectItem value="labor">Labor</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="transportation">Transportation</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the expense..."
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="vendor_id">Vendor</Label>
                  <Select
                    value={formData.vendor_id}
                    onValueChange={(value) => setFormData({ ...formData, vendor_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select vendor (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {vendors.map((vendor) => (
                        <SelectItem key={vendor.id} value={vendor.id}>
                          {vendor.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (৳) *</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="payment_method">Payment Method *</Label>
                  <Select
                    value={formData.payment_method}
                    onValueChange={(value) => setFormData({ ...formData, payment_method: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="card">Card</SelectItem>
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                      <SelectItem value="mobile_money">Mobile Money</SelectItem>
                      <SelectItem value="check">Check</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="receipt_number">Receipt Number</Label>
                  <Input
                    id="receipt_number"
                    value={formData.receipt_number}
                    onChange={(e) => setFormData({ ...formData, receipt_number: e.target.value })}
                    placeholder="Receipt or invoice number"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional notes about this expense..."
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : editingRecord ? "Update Expense" : "Add Expense"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
