import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import bcrypt from "bcryptjs";
import { authOptions, STAFF_ROLES, hasStaffRole, type StaffRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { cleanText } from "@/lib/reader";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  return hasStaffRole(session, ["ADMIN"]);
}

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Administrator access required." }, { status: 403 });
  const staff = await prisma.user.findMany({ where: { role: { in: [...STAFF_ROLES] } }, select: { id: true, email: true, name: true, role: true }, orderBy: [{ role: "asc" }, { name: "asc" }] });
  return NextResponse.json({ staff });
}

export async function POST(request: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Administrator access required." }, { status: 403 });
  const body = await request.json().catch(() => null);
  const email = cleanText(body?.email, 254).toLowerCase();
  const name = cleanText(body?.name, 80);
  const password = typeof body?.password === "string" ? body.password : "";
  const role = body?.role as StaffRole;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !name || !STAFF_ROLES.includes(role) || password.length > 128) {
    return NextResponse.json({ error: "Enter a valid name, email, and staff role." }, { status: 400 });
  }
  const existing = await prisma.user.findUnique({ where: { email }, select: { id: true, role: true } });
  if (existing && existing.role !== "READER") return NextResponse.json({ error: "An account already has staff access." }, { status: 409 });
  if (existing) {
    const user = await prisma.user.update({ where: { id: existing.id }, data: { name, role }, select: { id: true, email: true, name: true, role: true } });
    return NextResponse.json({ user, promoted: true }, { status: 201 });
  }
  if (password.length < 12) return NextResponse.json({ error: "New accounts need a password of at least 12 characters." }, { status: 400 });
  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({ data: { email, name, password: passwordHash, role }, select: { id: true, email: true, name: true, role: true } });
  return NextResponse.json({ user }, { status: 201 });
}

export async function PATCH(request: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Administrator access required." }, { status: 403 });
  const body = await request.json().catch(() => null);
  const id = cleanText(body?.id, 64);
  const role = body?.role as StaffRole;
  const name = cleanText(body?.name, 80);
  if (!id || !name || !STAFF_ROLES.includes(role)) return NextResponse.json({ error: "A staff member, name, and valid role are required." }, { status: 400 });
  const target = await prisma.user.findUnique({ where: { id }, select: { id: true, role: true } });
  if (!target || !STAFF_ROLES.includes(target.role as StaffRole)) return NextResponse.json({ error: "Staff account not found." }, { status: 404 });
  if (target.role === "ADMIN" && role !== "ADMIN" && await prisma.user.count({ where: { role: "ADMIN" } }) < 2) return NextResponse.json({ error: "At least one administrator account must remain." }, { status: 400 });
  const user = await prisma.user.update({ where: { id }, data: { name, role }, select: { id: true, email: true, name: true, role: true } });
  return NextResponse.json({ user });
}

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);
  if (!hasStaffRole(session, ["ADMIN"])) return NextResponse.json({ error: "Administrator access required." }, { status: 403 });
  const body = await request.json().catch(() => null);
  const id = cleanText(body?.id, 64);
  const currentId = (session?.user as { id?: string } | undefined)?.id;
  if (!id || id === currentId) return NextResponse.json({ error: "You cannot delete your own staff account." }, { status: 400 });
  const target = await prisma.user.findUnique({ where: { id }, select: { id: true, role: true } });
  if (!target || !STAFF_ROLES.includes(target.role as StaffRole)) return NextResponse.json({ error: "Staff account not found." }, { status: 404 });
  if (target.role === "ADMIN" && await prisma.user.count({ where: { role: "ADMIN" } }) < 2) return NextResponse.json({ error: "At least one administrator account must remain." }, { status: 400 });
  await prisma.user.update({ where: { id }, data: { role: "READER" } });
  return NextResponse.json({ ok: true });
}