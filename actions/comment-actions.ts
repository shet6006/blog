"use server"

import { dataStore } from "@/lib/data"
import { revalidatePath } from "next/cache"

export async function createCommentAction(formData: FormData) {
  try {
    const postId = Number.parseInt(formData.get("postId") as string)
    const authorName = formData.get("authorName") as string
    const content = formData.get("content") as string
    const deviceId = formData.get("deviceId") as string

    if (!postId || !authorName || !content || !deviceId) {
      return { error: "Missing required fields" }
    }

    const newComment = dataStore.createComment({
      postId,
      authorName,
      content,
      deviceId,
    })

    revalidatePath(`/posts/*`)

    return { success: true, comment: newComment }
  } catch (error) {
    return { error: "Failed to create comment" }
  }
}

export async function deleteCommentAction(id: number) {
  try {
    const deletedComment = dataStore.deleteComment(id)

    if (!deletedComment) {
      return { error: "Comment not found" }
    }

    revalidatePath(`/posts/*`)

    return { success: true }
  } catch (error) {
    return { error: "Failed to delete comment" }
  }
}
