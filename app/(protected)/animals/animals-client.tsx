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
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Search, Edit, Trash2, Bird } from "lucide-react"
import { formatCurrency } from "@/lib/currency"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Textarea } from "@/components/ui/textarea"
import { ConfirmationModal } from "@/components/ui/confirmation-modal"
import PageHeader from "@/components/page-header"

import { Animal, Vendor } from "@/types/animal"

type AnimalsClientProps = {
  initialAnimals: Animal[]
  vendors: Vendor[]
}

export function AnimalsClient({ initialAnimals, vendors }: AnimalsClientProps) {
  const [animals, setAnimals] = useState<Animal[]>(initialAnimals)
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingAnimal, setEditingAnimal] = useState<Animal | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const router = useRouter()
  const supabase = createClient()

  const fetchAnimals = async () => {
    const { data, error } = await supabase.from("animals").select("*,vendors(*)").order("date_acquired", { ascending: false })
    if (error) {
      console.error("Error fetching animals:", error)
    } else {
      setAnimals(data)
    }
  }

  const [formData, setFormData] = useState({
    tag_number: "",
    animal_type: "chicken",
    breed: "",
    age_months: "",
    weight_kg: "",
    health_status: "healthy",
    location: "",
    date_acquired: new Date().toISOString().split("T")[0],
    purchase_price: "",
    vendor_id: "",
    gender: "",
    notes: "",
  })

  const resetForm = () => {
    setFormData({
      tag_number: "",
      animal_type: "chicken",
      breed: "",
      age_months: "",
      weight_kg: "",
      health_status: "healthy",
      location: "",
      date_acquired: new Date().toISOString().split("T")[0],
      purchase_price: "",
      vendor_id: "",
      gender: "",
      notes: "",
    })
    setEditingAnimal(null)
  }

  const handleOpenDialog = (animal?: Animal) => {
    if (animal) {
      setEditingAnimal(animal)
      setFormData({
        tag_number: animal.tag_number,
        animal_type: animal.animal_type,
        breed: animal.breed,
        age_months: animal.age_months?.toString() || "",
        weight_kg: animal.weight_kg?.toString() || "",
        health_status: animal.health_status,
        location: animal.location || "",
        date_acquired: animal.date_acquired,
        purchase_price: animal.purchase_price?.toString() || "",
        vendor_id: animal.vendor_id || "",
        gender: "",
        notes: animal.notes || "",
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

      const animalData = {
        tag_number: formData.tag_number,
        animal_type: formData.animal_type,
        breed: formData.breed,
        age_months: formData.age_months ? Number.parseInt(formData.age_months) : null,
        weight_kg: formData.weight_kg ? Number.parseFloat(formData.weight_kg) : null,
        health_status: formData.health_status,
        location: formData.location || null,
        date_acquired: formData.date_acquired,
        purchase_price: formData.purchase_price ? Number.parseFloat(formData.purchase_price) : null,
        vendor_id: formData.vendor_id || null,
        notes: formData.notes || null,
        user_id: user.id,
      }

      if (editingAnimal) {
        const { error } = await supabase.from("animals").update(animalData).eq("id", editingAnimal.id)

        if (error) throw error
      } else {
        const { error } = await supabase.from("animals").insert([animalData])

        if (error) throw error
      }
 
      handleCloseDialog()
      await fetchAnimals() // Re-fetch data after successful CRUD
      router.refresh()
    } catch (error) {
      console.error("Error saving animal:", error)
    } finally {
      setIsLoading(false)
    }
  }
 
  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from("animals").delete().eq("id", id)

      if (error) throw error

      await fetchAnimals() // Re-fetch data after successful delete
      router.refresh()
    } catch (error) {
      console.error("Error deleting animal:", error)
    }
  }

  const filteredAnimals = animals.filter(
    (animal) =>
      animal.tag_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      animal.breed.toLowerCase().includes(searchTerm.toLowerCase()) ||
      animal.animal_type.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const paginatedAnimals = filteredAnimals.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const totalPages = Math.ceil(filteredAnimals.length / itemsPerPage)

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "bg-green-500/10 text-green-500 border-green-500/20"
      case "sick":
        return "bg-red-500/10 text-red-500 border-red-500/20"
      case "quarantine":
        return "bg-orange-500/10 text-orange-500 border-orange-500/20"
      case "sold":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20"
      case "deceased":
        return "bg-gray-500/10 text-gray-500 border-gray-500/20"
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20"
    }
  }

  const totalAnimals = animals.length
  const healthyAnimals = animals.filter((a) => a.health_status === "healthy").length
  const sickAnimals = animals.filter((a) => a.health_status === "sick" || a.health_status === "quarantine").length
  const totalValue = animals.reduce((sum, animal) => sum + (animal.purchase_price || 0), 0)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Animals Management"
        description="Manage your poultry inventory and health records"
        buttonText="Add Animal"
        onButtonClick={() => handleOpenDialog()}
      />

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Animals</CardTitle>
            <Bird className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAnimals}</div>
            <p className="text-xs text-muted-foreground">Active livestock</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Healthy Animals</CardTitle>
            <div className="h-2 w-2 rounded-full bg-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{healthyAnimals}</div>
            <p className="text-xs text-muted-foreground">In good health</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Need Attention</CardTitle>
            <div className="h-2 w-2 rounded-full bg-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sickAnimals}</div>
            <p className="text-xs text-muted-foreground">Sick or under treatment</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <span className="text-xs text-muted-foreground">৳</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalValue)}</div>
            <p className="text-xs text-muted-foreground">Investment value</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search animals..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Animals Table */}
      <div>
        <CardHeader className="px-0 pb-4">
          <CardTitle>Animal Records</CardTitle>
          <CardDescription>
            Complete list of all animals in your farm with their details and health status.
          </CardDescription>
        </CardHeader>
        <Card>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tag Number</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Breed</TableHead>
                  <TableHead>Age (months)</TableHead>
                  <TableHead>Weight (kg)</TableHead>
                  <TableHead>Health Status</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Cost</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedAnimals.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-muted-foreground">
                      No animals found. Add your first animal to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedAnimals.map((animal, index) => (
                    <TableRow key={animal.id} className={index % 2 === 0 ? "bg-gray-100" : ""}>
                      <TableCell className="font-medium">{animal.tag_number}</TableCell>
                      <TableCell className="capitalize">{animal.animal_type}</TableCell>
                      <TableCell>{animal.breed}</TableCell>
                      <TableCell>{animal.age_months || "-"}</TableCell>
                      <TableCell>{animal.weight_kg || "-"}</TableCell>
                      <TableCell>
                        <Badge className={getHealthStatusColor(animal.health_status)}>{animal.health_status}</Badge>
                      </TableCell>
                      <TableCell>{animal.location || "-"}</TableCell>
                      <TableCell>{animal.purchase_price ? formatCurrency(animal.purchase_price) : "-"}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(animal)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <ConfirmationModal
                            title="Confirm Deletion"
                            description="Are you sure you want to delete this animal? This action cannot be undone."
                            onConfirm={() => handleDelete(animal.id)}
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
              Showing {paginatedAnimals.length} of {filteredAnimals.length} animals
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
            <DialogTitle>{editingAnimal ? "Edit Animal" : "Add New Animal"}</DialogTitle>
            <DialogDescription>
              {editingAnimal ? "Update the details for this animal." : "Enter the details for the new animal."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tag_number">Tag Number *</Label>
                  <Input
                    id="tag_number"
                    value={formData.tag_number}
                    onChange={(e) => setFormData({ ...formData, tag_number: e.target.value })}
                    placeholder="e.g., CH001"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="animal_type">Animal Type *</Label>
                  <Select
                    value={formData.animal_type}
                    onValueChange={(value) => setFormData({ ...formData, animal_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="chicken">Chicken</SelectItem>
                      <SelectItem value="duck">Duck</SelectItem>
                      <SelectItem value="turkey">Turkey</SelectItem>
                      <SelectItem value="goose">Goose</SelectItem>
                      <SelectItem value="quail">Quail</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="breed">Breed *</Label>
                  <Input
                    id="breed"
                    value={formData.breed}
                    onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
                    placeholder="e.g., Rhode Island Red"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g., Coop A"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="age_months">Age (months)</Label>
                  <Input
                    id="age_months"
                    type="number"
                    value={formData.age_months}
                    onChange={(e) => setFormData({ ...formData, age_months: e.target.value })}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weight_kg">Weight (kg)</Label>
                  <Input
                    id="weight_kg"
                    type="number"
                    step="0.1"
                    value={formData.weight_kg}
                    onChange={(e) => setFormData({ ...formData, weight_kg: e.target.value })}
                    placeholder="0.0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="purchase_price">Cost (৳)</Label>
                  <Input
                    id="purchase_price"
                    type="number"
                    step="0.01"
                    value={formData.purchase_price}
                    onChange={(e) => setFormData({ ...formData, purchase_price: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="health_status">Health Status *</Label>
                  <Select
                    value={formData.health_status}
                    onValueChange={(value) => setFormData({ ...formData, health_status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="healthy">Healthy</SelectItem>
                      <SelectItem value="sick">Sick</SelectItem>
                      <SelectItem value="quarantine">Quarantine</SelectItem>
                      <SelectItem value="sold">Sold</SelectItem>
                      <SelectItem value="deceased">Deceased</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date_acquired">Date Acquired *</Label>
                  <Input
                    id="date_acquired"
                    type="date"
                    value={formData.date_acquired}
                    onChange={(e) => setFormData({ ...formData, date_acquired: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="vendor_id">Vendor (Supplier)</Label>
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
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional notes about this animal..."
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : editingAnimal ? "Update Animal" : "Add Animal"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
