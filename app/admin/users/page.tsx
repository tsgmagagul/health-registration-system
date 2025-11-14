"use client"

import { useState, useEffect } from "react"
import { apiService } from "@/lib/api" // your API helper
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { UserPlus, RefreshCw, Edit, Trash } from "lucide-react"
import { toast } from "react-hot-toast"

interface User {
  id: string
  username: string
  email: string
  role: "admin"|"clerk" | "nurse" | "doctor"
  first_name: string
  last_name: string
  facility_id?: string
}

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    role: "nurse",
    first_name: "",
    last_name: "",
    facility_id: "",
  })

  // Fetch users from the API
  const fetchUsers = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true)
      else setLoading(true)

      const response = await apiService.getUsers()
      setUsers(response.data)
    } catch (err) {
      console.error(err)
      toast.error("Failed to load users")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await apiService.createUser(form)
      toast.success("User created successfully")
      setForm({
        username: "",
        email: "",
        password: "",
        role: "nurse",
        first_name: "",
        last_name: "",
        facility_id: "",
      })
      fetchUsers(true)
    } catch (err: any) {
      console.error(err)
      toast.error(err?.message || "Failed to create user")
    }
  }

  const deleteUser = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return
    try {
      await apiService.deleteUser(id)
      toast.success("User deleted successfully")
      setUsers((prev) => prev.filter((u) => u.id !== id))
    } catch (err) {
      console.error(err)
      toast.error("Failed to delete user")
    }
  }

  if (loading) return <div className="text-center py-20">Loading users...</div>

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>Manage users in the system</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4" onSubmit={handleSubmit}>
            <Input name="username" placeholder="Username" value={form.username} onChange={handleChange} required />
            <Input name="email" placeholder="Email" value={form.email} onChange={handleChange} required />
            <Input name="password" placeholder="Password" type="password" value={form.password} onChange={handleChange} required />
            <Input name="first_name" placeholder="First Name" value={form.first_name} onChange={handleChange} />
            <Input name="last_name" placeholder="Last Name" value={form.last_name} onChange={handleChange} />
            <Input name="facility_id" placeholder="Facility ID" value={form.facility_id} onChange={handleChange} />
            <select name="role" value={form.role} onChange={handleChange}>
              <option value="admin">Admin</option>
               <option value="doctor">Clerk</option>
              <option value="nurse">Nurse</option>
              <option value="doctor">Doctor</option>
            </select>
            <Button type="submit" className="mt-2 flex items-center gap-2">
              <UserPlus size={16} /> Create User
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            Users
            <Button variant="ghost" size="sm" onClick={() => fetchUsers(true)} className="ml-4">
              <RefreshCw size={16} /> Refresh
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2">
            {users.map((user) => (
              <div key={user.id} className="flex justify-between items-center p-2 border rounded">
                <div>
                  <div className="font-medium">{user.first_name} {user.last_name}</div>
                  <div className="text-sm text-muted-foreground">{user.email}</div>
                  <Badge variant="outline" className="mt-1">{user.role}</Badge>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm"><Edit size={16} /></Button>
                  <Button variant="ghost" size="sm" onClick={() => deleteUser(user.id)}><Trash size={16} /></Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
