"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Bell, Shield, Database, Plus, Edit, Trash2, Save, Building, MapPin, Phone, Mail } from "lucide-react"
import PageHeader from "@/components/page-header"

interface Employee {
  id: string
  name: string
  email: string
  role: "Manager" | "Worker" | "Veterinarian" | "Admin"
  phone: string
  status: "Active" | "Inactive"
  joinDate: string
}

const mockEmployees: Employee[] = [
  {
    id: "1",
    name: "John Smith",
    email: "john@farm.com",
    role: "Manager",
    phone: "555-0123",
    status: "Active",
    joinDate: "2023-01-15",
  },
  {
    id: "2",
    name: "Sarah Johnson",
    email: "sarah@farm.com",
    role: "Veterinarian",
    phone: "555-0456",
    status: "Active",
    joinDate: "2023-03-20",
  },
  {
    id: "3",
    name: "Mike Wilson",
    email: "mike@farm.com",
    role: "Worker",
    phone: "555-0789",
    status: "Active",
    joinDate: "2023-06-10",
  },
]

export default function SettingsPage() {
  const [employees, setEmployees] = useState<Employee[]>(mockEmployees)
  const [isAddEmployeeOpen, setIsAddEmployeeOpen] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)
  const [employeeFormData, setEmployeeFormData] = useState<Partial<Employee>>({})

  // Farm settings state
  const [farmSettings, setFarmSettings] = useState({
    name: "Green Valley Poultry Farm",
    address: "123 Farm Road, Rural County, State 12345",
    phone: "555-FARM-001",
    email: "info@greenvalleyfarm.com",
    description: "A sustainable poultry farm focused on organic egg and meat production.",
    currency: "USD",
    timezone: "America/New_York",
  })

  // Notification settings
  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    smsAlerts: false,
    lowInventoryAlerts: true,
    healthAlerts: true,
    productionAlerts: true,
    financialAlerts: false,
  })

  const handleAddEmployee = () => {
    if (employeeFormData.name && employeeFormData.email && employeeFormData.role) {
      const newEmployee: Employee = {
        id: Date.now().toString(),
        name: employeeFormData.name,
        email: employeeFormData.email,
        role: employeeFormData.role as Employee["role"],
        phone: employeeFormData.phone || "",
        status: "Active",
        joinDate: new Date().toISOString().split("T")[0],
      }
      setEmployees([...employees, newEmployee])
      setEmployeeFormData({})
      setIsAddEmployeeOpen(false)
    }
  }

  const handleEditEmployee = () => {
    if (editingEmployee && employeeFormData.name && employeeFormData.email && employeeFormData.role) {
      const updatedEmployees = employees.map((emp) =>
        emp.id === editingEmployee.id ? { ...emp, ...employeeFormData } : emp,
      )
      setEmployees(updatedEmployees)
      setEditingEmployee(null)
      setEmployeeFormData({})
    }
  }

  const handleDeleteEmployee = (id: string) => {
    setEmployees(employees.filter((emp) => emp.id !== id))
  }

  const openEditDialog = (employee: Employee) => {
    setEditingEmployee(employee)
    setEmployeeFormData(employee)
  }

  const getRoleColor = (role: Employee["role"]) => {
    const colors = {
      Admin: "bg-red-500/10 text-red-500 border-red-500/20",
      Manager: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      Veterinarian: "bg-green-500/10 text-green-500 border-green-500/20",
      Worker: "bg-gray-500/10 text-gray-500 border-gray-500/20",
    }
    return colors[role]
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      <PageHeader title="Settings" description="Manage your farm settings and user accounts" />

      <Tabs defaultValue="farm" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="farm">Farm Details</TabsTrigger>
          <TabsTrigger value="employees">Employees</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="farm" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Farm Information
              </CardTitle>
              <CardDescription>Update your farm's basic information and settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="farmName">Farm Name</Label>
                  <Input
                    id="farmName"
                    value={farmSettings.name}
                    onChange={(e) => setFarmSettings({ ...farmSettings, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select
                    value={farmSettings.currency}
                    onValueChange={(value) => setFarmSettings({ ...farmSettings, currency: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD - US Dollar</SelectItem>
                      <SelectItem value="EUR">EUR - Euro</SelectItem>
                      <SelectItem value="GBP">GBP - British Pound</SelectItem>
                      <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Textarea
                    id="address"
                    value={farmSettings.address}
                    onChange={(e) => setFarmSettings({ ...farmSettings, address: e.target.value })}
                    className="pl-10"
                    rows={2}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="phone"
                      value={farmSettings.phone}
                      onChange={(e) => setFarmSettings({ ...farmSettings, phone: e.target.value })}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={farmSettings.email}
                      onChange={(e) => setFarmSettings({ ...farmSettings, email: e.target.value })}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Farm Description</Label>
                <Textarea
                  id="description"
                  value={farmSettings.description}
                  onChange={(e) => setFarmSettings({ ...farmSettings, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Select
                  value={farmSettings.timezone}
                  onValueChange={(value) => setFarmSettings({ ...farmSettings, timezone: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="America/New_York">Eastern Time</SelectItem>
                    <SelectItem value="America/Chicago">Central Time</SelectItem>
                    <SelectItem value="America/Denver">Mountain Time</SelectItem>
                    <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button className="gap-2">
                <Save className="h-4 w-4" />
                Save Changes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="employees" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Employee Management</h3>
              <p className="text-sm text-muted-foreground">Manage farm staff and their access levels</p>
            </div>
            <Dialog open={isAddEmployeeOpen} onOpenChange={setIsAddEmployeeOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Employee
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Employee</DialogTitle>
                  <DialogDescription>Enter the details for the new employee.</DialogDescription>
                </DialogHeader>
                <EmployeeForm formData={employeeFormData} setFormData={setEmployeeFormData} />
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddEmployeeOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddEmployee}>Add Employee</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Join Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employees.map((employee) => (
                    <TableRow key={employee.id}>
                      <TableCell className="font-medium">{employee.name}</TableCell>
                      <TableCell>{employee.email}</TableCell>
                      <TableCell>
                        <Badge className={getRoleColor(employee.role)}>{employee.role}</Badge>
                      </TableCell>
                      <TableCell>{employee.phone}</TableCell>
                      <TableCell>
                        <Badge variant={employee.status === "Active" ? "secondary" : "outline"}>
                          {employee.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(employee.joinDate).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" onClick={() => openEditDialog(employee)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteEmployee(employee.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Edit Employee Dialog */}
          <Dialog open={!!editingEmployee} onOpenChange={() => setEditingEmployee(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Employee</DialogTitle>
                <DialogDescription>Update the employee details.</DialogDescription>
              </DialogHeader>
              <EmployeeForm formData={employeeFormData} setFormData={setEmployeeFormData} />
              <DialogFooter>
                <Button variant="outline" onClick={() => setEditingEmployee(null)}>
                  Cancel
                </Button>
                <Button onClick={handleEditEmployee}>Update Employee</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
              <CardDescription>Configure how you want to receive alerts and notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Alerts</Label>
                    <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                  </div>
                  <Switch
                    checked={notifications.emailAlerts}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, emailAlerts: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>SMS Alerts</Label>
                    <p className="text-sm text-muted-foreground">Receive notifications via text message</p>
                  </div>
                  <Switch
                    checked={notifications.smsAlerts}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, smsAlerts: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Low Inventory Alerts</Label>
                    <p className="text-sm text-muted-foreground">Get notified when feed or supplies are low</p>
                  </div>
                  <Switch
                    checked={notifications.lowInventoryAlerts}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, lowInventoryAlerts: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Health Alerts</Label>
                    <p className="text-sm text-muted-foreground">Notifications about animal health issues</p>
                  </div>
                  <Switch
                    checked={notifications.healthAlerts}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, healthAlerts: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Production Alerts</Label>
                    <p className="text-sm text-muted-foreground">Updates on production milestones and issues</p>
                  </div>
                  <Switch
                    checked={notifications.productionAlerts}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, productionAlerts: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Financial Alerts</Label>
                    <p className="text-sm text-muted-foreground">Notifications about payments and financial targets</p>
                  </div>
                  <Switch
                    checked={notifications.financialAlerts}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, financialAlerts: checked })}
                  />
                </div>
              </div>

              <Button className="gap-2">
                <Save className="h-4 w-4" />
                Save Preferences
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Settings
              </CardTitle>
              <CardDescription>Manage your account security and data backup settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Change Password</h4>
                  <div className="space-y-2">
                    <Input type="password" placeholder="Current password" />
                    <Input type="password" placeholder="New password" />
                    <Input type="password" placeholder="Confirm new password" />
                    <Button variant="outline">Update Password</Button>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Data Backup</h4>
                  <p className="text-sm text-muted-foreground mb-4">Regularly backup your farm data to prevent loss</p>
                  <div className="flex gap-2">
                    <Button variant="outline" className="gap-2 bg-transparent">
                      <Database className="h-4 w-4" />
                      Backup Now
                    </Button>
                    <Button variant="outline">Schedule Automatic Backups</Button>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Session Management</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Manage your active sessions and logout from other devices
                  </p>
                  <Button variant="outline">View Active Sessions</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function EmployeeForm({
  formData,
  setFormData,
}: {
  formData: Partial<Employee>
  setFormData: (data: Partial<Employee>) => void
}) {
  return (
    <div className="grid gap-4 py-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            value={formData.name || ""}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Employee name"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email || ""}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="employee@farm.com"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="role">Role</Label>
          <Select
            value={formData.role || ""}
            onValueChange={(value) => setFormData({ ...formData, role: value as Employee["role"] })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Admin">Admin</SelectItem>
              <SelectItem value="Manager">Manager</SelectItem>
              <SelectItem value="Veterinarian">Veterinarian</SelectItem>
              <SelectItem value="Worker">Worker</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            value={formData.phone || ""}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="555-0123"
          />
        </div>
      </div>
    </div>
  )
}
