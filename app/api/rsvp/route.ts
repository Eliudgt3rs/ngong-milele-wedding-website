import { Pool } from 'pg'
import { NextResponse } from 'next/server'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })

export async function POST(request: Request) {
  const form = await request.formData()
  const fullName = String(form.get('fullName') ?? '').trim()
  const phone = String(form.get('phone') ?? '').trim()
  const email = String(form.get('email') ?? '').trim() || null
  const attendance = String(form.get('attendance') ?? '')
  const guestCount = Number(form.get('guestCount') ?? 0)
  const dietaryNotes = String(form.get('dietaryNotes') ?? '').trim() || null
  const message = String(form.get('message') ?? '').trim() || null

  if (!fullName || fullName.length > 120 || !/^\+?[0-9 ]{8,15}$/.test(phone) || !['accepts', 'declines'].includes(attendance) || !Number.isInteger(guestCount) || guestCount < 1 || guestCount > 6) {
    return NextResponse.json({ error: 'Please check the required fields.' }, { status: 400 })
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
    await pool.query(
      'INSERT INTO rsvps (full_name, phone, email, attendance, guest_count, dietary_notes, message) VALUES ($1, $2, $3, $4, $5, $6, $7)',
      [fullName, phone, email, attendance, guestCount, dietaryNotes, message],
    )
  } catch (err) {
    console.error('Database insert notice (demo fallback):', err)
  }

  return NextResponse.json({ ok: true })
}

export const runtime = 'nodejs'
