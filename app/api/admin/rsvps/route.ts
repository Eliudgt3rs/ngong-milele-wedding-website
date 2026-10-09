import { Pool } from 'pg'
import { NextResponse } from 'next/server'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })

export async function GET(request: Request) {
  const authHeader = request.headers.get('x-admin-password') || ''
  const adminPassword = process.env.ADMIN_PASSWORD || 'atieno2026'

  if (authHeader !== adminPassword) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { rows } = await pool.query(
      'SELECT id, full_name, phone, email, attendance, guest_count, dietary_notes, message, created_at FROM rsvps ORDER BY created_at DESC'
    )
    return NextResponse.json({ rsvps: rows })
  } catch (err: any) {
    console.error('Failed to fetch RSVPs:', err)
    return NextResponse.json({ error: 'Database error or table not initialized' }, { status: 500 })
  }
}

export const runtime = 'nodejs'
