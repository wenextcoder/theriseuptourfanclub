"use client"

import { useEffect, useState } from "react"
import dynamic from 'next/dynamic'
import { supabase, type MembershipSubmission } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Download, LogOut, Search, Users, ChevronDown, ChevronUp, Mail, Phone, MapPin, Calendar, User, CreditCard, Hash } from "lucide-react"
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
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())

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

  const toggleRow = (id: string) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedRows(newExpanded)
  }

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
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-primary/5 p-3 sm:p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 sm:mb-6 md:mb-8">
          <div className="flex items-center gap-2 sm:gap-4">
            <img 
              src="/RISEUP.png" 
              alt="RISE Fan Club Logo" 
              className="h-12 sm:h-14 md:h-16 w-auto object-contain"
            />
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-primary">Admin Dashboard</h1>
              <p className="text-xs sm:text-sm text-muted-foreground">Membership Submissions</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleLogout} className="w-full sm:w-auto">
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>

        {/* Stats Card */}
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Users className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Total Submissions</p>
                  <p className="text-2xl sm:text-3xl font-bold">{submissions.length}</p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                <div className="relative flex-1 min-w-0">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, email, or phone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full"
                  />
                </div>
                <Button onClick={exportToCSV} disabled={submissions.length === 0} className="w-full sm:w-auto">
                  <Download className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Export CSV</span>
                  <span className="sm:hidden">Export</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submissions Table */}
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-lg sm:text-xl">Recent Submissions</CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              {filteredSubmissions.length} of {submissions.length} submissions
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 sm:p-6">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="text-left p-2 sm:p-3 font-semibold text-xs sm:text-sm w-12"></th>
                    <th className="text-left p-2 sm:p-3 font-semibold text-xs sm:text-sm">Date</th>
                    <th className="text-left p-2 sm:p-3 font-semibold text-xs sm:text-sm">Name</th>
                    <th className="text-left p-2 sm:p-3 font-semibold text-xs sm:text-sm hidden md:table-cell">Email</th>
                    <th className="text-left p-2 sm:p-3 font-semibold text-xs sm:text-sm hidden lg:table-cell">Phone</th>
                    <th className="text-left p-2 sm:p-3 font-semibold text-xs sm:text-sm">Status</th>
                    <th className="text-left p-2 sm:p-3 font-semibold text-xs sm:text-sm hidden sm:table-cell">Level</th>
                    <th className="text-right p-2 sm:p-3 font-semibold text-xs sm:text-sm">Price</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSubmissions.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center p-8 text-muted-foreground">
                        No submissions found
                      </td>
                    </tr>
                  ) : (
                    filteredSubmissions.map((sub) => {
                      const isExpanded = expandedRows.has(sub.id)
                      return (
                        <>
                          <tr 
                            key={sub.id} 
                            className="border-b hover:bg-muted/50 transition-colors cursor-pointer"
                            onClick={() => toggleRow(sub.id)}
                          >
                            <td className="p-2 sm:p-3">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  toggleRow(sub.id)
                                }}
                                className="p-1 hover:bg-muted rounded transition-colors"
                              >
                                {isExpanded ? (
                                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                                ) : (
                                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                )}
                              </button>
                            </td>
                            <td className="p-2 sm:p-3">
                              <div className="text-xs sm:text-sm">
                                {format(new Date(sub.created_at), 'MM/dd/yyyy')}
                              </div>
                            </td>
                            <td className="p-2 sm:p-3 font-medium">
                              <div className="text-xs sm:text-sm">
                                {sub.first_name} {sub.last_name}
                              </div>
                              <div className="text-xs text-muted-foreground md:hidden mt-1">
                                {sub.email}
                              </div>
                            </td>
                            <td className="p-2 sm:p-3 hidden md:table-cell">
                              <div className="text-xs sm:text-sm truncate max-w-[200px]">{sub.email}</div>
                            </td>
                            <td className="p-2 sm:p-3 hidden lg:table-cell">
                              <div className="text-xs sm:text-sm">{sub.phone}</div>
                            </td>
                            <td className="p-2 sm:p-3">
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary capitalize">
                                {sub.membership_status}
                              </span>
                            </td>
                            <td className="p-2 sm:p-3 capitalize hidden sm:table-cell">
                              <div className="text-xs sm:text-sm">{sub.membership_level}</div>
                            </td>
                            <td className="p-2 sm:p-3 text-right font-semibold">
                              <div className="text-xs sm:text-sm">${sub.total_price}</div>
                            </td>
                          </tr>
                          {isExpanded && (
                            <tr key={`${sub.id}-expanded`} className="border-b bg-muted/20">
                              <td colSpan={8} className="p-4 sm:p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                                  {/* Personal Information */}
                                  <div className="space-y-3">
                                    <h4 className="font-semibold text-sm text-primary border-b pb-2">Personal Information</h4>
                                    <div className="space-y-2 text-xs sm:text-sm">
                                      <div className="flex items-start gap-2">
                                        <User className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                                        <div>
                                          <span className="text-muted-foreground">Full Name:</span>
                                          <p className="font-medium">{sub.first_name} {sub.middle_name} {sub.last_name}</p>
                                        </div>
                                      </div>
                                      <div className="flex items-start gap-2">
                                        <User className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                                        <div>
                                          <span className="text-muted-foreground">Nickname:</span>
                                          <p className="font-medium">{sub.nickname}</p>
                                        </div>
                                      </div>
                                      <div className="flex items-start gap-2">
                                        <Mail className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                                        <div>
                                          <span className="text-muted-foreground">Email:</span>
                                          <p className="font-medium break-all">{sub.email}</p>
                                        </div>
                                      </div>
                                      <div className="flex items-start gap-2">
                                        <Phone className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                                        <div>
                                          <span className="text-muted-foreground">Phone:</span>
                                          <p className="font-medium">{sub.phone}</p>
                                        </div>
                                      </div>
                                      <div className="flex items-start gap-2">
                                        <Calendar className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                                        <div>
                                          <span className="text-muted-foreground">Birth Date:</span>
                                          <p className="font-medium">{sub.birth_date}</p>
                                        </div>
                                      </div>
                                      <div className="flex items-start gap-2">
                                        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                                        <div>
                                          <span className="text-muted-foreground">Birth Place:</span>
                                          <p className="font-medium">{sub.birth_city_state}</p>
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Address Information */}
                                  <div className="space-y-3">
                                    <h4 className="font-semibold text-sm text-primary border-b pb-2">Address</h4>
                                    <div className="space-y-2 text-xs sm:text-sm">
                                      <div className="flex items-start gap-2">
                                        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                                        <div>
                                          <span className="text-muted-foreground">Street:</span>
                                          <p className="font-medium">{sub.address1}</p>
                                          {sub.address2 && (
                                            <p className="font-medium">{sub.address2}</p>
                                          )}
                                        </div>
                                      </div>
                                      <div className="flex items-start gap-2">
                                        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                                        <div>
                                          <span className="text-muted-foreground">City, State, Zip:</span>
                                          <p className="font-medium">{sub.city}, {sub.state} {sub.zip_code}</p>
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Membership Details */}
                                  <div className="space-y-3">
                                    <h4 className="font-semibold text-sm text-primary border-b pb-2">Membership Details</h4>
                                    <div className="space-y-2 text-xs sm:text-sm">
                                      <div className="flex items-start gap-2">
                                        <CreditCard className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                                        <div>
                                          <span className="text-muted-foreground">Status:</span>
                                          <p className="font-medium capitalize">{sub.membership_status}</p>
                                        </div>
                                      </div>
                                      <div className="flex items-start gap-2">
                                        <CreditCard className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                                        <div>
                                          <span className="text-muted-foreground">Level:</span>
                                          <p className="font-medium capitalize">{sub.membership_level}</p>
                                        </div>
                                      </div>
                                      <div className="flex items-start gap-2">
                                        <CreditCard className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                                        <div>
                                          <span className="text-muted-foreground">Total Price:</span>
                                          <p className="font-medium text-primary">${sub.total_price}</p>
                                        </div>
                                      </div>
                                      {sub.payment_intent_id && (
                                        <div className="flex items-start gap-2">
                                          <CreditCard className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                                          <div>
                                            <span className="text-muted-foreground">Payment ID:</span>
                                            <p className="font-medium font-mono text-xs break-all">{sub.payment_intent_id}</p>
                                          </div>
                                        </div>
                                      )}
                                      <div className="flex items-start gap-2">
                                        <Hash className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                                        <div>
                                          <span className="text-muted-foreground">Shirt Size:</span>
                                          <p className="font-medium">{sub.shirt_size}</p>
                                        </div>
                                      </div>
                                      <div className="flex items-start gap-2">
                                        <Hash className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                                        <div>
                                          <span className="text-muted-foreground">Jacket Size:</span>
                                          <p className="font-medium">{sub.jacket_size}</p>
                                        </div>
                                      </div>
                                      <div className="flex items-start gap-2">
                                        <User className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                                        <div>
                                          <span className="text-muted-foreground">DBN Member:</span>
                                          <p className="font-medium capitalize">{sub.is_dbn_member}</p>
                                        </div>
                                      </div>
                                      {sub.referral_source && (
                                        <div className="flex items-start gap-2">
                                          <User className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                                          <div>
                                            <span className="text-muted-foreground">Referral Source:</span>
                                            <p className="font-medium capitalize">{sub.referral_source}</p>
                                            {sub.referrer_name && (
                                              <p className="text-xs text-muted-foreground mt-1">Referred by: {sub.referrer_name}</p>
                                            )}
                                          </div>
                                        </div>
                                      )}
                                      {sub.coupon_code && (
                                        <div className="flex items-start gap-2">
                                          <Hash className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                                          <div>
                                            <span className="text-muted-foreground">Coupon Code:</span>
                                            <p className="font-medium">{sub.coupon_code}</p>
                                          </div>
                                        </div>
                                      )}
                                      <div className="flex items-start gap-2">
                                        <Calendar className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                                        <div>
                                          <span className="text-muted-foreground">Submitted:</span>
                                          <p className="font-medium">{format(new Date(sub.created_at), 'MMM dd, yyyy HH:mm')}</p>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </>
                      )
                    })
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

