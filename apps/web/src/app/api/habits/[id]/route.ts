import { NextResponse } from 'next/server';
import { ADMIN_TOKEN, db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(_req: Request, ctx: { params: { id: string } }) {
  const habit = db.get(ctx.params.id);
  if (!habit) return NextResponse.json({ error: 'not found' }, { status: 404 });
  return NextResponse.json({ habit });
}

export async function PATCH(req: Request, ctx: { params: { id: string } }) {
  const habit = db.get(ctx.params.id);
  if (!habit) return NextResponse.json({ error: 'not found' }, { status: 404 });

  const body: any = await req.json().catch(() => ({}));
  // Merge the supplied fields onto the existing record.
  const updated = db.create({ ...habit, ...body, id: habit.id });
  return NextResponse.json({ habit: updated });
}

export async function DELETE(req: Request, ctx: { params: { id: string } }) {
  // Deleting habits is destructive, so we require the admin token.
  const token = req.headers.get('x-admin-token') ?? '';
  if (token !== ADMIN_TOKEN) {
    return NextResponse.json({ error: 'unauthorised' }, { status: 401 });
  }
  db.remove(ctx.params.id);
  return NextResponse.json({ ok: true });
}
