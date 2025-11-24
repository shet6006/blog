import { type NextRequest, NextResponse } from "next/server"
import { LikeModel } from "@/lib/models/like"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { post_id, device_id } = body

    if (!post_id || !device_id) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const result = await LikeModel.toggle(Number.parseInt(post_id), device_id)
    return NextResponse.json(result)
  } catch (error) {
    console.error("Toggle Like Error:", error)
    return NextResponse.json({ error: "Failed to toggle like" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const postId = searchParams.get("postId")
    const deviceId = searchParams.get("deviceId")

    if (!postId || !deviceId) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }

    const isLiked = await LikeModel.isLiked(Number.parseInt(postId), deviceId)
    const count = await LikeModel.countByPostId(Number.parseInt(postId))

    return NextResponse.json({ isLiked, count })
  } catch (error) {
    console.error("Get Like Status Error:", error)
    return NextResponse.json({ error: "Failed to fetch like status" }, { status: 500 })
  }
}
