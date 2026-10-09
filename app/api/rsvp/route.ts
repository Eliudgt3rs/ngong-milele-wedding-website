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

  await pool.query(
    'INSERT INTO rsvps (full_name, phone, email, attendance, guest_count, dietary_notes, message) VALUES ($1, $2, $3, $4, $5, $6, $7)',
    [fullName, phone, email, attendance, guestCount, dietaryNotes, message],
  )
  return NextResponse.json({ ok: true })
}

export const runtime = 'nodejs'
