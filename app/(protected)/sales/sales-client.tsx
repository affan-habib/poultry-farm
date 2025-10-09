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
import { Plus, Search, Edit, Trash2, DollarSign, ShoppingCart, TrendingUp, Users } from "lucide-react"
import { formatCurrency } from "@/lib/currency"
import PageHeader from "@/components/page-header"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Textarea } from "@/components/ui/textarea"
import { ConfirmationModal } from "@/components/ui/confirmation-modal"

import { SalesRecord, Vendor } from "@/types/sales"

type SalesClientProps = {
  initialSales: SalesRecord[]
  vendors: Vendor[]
}

export function SalesClient({ initialSales, vendors }: SalesClientProps) {
  const [sales, setSales] = useState<SalesRecord[]>(initialSales)
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState<SalesRecord | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const router = useRouter()
  const supabase = createClient()

  const fetchSales = async () => {
    const { data, error } = await supabase.from("sales").select("*, vendors(*)").order("sale_date", { ascending: false })
    if (error) {
      console.error("Error fetching sales records:", error)
    } else {
      setSales(data)
    }
  }

  const [formData, setFormData] = useState({
    sale_date: new Date().toISOString().split("T")[0],
    vendor_id: "",
    product_type: "eggs",
    quantity: "",
    unit: "pieces",
    unit_price: "",
    payment_method: "cash",
    payment_status: "pending",
    invoice_number: "",
    notes: "",
  })

  const resetForm = () => {
    setFormData({
      sale_date: new Date().toISOString().split("T")[0],
      vendor_id: "",
      product_type: "eggs",
      quantity: "",
      unit: "pieces",
      unit_price: "",
      payment_method: "cash",
      payment_status: "pending",
      invoice_number: "",
      notes: "",
    })
    setEditingRecord(null)
  }

  const handleOpenDialog = (record?: SalesRecord) => {
    if (record) {
      setEditingRecord(record)
      setFormData({
        sale_date: record.sale_date,
        vendor_id: record.vendor_id || "",
        product_type: record.product_type,
        quantity: record.quantity.toString(),
        unit: record.unit,
        unit_price: record.unit_price.toString(),
        payment_method: record.payment_method,
        payment_status: record.payment_status,
        invoice_number: record.invoice_number || "",
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

      const quantity = Number.parseFloat(formData.quantity)
      const unitPrice = Number.parseFloat(formData.unit_price)
      const totalAmount = quantity * unitPrice

      const salesData = {
        sale_date: formData.sale_date,
        vendor_id: formData.vendor_id || null,
        product_type: formData.product_type,
        quantity,
        unit: formData.unit,
        unit_price: unitPrice,
        total_amount: totalAmount,
        payment_method: formData.payment_method,
        payment_status: formData.payment_status,
        invoice_number: formData.invoice_number || null,
        notes: formData.notes || null,
        user_id: user.id,
      }

      if (editingRecord) {
        const { error } = await supabase.from("sales").update(salesData).eq("id", editingRecord.id)

        if (error) throw error
      } else {
        const { error } = await supabase.from("sales").insert([salesData])

        if (error) throw error
      }
 
       handleCloseDialog()
       await fetchSales() // Re-fetch data after successful CRUD
       router.refresh()
     } catch (error) {
       console.error("Error saving sales record:", error)
    } finally {
      setIsLoading(false)
    }
  }
 
   const handleDelete = async (id: string) => {
     try {
       const { error } = await supabase.from("sales").delete().eq("id", id)

      if (error) throw error

      await fetchSales() // Re-fetch data after successful delete
      router.refresh()
    } catch (error) {
      console.error("Error deleting sales record:", error)
    }
  }

  const filteredSales = sales.filter(
    (record) =>
      record.vendors?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.product_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const paginatedSales = filteredSales.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
  const totalPages = Math.ceil(filteredSales.length / itemsPerPage)

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-500/10 text-green-500 border-green-500/20"
      case "pending":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
      case "overdue":
        return "bg-red-500/10 text-red-500 border-red-500/20"
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20"
    }
  }

  // Calculate stats
  const totalRevenue = sales.reduce((sum, sale) => sum + sale.total_amount, 0)
  const paidRevenue = sales.filter((s) => s.payment_status === "paid").reduce((sum, sale) => sum + sale.total_amount, 0)
  const pendingRevenue = sales
    .filter((s) => s.payment_status === "pending")
    .reduce((sum, sale) => sum + sale.total_amount, 0)
  const uniqueCustomers = new Set(sales.map((s) => s.vendor_id).filter(Boolean)).size

  const totalAmount =
    formData.quantity && formData.unit_price
      ? (Number.parseFloat(formData.quantity) * Number.parseFloat(formData.unit_price)).toFixed(2)
      : "0.00"

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sales Management"
        description="Track and manage your farm's sales transactions"
        buttonText="Add Sale Record"
        onButtonClick={() => handleOpenDialog()}
      />

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">All time sales</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(paidRevenue)}</div>
            <p className="text-xs text-muted-foreground">Received payments</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Revenue</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(pendingRevenue)}</div>
            <p className="text-xs text-muted-foreground">Outstanding payments</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{uniqueCustomers}</div>
            <p className="text-xs text-muted-foreground">Unique customers</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search sales records..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Sales Table */}
      <Card>
        <CardHeader>
          <CardTitle>Sales Records</CardTitle>
          <CardDescription>Complete history of all sales transactions.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Unit Price</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Payment Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedSales.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground">
                    No sales records found. Add your first sale to get started.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedSales.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>{new Date(record.sale_date).toLocaleDateString()}</TableCell>
                    <TableCell>{record.vendors?.name || "Walk-in Customer"}</TableCell>
                    <TableCell className="capitalize">{record.product_type}</TableCell>
                    <TableCell>
                      {record.quantity} {record.unit}
                    </TableCell>
                    <TableCell>{formatCurrency(record.unit_price)}</TableCell>
                    <TableCell className="font-medium">{formatCurrency(record.total_amount)}</TableCell>
                    <TableCell>
                      <Badge className={getPaymentStatusColor(record.payment_status)}>{record.payment_status}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(record)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <ConfirmationModal
                          title="Confirm Deletion"
                          description="Are you sure you want to delete this sales record? This action cannot be undone."
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
            Showing {paginatedSales.length} of {filteredSales.length} sales
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

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingRecord ? "Edit Sales Record" : "Add Sales Record"}</DialogTitle>
            <DialogDescription>
              {editingRecord ? "Update the sales record details." : "Record a new sales transaction."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sale_date">Date *</Label>
                  <Input
                    id="sale_date"
                    type="date"
                    value={formData.sale_date}
                    onChange={(e) => setFormData({ ...formData, sale_date: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="invoice_number">Invoice Number</Label>
                  <Input
                    id="invoice_number"
                    value={formData.invoice_number}
                    onChange={(e) => setFormData({ ...formData, invoice_number: e.target.value })}
                    placeholder="Optional"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="vendor_id">Customer</Label>
                <Select
                  value={formData.vendor_id}
                  onValueChange={(value) => setFormData({ ...formData, vendor_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select customer (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Walk-in Customer</SelectItem>
                    {vendors.map((vendor) => (
                      <SelectItem key={vendor.id} value={vendor.id}>
                        {vendor.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="product_type">Product Type *</Label>
                  <Select
                    value={formData.product_type}
                    onValueChange={(value) => setFormData({ ...formData, product_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="eggs">Eggs</SelectItem>
                      <SelectItem value="meat">Meat</SelectItem>
                      <SelectItem value="live_birds">Live Birds</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity *</Label>
                  <Input
                    id="quantity"
                    type="number"
                    step="0.01"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    placeholder="0"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unit">Unit *</Label>
                  <Select value={formData.unit} onValueChange={(value) => setFormData({ ...formData, unit: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pieces">Pieces</SelectItem>
                      <SelectItem value="kg">Kilograms</SelectItem>
                      <SelectItem value="lbs">Pounds</SelectItem>
                      <SelectItem value="dozen">Dozen</SelectItem>
                      <SelectItem value="birds">Birds</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="unit_price">Unit Price (৳) *</Label>
                  <Input
                    id="unit_price"
                    type="number"
                    step="0.01"
                    value={formData.unit_price}
                    onChange={(e) => setFormData({ ...formData, unit_price: e.target.value })}
                    placeholder="0.00"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="total_amount">Total Amount</Label>
                  <Input
                    id="total_amount"
                    type="text"
                    value={formatCurrency(Number.parseFloat(totalAmount))}
                    disabled
                    className="bg-muted"
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
                  <Label htmlFor="payment_status">Payment Status *</Label>
                  <Select
                    value={formData.payment_status}
                    onValueChange={(value) => setFormData({ ...formData, payment_status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="overdue">Overdue</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional notes about this sale..."
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : editingRecord ? "Update Sale" : "Add Sale"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
