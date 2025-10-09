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
import { Plus, Search, Edit, Trash2, TrendingUp, Calendar, DollarSign, BookUser } from "lucide-react"
import PageHeader from "@/components/page-header"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Textarea } from "@/components/ui/textarea"
import { ConfirmationModal } from "@/components/ui/confirmation-modal"

import { IncomeRecord } from "@/types/income"

type IncomeClientProps = {
  initialIncome: IncomeRecord[]
}

export function IncomeClient({ initialIncome }: IncomeClientProps) {
  const [income, setIncome] = useState<IncomeRecord[]>(initialIncome)
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState<IncomeRecord | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const router = useRouter()
  const supabase = createClient()

  const fetchIncome = async () => {
    const { data, error } = await supabase.from("income").select("*").order("income_date", { ascending: false })
    if (error) {
      console.error("Error fetching income records:", error)
    } else {
      setIncome(data)
    }
  }

  const [formData, setFormData] = useState({
    income_date: new Date().toISOString().split("T")[0],
    source: "product_sales",
    description: "",
    amount: "",
    customer_name: "",
    payment_method: "cash",
    reference_number: "",
    notes: "",
  })

  const resetForm = () => {
    setFormData({
      income_date: new Date().toISOString().split("T")[0],
      source: "product_sales",
      description: "",
      amount: "",
      customer_name: "",
      payment_method: "cash",
      reference_number: "",
      notes: "",
    })
    setEditingRecord(null)
  }

  const handleOpenDialog = (record?: IncomeRecord) => {
    if (record) {
      setEditingRecord(record)
      setFormData({
        income_date: record.income_date,
        source: record.source,
        description: record.description,
        amount: record.amount.toString(),
        customer_name: record.customer_name || "",
        payment_method: record.payment_method,
        reference_number: record.reference_number || "",
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

      const incomeData = {
        income_date: formData.income_date,
        source: formData.source,
        description: formData.description,
        amount: Number.parseFloat(formData.amount),
        customer_name: formData.customer_name || null,
        payment_method: formData.payment_method,
        reference_number: formData.reference_number || null,
        notes: formData.notes || null,
        user_id: user.id,
      }

      if (editingRecord) {
        const { error } = await supabase.from("income").update(incomeData).eq("id", editingRecord.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from("income").insert([incomeData])
        if (error) throw error
      }
 
      handleCloseDialog()
      await fetchIncome() // Re-fetch data after successful CRUD
      router.refresh()
    } catch (error) {
      console.error("Error saving income:", error)
    } finally {
      setIsLoading(false)
    }
  }
 
  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from("income").delete().eq("id", id)

      if (error) throw error

      await fetchIncome() // Re-fetch data after successful delete
      router.refresh()
    } catch (error) {
      console.error("Error deleting income:", error)
    }
  }

  const filteredIncome = income.filter(
    (record) =>
      record.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const paginatedIncome = filteredIncome.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
  const totalPages = Math.ceil(filteredIncome.length / itemsPerPage)

  const getSourceColor = (source: string) => {
    const colors: Record<string, string> = {
      product_sales: "bg-green-500/10 text-green-500 border-green-500/20",
      subsidy: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      consulting: "bg-purple-500/10 text-purple-500 border-purple-500/20",
      breeding: "bg-pink-500/10 text-pink-500 border-pink-500/20",
      other: "bg-gray-500/10 text-gray-500 border-gray-500/20",
    }
    return colors[source] || colors.other
  }

  const totalIncome = income.reduce((sum, item) => sum + item.amount, 0)
  const monthlyIncome = income
    .filter((i) => {
      const incomeDate = new Date(i.income_date)
      const currentMonth = new Date().getMonth()
      const currentYear = new Date().getFullYear()
      return incomeDate.getMonth() === currentMonth && incomeDate.getFullYear() === currentYear
    })
    .reduce((sum, item) => sum + item.amount, 0)
  const incomeBySource = income.reduce(
    (acc, item) => {
      acc[item.source] = (acc[item.source] || 0) + item.amount
      return acc
    },
    {} as Record<string, number>,
  )
  const topSource = Object.entries(incomeBySource).sort(([, a], [, b]) => b - a)[0]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Income Management"
        description="Track and manage all your farm's revenue streams"
        buttonText="Add Income"
        onButtonClick={() => handleOpenDialog()}
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalIncome)}</div>
            <p className="text-xs text-muted-foreground">All time income</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(monthlyIncome)}</div>
            <p className="text-xs text-muted-foreground">Current month income</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Records</CardTitle>
            <BookUser className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{income.length}</div>
            <p className="text-xs text-muted-foreground">Income entries</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Source</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{topSource?.[0]?.replace("_", " ") || "N/A"}</div>
            <p className="text-xs text-muted-foreground">{formatCurrency(topSource?.[1] || 0)}</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search income..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Income Records</CardTitle>
          <CardDescription>Complete history of all farm income and revenue.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Payment Method</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedIncome.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    No income records found. Add your first record to get started.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedIncome.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>{new Date(record.income_date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge className={getSourceColor(record.source)}>{record.source.replace("_", " ")}</Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{record.description}</div>
                        {record.reference_number && (
                          <div className="text-sm text-muted-foreground">Ref: {record.reference_number}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{record.customer_name || "-"}</TableCell>
                    <TableCell className="font-medium">{formatCurrency(record.amount)}</TableCell>
                    <TableCell className="capitalize">{record.payment_method.replace("_", " ")}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(record)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <ConfirmationModal
                          title="Confirm Deletion"
                          description="Are you sure you want to delete this income record? This action cannot be undone."
                          onConfirm={() => handleDelete(record.id)}
                        >
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-700"
                          >
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
            Showing {paginatedIncome.length} of {filteredIncome.length} income records
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingRecord ? "Edit Income Record" : "Add Income Record"}</DialogTitle>
            <DialogDescription>
              {editingRecord ? "Update the income record details." : "Record a new income source for your farm."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="income_date">Date *</Label>
                  <Input
                    id="income_date"
                    type="date"
                    value={formData.income_date}
                    onChange={(e) => setFormData({ ...formData, income_date: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="source">Source *</Label>
                  <Select
                    value={formData.source}
                    onValueChange={(value) => setFormData({ ...formData, source: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="product_sales">Product Sales</SelectItem>
                      <SelectItem value="subsidy">Subsidy</SelectItem>
                      <SelectItem value="consulting">Consulting</SelectItem>
                      <SelectItem value="breeding">Breeding</SelectItem>
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
                  placeholder="Describe the income..."
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                  <Label htmlFor="customer_name">Customer</Label>
                  <Input
                    id="customer_name"
                    value={formData.customer_name}
                    onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                    placeholder="Customer name (optional)"
                  />
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
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                      <SelectItem value="mobile_banking">Mobile Banking</SelectItem>
                      <SelectItem value="check">Check</SelectItem>
                      <SelectItem value="credit">Credit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reference_number">Reference Number</Label>
                  <Input
                    id="reference_number"
                    value={formData.reference_number}
                    onChange={(e) => setFormData({ ...formData, reference_number: e.target.value })}
                    placeholder="Invoice, receipt, or transaction ID"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional notes about this income..."
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : editingRecord ? "Update Income" : "Add Income"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}