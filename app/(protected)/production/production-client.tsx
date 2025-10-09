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
import { Plus, Search, Edit, Trash2, Package, Egg, Beef } from "lucide-react"
import PageHeader from "@/components/page-header"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Textarea } from "@/components/ui/textarea"
import { ConfirmationModal } from "@/components/ui/confirmation-modal"

import { ProductionRecord } from "@/types/production"

type ProductionClientProps = {
  initialProduction: ProductionRecord[]
}

export function ProductionClient({ initialProduction }: ProductionClientProps) {
  const [production, setProduction] = useState<ProductionRecord[]>(initialProduction)
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState<ProductionRecord | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const router = useRouter()
  const supabase = createClient()

  const fetchProduction = async () => {
    const { data, error } = await supabase.from("production").select("*,vendors(*)").order("production_date", { ascending: false })
    if (error) {
      console.error("Error fetching production records:", error)
    } else {
      setProduction(data)
    }
  }

  const [formData, setFormData] = useState({
    production_date: new Date().toISOString().split("T")[0],
    product_type: "eggs",
    quantity: "",
    unit: "pieces",
    quality_grade: "A",
    batch_number: "",
    notes: "",
  })

  const resetForm = () => {
    setFormData({
      production_date: new Date().toISOString().split("T")[0],
      product_type: "eggs",
      quantity: "",
      unit: "pieces",
      quality_grade: "A",
      batch_number: "",
      notes: "",
    })
    setEditingRecord(null)
  }

  const handleOpenDialog = (record?: ProductionRecord) => {
    if (record) {
      setEditingRecord(record)
      setFormData({
        production_date: record.production_date,
        product_type: record.product_type,
        quantity: record.quantity.toString(),
        unit: record.unit,
        quality_grade: record.quality_grade || "A",
        batch_number: record.batch_number || "",
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

      const productionData = {
        production_date: formData.production_date,
        product_type: formData.product_type,
        quantity: Number.parseFloat(formData.quantity),
        unit: formData.unit,
        quality_grade: formData.quality_grade || null,
        batch_number: formData.batch_number || null,
        notes: formData.notes || null,
        user_id: user.id,
      }

      if (editingRecord) {
        const { error } = await supabase.from("production").update(productionData).eq("id", editingRecord.id)

        if (error) throw error
      } else {
        const { error } = await supabase.from("production").insert([productionData])

        if (error) throw error
      }
 
      handleCloseDialog()
      await fetchProduction() // Re-fetch data after successful CRUD
      router.refresh()
    } catch (error) {
      console.error("Error saving production record:", error)
    } finally {
      setIsLoading(false)
    }
  }
 
  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from("production").delete().eq("id", id)

      if (error) throw error

      await fetchProduction() // Re-fetch data after successful delete
      router.refresh()
    } catch (error) {
      console.error("Error deleting production record:", error)
    }
  }

  const filteredProduction = production.filter(
    (record) =>
      record.product_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.batch_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.unit.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const paginatedProduction = filteredProduction.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
  const totalPages = Math.ceil(filteredProduction.length / itemsPerPage)

  // Calculate stats
  const todayProduction = production.filter((p) => p.production_date === new Date().toISOString().split("T")[0])
  const totalEggs = production.filter((p) => p.product_type === "eggs").reduce((sum, p) => sum + p.quantity, 0)
  const totalMeat = production.filter((p) => p.product_type === "meat").reduce((sum, p) => sum + p.quantity, 0)
  const weeklyProduction = production.filter((p) => {
    const recordDate = new Date(p.production_date)
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    return recordDate >= weekAgo
  }).length

  return (
    <div className="space-y-6">
      <PageHeader
        title="Production Management"
        description="Track and manage your farm's production records"
        buttonText="Add Production Record"
        onButtonClick={() => handleOpenDialog()}
      />

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Records</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayProduction.length}</div>
            <p className="text-xs text-muted-foreground">Production entries</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Eggs</CardTitle>
            <Egg className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEggs}</div>
            <p className="text-xs text-muted-foreground">Pieces collected</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Meat</CardTitle>
            <Beef className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMeat} kg</div>
            <p className="text-xs text-muted-foreground">Processed meat</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Weekly Records</CardTitle>
            <div className="h-2 w-2 rounded-full bg-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{weeklyProduction}</div>
            <p className="text-xs text-muted-foreground">Last 7 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search production records..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Production Table */}
      <Card>
        <CardHeader>
          <CardTitle>Production Records</CardTitle>
          <CardDescription>Complete history of all production activities on your farm.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Product Type</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Quality</TableHead>
                <TableHead>Batch Number</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedProduction.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    No production records found. Add your first record to get started.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedProduction.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>{new Date(record.production_date).toLocaleDateString()}</TableCell>
                    <TableCell className="capitalize">{record.product_type}</TableCell>
                    <TableCell>
                      {record.quantity} {record.unit}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                          record.quality_grade === "A"
                            ? "bg-green-500/10 text-green-500"
                            : record.quality_grade === "B"
                            ? "bg-yellow-500/10 text-yellow-500"
                            : "bg-red-500/10 text-red-500"
                        }`}
                      >
                        Grade {record.quality_grade || "N/A"}
                      </span>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{record.batch_number || "-"}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(record)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <ConfirmationModal
                          title="Confirm Deletion"
                          description="Are you sure you want to delete this production record? This action cannot be undone."
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
            Showing {paginatedProduction.length} of {filteredProduction.length} production records
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
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingRecord ? "Edit Production Record" : "Add Production Record"}</DialogTitle>
            <DialogDescription>
              {editingRecord ? "Update the production record details." : "Record new production data for your farm."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="production_date">Date *</Label>
                  <Input
                    id="production_date"
                    type="date"
                    value={formData.production_date}
                    onChange={(e) => setFormData({ ...formData, production_date: e.target.value })}
                    required
                  />
                </div>
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
                      <SelectItem value="feathers">Feathers</SelectItem>
                      <SelectItem value="manure">Manure</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
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
                      <SelectItem value="liters">Liters</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quality_grade">Quality</Label>
                  <Select
                    value={formData.quality_grade}
                    onValueChange={(value) => setFormData({ ...formData, quality_grade: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A">Grade A</SelectItem>
                      <SelectItem value="B">Grade B</SelectItem>
                      <SelectItem value="C">Grade C</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="batch_number">Batch Number</Label>
                <Input
                  id="batch_number"
                  value={formData.batch_number}
                  onChange={(e) => setFormData({ ...formData, batch_number: e.target.value })}
                  placeholder="Optional batch identifier"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional notes about this production..."
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : editingRecord ? "Update Record" : "Add Record"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
