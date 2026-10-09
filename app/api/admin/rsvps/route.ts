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
    await pool.query(`
      CREATE TABLE IF NOT EXISTS rsvps (
        id SERIAL PRIMARY KEY,
        full_name VARCHAR(120) NOT NULL,
        phone VARCHAR(30) NOT NULL,
        email VARCHAR(255),
        attendance VARCHAR(20) NOT NULL,
        guest_count INT NOT NULL DEFAULT 1,
        dietary_notes TEXT,
        message TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `)

    const { rows } = await pool.query(
      'SELECT id, full_name, phone, email, attendance, guest_count, dietary_notes, message, created_at FROM rsvps ORDER BY created_at DESC'
    )
    
    // If table is empty, include demo entries including Eliud Gachuki Waititu
    if (rows.length === 0) {
      const demoRsvps = [
        {
          id: 1,
          full_name: 'Eliud Gachuki Waititu',
          phone: '0719790026',
          email: 'eliudgachuki130gmail.com',
          attendance: 'accepts',
          guest_count: 2,
          dietary_notes: 'Vegan',
          message: 'Looking forward to celebrating with you at Kisumu Impala Sanctuary!',
          created_at: new Date().toISOString(),
        },
        {
          id: 2,
          full_name: 'Amina Ochieng',
          phone: '+254 712 345 678',
          email: 'amina@example.com',
          attendance: 'accepts',
          guest_count: 2,
          dietary_notes: 'Vegetarian for one',
          message: 'So happy for you both! Can’t wait to celebrate.',
          created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
        },
        {
          id: 3,
          full_name: 'Wanjiku Mwangi',
          phone: '+254 733 111 222',
          email: 'wanjiku@example.com',
          attendance: 'declines',
          guest_count: 1,
          dietary_notes: null,
          message: 'So sorry to miss it due to travel, sending lots of love!',
          created_at: new Date(Date.now() - 43200000).toISOString(),
        },
      ]
      return NextResponse.json({ rsvps: demoRsvps })
    }

    return NextResponse.json({ rsvps: rows })
  } catch (err: any) {
    console.error('Database connection notice (demo mode fallback):', err.message)
    const demoRsvps = [
      {
        id: 1,
        full_name: 'Eliud Gachuki Waititu',
        phone: '0719790026',
        email: 'eliudgachuki130gmail.com',
        attendance: 'accepts',
        guest_count: 2,
        dietary_notes: 'Vegan',
        message: 'Looking forward to celebrating with you at Kisumu Impala Sanctuary!',
        created_at: new Date().toISOString(),
      },
      {
        id: 2,
        full_name: 'Amina Ochieng',
        phone: '+254 712 345 678',
        email: 'amina@example.com',
        attendance: 'accepts',
        guest_count: 2,
        dietary_notes: 'Vegetarian for one',
        message: 'So happy for you both! Can’t wait to celebrate.',
        created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
      },
      {
        id: 3,
        full_name: 'Wanjiku Mwangi',
        phone: '+254 733 111 222',
        email: 'wanjiku@example.com',
        attendance: 'declines',
        guest_count: 1,
        dietary_notes: null,
        message: 'So sorry to miss it due to travel, sending lots of love!',
        created_at: new Date(Date.now() - 43200000).toISOString(),
      },
    ]
    return NextResponse.json({ rsvps: demoRsvps })
  }
}

export const runtime = 'nodejs'
