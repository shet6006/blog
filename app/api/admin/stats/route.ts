import { NextResponse } from "next/server"
import { AdminModel } from "@/lib/models/admin"

export async function GET() {
  try {
    const stats = await AdminModel.getStats()
    return NextResponse.json(stats)
  } catch (error) {
    console.error("Admin Stats Error:", error)
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 })
  }
}
