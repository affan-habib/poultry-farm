"use client"

import { DashboardCard } from "@/components/dashboard-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/currency"
import {
  DollarSign,
  TrendingUp,
  Egg,
  Bird,
  AlertTriangle,
  Calendar,
  ArrowRight,
  Users,
  Package,
  Activity,
  Plus,
  FileText,
  ShoppingBag,
} from "lucide-react"
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import Link from "next/link"

type Animal = {
  id: string
  animal_type: string
  health_status: string
  weight_kg: number
  age_months: number
}

type Production = {
  id: string
  production_date: string
  product_type: string
  quantity: number
  quality_grade: string
}

type Sale = {
  id: string
  sale_date: string
  product_type: string
  quantity: number
  unit_price: number
  total_amount: number
  payment_status: string
}

type Expense = {
  id: string
  expense_date: string
  category: string
  amount: number
}

type Income = {
  id: string
  income_date: string
  source: string
  amount: number
}

type Employee = {
  id: string
  name: string
  position: string
  status: string
}

type Vendor = {
  id: string
  name: string
  vendor_type: string
}

type Profile = {
  full_name: string
  farm_name: string
  role: string
}

type DashboardClientProps = {
  animals: Animal[]
  production: Production[]
  sales: Sale[]
  expenses: Expense[]
  income: Income[]
  employees: Employee[]
  vendors: Vendor[]
  profile: Profile | null
}

export function DashboardClient({
  animals,
  production,
  sales,
  expenses,
  income,
  employees,
  vendors,
  profile,
}: DashboardClientProps) {
  // Calculate metrics
  const totalAnimals = animals.length
  const healthyAnimals = animals.filter((a) => a.health_status === "healthy").length
  const sickAnimals = animals.filter((a) => a.health_status === "sick" || a.health_status === "quarantine").length

  // Calculate financial metrics (last 30 days)
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split("T")[0]

  const totalRevenue = sales
    .filter((s) => s.sale_date >= thirtyDaysAgoStr)
    .reduce((sum, sale) => sum + Number(sale.total_amount), 0)

  const totalExpenses = expenses
    .filter((e) => e.expense_date >= thirtyDaysAgoStr)
    .reduce((sum, expense) => sum + Number(expense.amount), 0)

  const totalIncome = income
    .filter((i) => i.income_date >= thirtyDaysAgoStr)
    .reduce((sum, inc) => sum + Number(inc.amount), 0)

  const netProfit = totalRevenue + totalIncome - totalExpenses

  // Calculate today's metrics
  const today = new Date().toISOString().split("T")[0]
  const todayProduction = production
    .filter((p) => p.production_date === today)
    .reduce((sum, p) => sum + Number(p.quantity), 0)

  const todaySales = sales.filter((s) => s.sale_date === today).reduce((sum, s) => sum + Number(s.total_amount), 0)

  // Prepare chart data
  const productionTrendData = prepareProductionTrend(production)
  const revenueTrendData = prepareRevenueTrend(sales, income)
  const expensesByCategoryData = prepareExpensesByCategory(expenses)
  const animalHealthData = prepareAnimalHealthData(animals)

  // Active employees
  const activeEmployees = employees.filter((e) => e.status === "active").length

  return (
    <div className="p-6 space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground text-balance">{profile?.farm_name || "Farm"} Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Welcome back, {profile?.full_name || "Admin"}! Here's your farm overview.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1">
            <Calendar className="h-3 w-3" />
            {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </Badge>
        </div>
      </div>


      {/* Key Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          title="Net Profit (30d)"
          value={formatCurrency(netProfit)}
          change={netProfit >= 0 ? `+${((netProfit / (totalRevenue + totalIncome || 1)) * 100).toFixed(1)}%` : "Loss"}
          changeType={netProfit >= 0 ? "positive" : "negative"}
          icon={DollarSign}
        />
        <DashboardCard
          title="Total Revenue (30d)"
          value={formatCurrency(totalRevenue + totalIncome)}
          change={`${sales.filter((s) => s.sale_date >= thirtyDaysAgoStr).length} transactions`}
          changeType="positive"
          icon={TrendingUp}
        />
        <DashboardCard
          title="Today's Production"
          value={todayProduction.toLocaleString()}
          change={todayProduction > 0 ? "Units collected" : "No production yet"}
          changeType={todayProduction > 0 ? "positive" : "neutral"}
          icon={Egg}
        />
        <DashboardCard
          title="Total Livestock"
          value={totalAnimals.toLocaleString()}
          change={`${healthyAnimals} healthy, ${sickAnimals} need attention`}
          changeType={sickAnimals > 0 ? "negative" : "positive"}
          icon={Bird}
        />
      </div>

      {/* Main Charts Section */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Revenue Trend */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Revenue Trend</CardTitle>
              <p className="text-sm text-muted-foreground">Daily revenue over the last 30 days</p>
            </div>
            <Badge variant="secondary">Last 30 days</Badge>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={revenueTrendData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" className="text-xs" tick={{ fontSize: 11 }} />
                <YAxis className="text-xs" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                  formatter={(value: number) => formatCurrency(value)}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#22c55e"
                  strokeWidth={2}
                  fill="url(#colorRevenue)"
                  name="Revenue"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Animal Health Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Animal Health Status</CardTitle>
            <p className="text-sm text-muted-foreground">Current livestock health</p>
          </CardHeader>
          <CardContent>
            {animalHealthData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={animalHealthData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {animalHealthData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {animalHealthData.map((item) => (
                    <div key={item.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="capitalize">{item.name}</span>
                      </div>
                      <span className="font-medium">{item.value}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-[200px] text-muted-foreground">
                No animals recorded
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Secondary Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Production Trend */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Production Trend</CardTitle>
              <p className="text-sm text-muted-foreground">Last 14 days</p>
            </div>
            <Button variant="ghost" size="sm" className="gap-1" asChild>
              <a href="/production">
                View All <ArrowRight className="h-3 w-3" />
              </a>
            </Button>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={productionTrendData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" className="text-xs" tick={{ fontSize: 11 }} />
                <YAxis className="text-xs" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="quantity" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Production" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Expenses by Category */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Expenses by Category</CardTitle>
              <p className="text-sm text-muted-foreground">Last 30 days breakdown</p>
            </div>
            <Button variant="ghost" size="sm" className="gap-1" asChild>
              <a href="/expenses">
                View All <ArrowRight className="h-3 w-3" />
              </a>
            </Button>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={expensesByCategoryData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis type="number" className="text-xs" tick={{ fontSize: 11 }} />
                <YAxis dataKey="category" type="category" className="text-xs" tick={{ fontSize: 11 }} width={80} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                  formatter={(value: number) => formatCurrency(value)}
                />
                <Bar dataKey="amount" fill="#f97316" radius={[0, 4, 4, 0]} name="Amount" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeEmployees}</div>
            <p className="text-xs text-muted-foreground mt-1">Total: {employees.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Registered Vendors</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vendors.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Active partnerships</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sales.filter((s) => s.payment_status === "pending").length}</div>
            <p className="text-xs text-muted-foreground mt-1">Requires follow-up</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Production Records</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{production.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Total entries</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Activity</CardTitle>
            <p className="text-sm text-muted-foreground">Latest updates from your farm operations</p>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {/* Recent Production */}
            {production.slice(0, 3).map((prod) => (
              <div
                key={prod.id}
                className="flex items-start gap-4 p-3 rounded-lg bg-green-500/5 border border-green-500/20"
              >
                <div className="h-2 w-2 rounded-full bg-green-500 mt-2"></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    {Number(prod.quantity).toLocaleString()} {prod.product_type} produced
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(prod.production_date).toLocaleDateString()} • {prod.quality_grade}
                  </p>
                </div>
                <Badge variant="secondary" className="bg-green-500/10 text-green-700 shrink-0">
                  Production
                </Badge>
              </div>
            ))}

            {/* Recent Sales */}
            {sales.slice(0, 2).map((sale) => (
              <div
                key={sale.id}
                className="flex items-start gap-4 p-3 rounded-lg bg-blue-500/5 border border-blue-500/20"
              >
                <div className="h-2 w-2 rounded-full bg-blue-500 mt-2"></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    Sold {Number(sale.quantity).toLocaleString()} units - {formatCurrency(Number(sale.total_amount))}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(sale.sale_date).toLocaleDateString()} • {sale.product_type}
                  </p>
                </div>
                <Badge variant="secondary" className="bg-blue-500/10 text-blue-700 shrink-0">
                  Sales
                </Badge>
              </div>
            ))}

            {production.length === 0 && sales.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                No recent activity. Your seeded data will appear here once the database is populated.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Helper functions
function prepareProductionTrend(production: Production[]) {
  const last14Days = Array.from({ length: 14 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (13 - i))
    return date.toISOString().split("T")[0]
  })

  return last14Days.map((date) => {
    const dayProduction = production
      .filter((p) => p.production_date === date)
      .reduce((sum, p) => sum + Number(p.quantity), 0)

    return {
      date: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      quantity: dayProduction,
    }
  })
}

function prepareRevenueTrend(sales: Sale[], income: Income[]) {
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (29 - i))
    return date.toISOString().split("T")[0]
  })

  return last30Days.map((date) => {
    const daySales = sales.filter((s) => s.sale_date === date).reduce((sum, s) => sum + Number(s.total_amount), 0)

    const dayIncome = income.filter((i) => i.income_date === date).reduce((sum, i) => sum + Number(i.amount), 0)

    return {
      date: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      revenue: daySales + dayIncome,
    }
  })
}

function prepareExpensesByCategory(expenses: Expense[]) {
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split("T")[0]

  const recentExpenses = expenses.filter((e) => e.expense_date >= thirtyDaysAgoStr)

  const categoryTotals = recentExpenses.reduce(
    (acc, expense) => {
      const category = expense.category || "other"
      acc[category] = (acc[category] || 0) + Number(expense.amount)
      return acc
    },
    {} as Record<string, number>,
  )

  return Object.entries(categoryTotals)
    .map(([category, amount]) => ({
      category: category.charAt(0).toUpperCase() + category.slice(1),
      amount,
    }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 6)
}

function prepareAnimalHealthData(animals: Animal[]) {
  const healthCounts = animals.reduce(
    (acc, animal) => {
      const status = animal.health_status || "unknown"
      acc[status] = (acc[status] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const colorMap: Record<string, string> = {
    healthy: "#22c55e",
    sick: "#ef4444",
    quarantine: "#f97316",
    under_treatment: "#eab308",
    unknown: "#6b7280",
  }

  return Object.entries(healthCounts).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1).replace("_", " "),
    value,
    color: colorMap[name] || "#6b7280",
  }))
}
