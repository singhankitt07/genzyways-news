import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function currentUser() {
  const session = await getServerSession(authOptions);
  const id = (session?.user as { id?: string } | undefined)?.id;
  return id ? prisma.user.findUnique({ where: { id } }) : null;
}

export async function GET() {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({
    name: user.name,
    email: user.email,
    age: user.age,
    dateOfBirth: user.dateOfBirth?.toISOString().slice(0, 10) || "",
    country: user.country || "",
    state: user.state || "",
    city: user.city || "",
    address: user.address || "",
    pinCode: user.pinCode || "",
    preferences: user.preferences || ""
  });
}

export async function PUT(request: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const age = body.age === "" || body.age == null ? null : Number(body.age);
  if (age !== null && (!Number.isInteger(age) || age < 13 || age > 120)) {
    return NextResponse.json({ error: "Age must be between 13 and 120." }, { status: 400 });
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      name: typeof body.name === "string" && body.name.trim() ? body.name.trim().slice(0, 80) : user.name,
      age,
      dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : null,
      country: typeof body.country === "string" ? body.country.trim().slice(0, 80) : null,
      state: typeof body.state === "string" ? body.state.trim().slice(0, 80) : null,
      city: typeof body.city === "string" ? body.city.trim().slice(0, 80) : null,
      address: typeof body.address === "string" ? body.address.trim().slice(0, 240) : null,
      pinCode: typeof body.pinCode === "string" ? body.pinCode.trim().slice(0, 20) : null,
      preferences: typeof body.preferences === "string" ? body.preferences.trim().slice(0, 500) : null
    }
  });

  return NextResponse.json({ name: updated.name });
}
