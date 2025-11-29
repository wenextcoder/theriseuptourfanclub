"use client"

import { useEffect, useState } from "react"
import dynamic from 'next/dynamic'
import { supabase, type MembershipSubmission } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Download, LogOut, Search, Users } from "lucide-react"
import { format } from "date-fns"

function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [submissions, setSubmissions] = useState<MembershipSubmission[]>([])
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      setIsAuthenticated(!!session)
      if (session) {
        fetchSubmissions()
      }
    } catch (error) {
      console.error('Error checking user:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
    } else if (data.session) {
      setIsAuthenticated(true)
      fetchSubmissions()
    }

    setLoading(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setIsAuthenticated(false)
    setSubmissions([])
  }

  const fetchSubmissions = async () => {
    const { data, error } = await supabase
      .from('memberships')
      .select('*')
      .order('created_at', { ascending: false })

    if (data && !error) {
      setSubmissions(data)
    }
  }

  const exportToCSV = () => {
    const headers = [
      'ID',
      'Submitted Date',
      'First Name',
      'Middle Name',
      'Last Name',
      'Nickname',
      'Email',
      'Phone',
      'Birth Date',
      'Address 1',
      'Address 2',
      'City',
      'State',
      'Zip Code',
      'Birth City/State',
      'Referral Source',
      'Referrer Name',
      'DBN Member',
      'Membership Status',
      'Membership Level',
      'Shirt Size',
      'Jacket Size',
      'Coupon Code',
      'Total Price',
    ]

    const csvData = submissions.map(sub => [
      sub.id,
      format(new Date(sub.created_at), 'MM/dd/yyyy HH:mm:ss'),
      sub.first_name,
      sub.middle_name || '',
      sub.last_name,
      sub.nickname,
      sub.email,
      sub.phone,
      sub.birth_date,
      sub.address1,
      sub.address2 || '',
      sub.city,
      sub.state,
      sub.zip_code,
      sub.birth_city_state,
      sub.referral_source,
      sub.referrer_name || '',
      sub.is_dbn_member,
      sub.membership_status,
      sub.membership_level,
      sub.shirt_size,
      sub.jacket_size,
      sub.coupon_code || '',
      sub.total_price,
    ])

    const csv = [
      headers.join(','),
      ...csvData.map(row => 
        row.map(cell => 
          typeof cell === 'string' && cell.includes(',') 
            ? `"${cell}"` 
            : cell
        ).join(',')
      )
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `membership-submissions-${format(new Date(), 'yyyy-MM-dd')}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const filteredSubmissions = submissions.filter(sub => {
    const search = searchTerm.toLowerCase()
    return (
      sub.first_name.toLowerCase().includes(search) ||
      sub.last_name.toLowerCase().includes(search) ||
      sub.email.toLowerCase().includes(search) ||
      sub.phone.includes(search)
    )
  })

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg text-muted-foreground">Loading...</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <img 
              src="/RISEUP.png" 
              alt="RISE Fan Club Logo" 
              className="h-20 w-auto object-contain mx-auto mb-4"
            />
            <CardTitle className="text-2xl">Admin Login</CardTitle>
            <CardDescription>Access the membership dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Email</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@riseupfanclub.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Password</label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  required
                />
              </div>
              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Logging in..." : "Login"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-primary/5 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <img 
              src="/RISEUP.png" 
              alt="RISE Fan Club Logo" 
              className="h-16 w-auto object-contain"
            />
            <div>
              <h1 className="text-3xl font-bold text-primary">Admin Dashboard</h1>
              <p className="text-muted-foreground">Membership Submissions</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>

        {/* Stats Card */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Submissions</p>
                  <p className="text-3xl font-bold">{submissions.length}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="relative flex-1 min-w-[300px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, email, or phone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button onClick={exportToCSV} disabled={submissions.length === 0}>
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submissions Table */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Submissions</CardTitle>
            <CardDescription>
              {filteredSubmissions.length} of {submissions.length} submissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-semibold">Date</th>
                    <th className="text-left p-3 font-semibold">Name</th>
                    <th className="text-left p-3 font-semibold">Email</th>
                    <th className="text-left p-3 font-semibold">Phone</th>
                    <th className="text-left p-3 font-semibold">Status</th>
                    <th className="text-left p-3 font-semibold">Level</th>
                    <th className="text-right p-3 font-semibold">Price</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSubmissions.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center p-8 text-muted-foreground">
                        No submissions found
                      </td>
                    </tr>
                  ) : (
                    filteredSubmissions.map((sub) => (
                      <tr key={sub.id} className="border-b hover:bg-muted/50 transition-colors">
                        <td className="p-3">
                          {format(new Date(sub.created_at), 'MM/dd/yyyy')}
                        </td>
                        <td className="p-3 font-medium">
                          {sub.first_name} {sub.last_name}
                        </td>
                        <td className="p-3">{sub.email}</td>
                        <td className="p-3">{sub.phone}</td>
                        <td className="p-3">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary capitalize">
                            {sub.membership_status}
                          </span>
                        </td>
                        <td className="p-3 capitalize">{sub.membership_level}</td>
                        <td className="p-3 text-right font-semibold">
                          ${sub.total_price}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default dynamic(() => Promise.resolve(AdminPage), { ssr: false })

