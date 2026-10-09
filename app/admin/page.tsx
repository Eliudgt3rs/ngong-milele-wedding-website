'use client'

import { useState } from 'react'
import { ArrowLeft, CheckCircle2, Download, Lock, RefreshCw, Search, Users, XCircle } from 'lucide-react'

interface RSVP {
  id: number
  full_name: string
  phone: string
  email: string | null
  attendance: 'accepts' | 'declines'
  guest_count: number
  dietary_notes: string | null
  message: string | null
  created_at: string
}

export default function AdminPage() {
  const [password, setPassword] = useState('')
  const [authed, setAuthed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [rsvps, setRsvps] = useState<RSVP[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filterAttendance, setFilterAttendance] = useState<'all' | 'accepts' | 'declines'>('all')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/admin/rsvps', {
        headers: { 'x-admin-password': password },
      })
      if (!res.ok) {
        throw new Error('Invalid organizer password')
      }
      const data = await res.json()
      setRsvps(data.rsvps || [])
      setAuthed(true)
    } catch (err: any) {
      setError(err.message || 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  async function fetchRsvps() {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/rsvps', {
        headers: { 'x-admin-password': password },
      })
      if (res.ok) {
        const data = await res.json()
        setRsvps(data.rsvps || [])
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const filteredRsvps = rsvps.filter((r) => {
    const matchesSearch =
      r.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.email && r.email.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesFilter = filterAttendance === 'all' || r.attendance === filterAttendance
    return matchesSearch && matchesFilter
  })

  const totalAttendingGuests = rsvps
    .filter((r) => r.attendance === 'accepts')
    .reduce((sum, r) => sum + r.guest_count, 0)

  const totalAcceptedCount = rsvps.filter((r) => r.attendance === 'accepts').length
  const totalDeclinedCount = rsvps.filter((r) => r.attendance === 'declines').length

  function exportCSV() {
    const headers = ['ID', 'Full Name', 'Phone', 'Email', 'Attendance', 'Guests', 'Dietary Notes', 'Message', 'Submitted At']
    const rows = filteredRsvps.map((r) => [
      r.id,
      `"${r.full_name}"`,
      `"${r.phone}"`,
      `"${r.email || ''}"`,
      r.attendance,
      r.guest_count,
      `"${r.dietary_notes || ''}"`,
      `"${r.message || ''}"`,
      `"${r.created_at}"`,
    ])
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', 'atieno_mulei_rsvps.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (!authed) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#32154f] px-6 text-white">
        <div className="w-full max-w-md rounded-sm bg-[#f8f5ef] p-8 text-[#32154f] shadow-2xl">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-[#32154f] text-[#e3b982]">
              <Lock size={20} />
            </div>
            <h1 className="font-serif text-3xl">Organizer Login</h1>
            <p className="mt-2 text-xs uppercase tracking-widest text-[#78887e]">Atieno & Mulei Wedding</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-[#59695f] mb-2">Organizer Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
                className="w-full border-b border-[#cdbfae] bg-transparent px-0 py-3 text-base text-[#32154f] outline-none focus:border-[#af7b42]"
              />
            </div>

            {error && <p className="text-xs text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-[#32154f] py-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#f5e5cc] transition hover:bg-[#241035]"
            >
              {loading ? 'Signing in...' : 'Access Dashboard'}
            </button>
          </form>

          <div className="mt-8 text-center">
            <a href="/" className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-[#78887e] hover:text-[#32154f]">
              <ArrowLeft size={14} /> Back to wedding website
            </a>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#f8f5ef] text-[#32154f]">
      <header className="border-b border-[#e2d5c3] bg-[#241035] text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <h1 className="font-serif text-2xl">RSVP Dashboard</h1>
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs uppercase tracking-widest text-[#e3b982]">Atieno & Mulei</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="/" className="text-xs uppercase tracking-widest text-[#d5ddd5] hover:text-white">
              View Website
            </a>
            <button
              onClick={() => {
                setAuthed(false)
                setPassword('')
              }}
              className="rounded-full border border-white/20 px-4 py-2 text-xs uppercase tracking-widest text-white transition hover:bg-white/10"
            >
              Log out
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-10">
        {/* Stats Grid */}
        <div className="grid gap-5 md:grid-cols-4">
          <div className="rounded-sm bg-white p-6 shadow-sm border border-[#e8dfd1]">
            <p className="text-xs uppercase tracking-wider text-[#78887e]">Total Responses</p>
            <p className="mt-3 font-serif text-4xl text-[#32154f]">{rsvps.length}</p>
          </div>
          <div className="rounded-sm bg-white p-6 shadow-sm border border-[#e8dfd1]">
            <p className="text-xs uppercase tracking-wider text-[#78887e]">Confirmed Guests</p>
            <p className="mt-3 font-serif text-4xl text-[#2e694b]">{totalAttendingGuests}</p>
          </div>
          <div className="rounded-sm bg-white p-6 shadow-sm border border-[#e8dfd1]">
            <p className="text-xs uppercase tracking-wider text-[#78887e]">Attending Parties</p>
            <p className="mt-3 font-serif text-4xl text-[#32154f]">{totalAcceptedCount}</p>
          </div>
          <div className="rounded-sm bg-white p-6 shadow-sm border border-[#e8dfd1]">
            <p className="text-xs uppercase tracking-wider text-[#78887e]">Declined</p>
            <p className="mt-3 font-serif text-4xl text-amber-800">{totalDeclinedCount}</p>
          </div>
        </div>

        {/* Controls & Search */}
        <div className="mt-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#78887e]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search name, phone, email..."
                className="rounded-sm border border-[#d8cbbc] bg-white py-2 pl-9 pr-4 text-sm text-[#32154f] outline-none focus:border-[#af7b42] w-72"
              />
            </div>

            <div className="flex rounded-sm border border-[#d8cbbc] bg-white p-1 text-xs uppercase tracking-wider">
              <button
                onClick={() => setFilterAttendance('all')}
                className={`rounded-sm px-3 py-1.5 transition ${filterAttendance === 'all' ? 'bg-[#32154f] text-white' : 'text-[#59695f] hover:text-[#32154f]'}`}
              >
                All ({rsvps.length})
              </button>
              <button
                onClick={() => setFilterAttendance('accepts')}
                className={`rounded-sm px-3 py-1.5 transition ${filterAttendance === 'accepts' ? 'bg-[#2e694b] text-white' : 'text-[#59695f] hover:text-[#32154f]'}`}
              >
                Attending
              </button>
              <button
                onClick={() => setFilterAttendance('declines')}
                className={`rounded-sm px-3 py-1.5 transition ${filterAttendance === 'declines' ? 'bg-amber-800 text-white' : 'text-[#59695f] hover:text-[#32154f]'}`}
              >
                Declined
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchRsvps}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-sm border border-[#d8cbbc] bg-white px-4 py-2 text-xs uppercase tracking-wider text-[#32154f] transition hover:bg-[#f0e9dc]"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
            </button>
            <button
              onClick={exportCSV}
              className="inline-flex items-center gap-2 rounded-sm bg-[#32154f] px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[#f5e5cc] transition hover:bg-[#241035]"
            >
              <Download size={14} /> Export CSV
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="mt-6 overflow-hidden rounded-sm border border-[#e2d5c3] bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-[#e2d5c3] bg-[#f2ebd9] text-xs uppercase tracking-wider text-[#59695f]">
                <tr>
                  <th className="px-6 py-4">Guest Name</th>
                  <th className="px-6 py-4">Contact</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Guests</th>
                  <th className="px-6 py-4">Dietary Notes</th>
                  <th className="px-6 py-4">Message</th>
                  <th className="px-6 py-4">Submitted</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eee6da]">
                {filteredRsvps.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-[#78887e]">
                      {rsvps.length === 0 ? 'No RSVPs submitted yet.' : 'No RSVPs match your search criteria.'}
                    </td>
                  </tr>
                ) : (
                  filteredRsvps.map((r) => (
                    <tr key={r.id} className="transition hover:bg-[#fcfbfa]">
                      <td className="px-6 py-4 font-medium text-[#32154f]">{r.full_name}</td>
                      <td className="px-6 py-4 text-xs text-[#59695f]">
                        <div>{r.phone}</div>
                        {r.email && <div className="text-gray-400">{r.email}</div>}
                      </td>
                      <td className="px-6 py-4">
                        {r.attendance === 'accepts' ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e8f2ea] px-3 py-1 text-xs font-medium text-[#2e694b]">
                            <CheckCircle2 size={13} /> Attending
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#fcedec] px-3 py-1 text-xs font-medium text-[#a83232]">
                            <XCircle size={13} /> Declined
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center font-serif text-base">{r.guest_count}</td>
                      <td className="px-6 py-4 text-xs text-[#59695f] max-w-xs truncate">{r.dietary_notes || '—'}</td>
                      <td className="px-6 py-4 text-xs text-[#59695f] max-w-xs truncate">{r.message || '—'}</td>
                      <td className="px-6 py-4 text-xs text-[#78887e] whitespace-nowrap">
                        {new Date(r.created_at).toLocaleDateString()} {new Date(r.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  )
}
