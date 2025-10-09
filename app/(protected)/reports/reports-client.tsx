"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts"
import { Download, FileText, TrendingUp, TrendingDown, DollarSign, Calendar } from "lucide-react"
import { formatCurrency } from "@/lib/currency"
import PageHeader from "@/components/page-header"

type Animal = {
  id: string
  animal_type: string
  quantity: number
  health_status: string
}

type Production = {
  id: string
  production_date: string
  product_type: string
  quantity: number
}

type Sale = {
  id: string
  sale_date: string
  product_type: string
  quantity: number
  unit_price: number
  total_amount: number
}

type Expense = {
  id: string
  expense_date: string
  category: string
  amount: number
}

type ReportsClientProps = {
  animals: Animal[]
  production: Production[]
  sales: Sale[]
  expenses: Expense[]
}

export function ReportsClient({ animals, production, sales, expenses }: ReportsClientProps) {
  const [selectedPeriod, setSelectedPeriod] = useState("6months")
  const [selectedReport, setSelectedReport] = useState("overview")

  const handleExportReport = (format: "pdf" | "excel" | "csv") => {
    console.log(`Exporting report as ${format}`)
    // In a real app, this would trigger the actual export
  }

  // Calculate financial metrics
  const totalIncome = sales.reduce((sum, sale) => sum + sale.total_amount, 0)
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0)
  const netProfit = totalIncome - totalExpenses
  const profitMargin = totalIncome > 0 ? ((netProfit / totalIncome) * 100).toFixed(1) : "0.0"

  // Prepare monthly production data
  const monthlyProductionData = prepareMonthlyProductionData(production, sales)

  // Prepare expense breakdown
  const expenseBreakdownData = prepareExpenseBreakdown(expenses)

  // Prepare income sources (by product type)
  const incomeSourcesData = prepareIncomeSources(sales)

  // Prepare profit/loss data
  const profitLossData = prepareProfitLossData(sales, expenses)

  // Prepare animal health data
  const animalHealthData = prepareAnimalHealthData(animals)

  return (
    <div className="flex-1 space-y-6 p-6">
      <PageHeader title="Reports & Analytics" description="Comprehensive insights into your farm's performance" />

      {/* Key Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(totalIncome)}</div>
            <p className="text-xs text-muted-foreground">{sales.length} sales transactions</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(totalExpenses)}</div>
            <p className="text-xs text-muted-foreground">{expenses.length} expense records</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${netProfit >= 0 ? "text-green-600" : "text-red-600"}`}>
              {formatCurrency(netProfit)}
            </div>
            <p className="text-xs text-muted-foreground">Income - Expenses</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profit Margin</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profitMargin}%</div>
            <p className="text-xs text-muted-foreground">Net profit / Total income</p>
          </CardContent>
        </Card>
      </div>

      {/* Report Tabs */}
      <Tabs value={selectedReport} onValueChange={setSelectedReport} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="production">Production</TabsTrigger>
          <TabsTrigger value="health">Animal Health</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Production Trends</CardTitle>
                <CardDescription>Production volume over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyProductionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="quantity" stroke="#22c55e" strokeWidth={2} name="Production" />
                    <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} name="Revenue" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Profit & Loss Trend</CardTitle>
                <CardDescription>Monthly income vs expenses</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={profitLossData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="income" stackId="1" stroke="#22c55e" fill="#22c55e" />
                    <Area type="monotone" dataKey="expenses" stackId="2" stroke="#ef4444" fill="#ef4444" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="financial" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Expense Breakdown</CardTitle>
                <CardDescription>Distribution of operational costs</CardDescription>
              </CardHeader>
              <CardContent>
                {expenseBreakdownData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={expenseBreakdownData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ category, percent }) => `${category} ${((percent as number) * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="amount"
                      >
                        {expenseBreakdownData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                    No expense data available
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Income Sources</CardTitle>
                <CardDescription>Revenue breakdown by product type</CardDescription>
              </CardHeader>
              <CardContent>
                {incomeSourcesData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={incomeSourcesData} layout="horizontal">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="source" type="category" width={100} />
                      <Tooltip />
                      <Bar dataKey="amount" fill="#22c55e" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                    No sales data available
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Financial Summary Table */}
          <Card>
            <CardHeader>
              <CardTitle>Financial Summary</CardTitle>
              <CardDescription>Detailed breakdown of income and expenses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-green-600 mb-2">Income Sources</h4>
                  <div className="grid gap-2">
                    {incomeSourcesData.length > 0 ? (
                      incomeSourcesData.map((item) => (
                        <div key={item.source} className="flex justify-between items-center">
                          <span className="capitalize">{item.source}</span>
                          <Badge variant="secondary">{formatCurrency(item.amount)}</Badge>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No income data available</p>
                    )}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-red-600 mb-2">Expense Categories</h4>
                  <div className="grid gap-2">
                    {expenseBreakdownData.length > 0 ? (
                      expenseBreakdownData.map((item) => (
                        <div key={item.category} className="flex justify-between items-center">
                          <span className="capitalize">{item.category}</span>
                          <Badge variant="outline">{formatCurrency(item.amount)}</Badge>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No expense data available</p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="production" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Production Volume</CardTitle>
                <CardDescription>Monthly production quantities</CardDescription>
              </CardHeader>
              <CardContent>
                {monthlyProductionData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={monthlyProductionData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="quantity" fill="#22c55e" name="Production Quantity" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                    No production data available
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Production Metrics</CardTitle>
                <CardDescription>Key production statistics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Total Production Records</span>
                  <Badge variant="secondary">{production.length}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Total Quantity Produced</span>
                  <Badge variant="secondary">
                    {production.reduce((sum, p) => sum + p.quantity, 0).toLocaleString()}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Total Sales Records</span>
                  <Badge variant="secondary">{sales.length}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Total Revenue</span>
                  <Badge className="bg-green-500/10 text-green-500">{formatCurrency(totalIncome)}</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="health" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Animal Health Status</CardTitle>
                <CardDescription>Current health distribution of livestock</CardDescription>
              </CardHeader>
              <CardContent>
                {animalHealthData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={animalHealthData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ status, percent }) => `${status} ${((percent as number) * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {animalHealthData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                    No animal data available
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Health Metrics</CardTitle>
                <CardDescription>Key health indicators</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Total Animals</span>
                  <Badge variant="secondary">{animals.reduce((sum, a) => sum + a.quantity, 0)}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Healthy Animals</span>
                  <Badge className="bg-green-500/10 text-green-500">
                    {animals.filter((a) => a.health_status === "healthy").reduce((sum, a) => sum + a.quantity, 0)}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Under Treatment</span>
                  <Badge className="bg-yellow-500/10 text-yellow-500">
                    {animals
                      .filter((a) => a.health_status === "under_treatment")
                      .reduce((sum, a) => sum + a.quantity, 0)}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Sick Animals</span>
                  <Badge className="bg-red-500/10 text-red-500">
                    {animals.filter((a) => a.health_status === "sick").reduce((sum, a) => sum + a.quantity, 0)}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Export Options */}
      <Card>
        <CardHeader>
          <CardTitle>Export Reports</CardTitle>
          <CardDescription>Download detailed reports in various formats</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => handleExportReport("pdf")}>
              <FileText className="h-4 w-4 mr-2" />
              Export as PDF
            </Button>
            <Button variant="outline" onClick={() => handleExportReport("excel")}>
              <Download className="h-4 w-4 mr-2" />
              Export as Excel
            </Button>
            <Button variant="outline" onClick={() => handleExportReport("csv")}>
              <Download className="h-4 w-4 mr-2" />
              Export as CSV
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Helper functions
function prepareMonthlyProductionData(production: Production[], sales: Sale[]) {
  const monthlyData: Record<string, { quantity: number; revenue: number }> = {}

  production.forEach((prod) => {
    const month = new Date(prod.production_date).toLocaleDateString("en-US", { month: "short" })
    if (!monthlyData[month]) {
      monthlyData[month] = { quantity: 0, revenue: 0 }
    }
    monthlyData[month].quantity += prod.quantity
  })

  sales.forEach((sale) => {
    const month = new Date(sale.sale_date).toLocaleDateString("en-US", { month: "short" })
    if (!monthlyData[month]) {
      monthlyData[month] = { quantity: 0, revenue: 0 }
    }
    monthlyData[month].revenue += sale.total_amount
  })

  return Object.entries(monthlyData).map(([month, data]) => ({
    month,
    ...data,
  }))
}

function prepareExpenseBreakdown(expenses: Expense[]) {
  const categoryTotals: Record<string, number> = {}

  expenses.forEach((expense) => {
    categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount
  })

  const colors: Record<string, string> = {
    feed: "#f97316",
    veterinary: "#ef4444",
    equipment: "#3b82f6",
    utilities: "#eab308",
    labor: "#22c55e",
    maintenance: "#a855f7",
    transportation: "#06b6d4",
    other: "#6b7280",
  }

  return Object.entries(categoryTotals).map(([category, amount]) => ({
    category,
    amount,
    color: colors[category] || "#6b7280",
  }))
}

function prepareIncomeSources(sales: Sale[]) {
  const sourceTotals: Record<string, number> = {}

  sales.forEach((sale) => {
    sourceTotals[sale.product_type] = (sourceTotals[sale.product_type] || 0) + sale.total_amount
  })

  return Object.entries(sourceTotals).map(([source, amount]) => ({
    source,
    amount,
  }))
}

function prepareProfitLossData(sales: Sale[], expenses: Expense[]) {
  const monthlyData: Record<string, { income: number; expenses: number }> = {}

  sales.forEach((sale) => {
    const month = new Date(sale.sale_date).toLocaleDateString("en-US", { month: "short" })
    if (!monthlyData[month]) {
      monthlyData[month] = { income: 0, expenses: 0 }
    }
    monthlyData[month].income += sale.total_amount
  })

  expenses.forEach((expense) => {
    const month = new Date(expense.expense_date).toLocaleDateString("en-US", { month: "short" })
    if (!monthlyData[month]) {
      monthlyData[month] = { income: 0, expenses: 0 }
    }
    monthlyData[month].expenses += expense.amount
  })

  return Object.entries(monthlyData).map(([month, data]) => ({
    month,
    ...data,
    profit: data.income - data.expenses,
  }))
}

function prepareAnimalHealthData(animals: Animal[]) {
  const healthCounts: Record<string, number> = {}

  animals.forEach((animal) => {
    healthCounts[animal.health_status] = (healthCounts[animal.health_status] || 0) + animal.quantity
  })

  const colors: Record<string, string> = {
    healthy: "#22c55e",
    under_treatment: "#eab308",
    sick: "#ef4444",
    quarantine: "#f97316",
  }

  return Object.entries(healthCounts).map(([status, count]) => ({
    status: status.replace("_", " "),
    count,
    color: colors[status] || "#6b7280",
  }))
}
