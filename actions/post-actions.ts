"use server"

import { dataStore, generateSlug, generateExcerpt } from "@/lib/data"
import { revalidatePath } from "next/cache"

export async function createPostAction(formData: FormData) {
  try {
    const title = formData.get("title") as string
    const content = formData.get("content") as string
    const category = formData.get("category") as string
    const githubCommit = formData.get("githubCommit") as string
    const isPublic = formData.get("isPublic") === "true"

    if (!title || !content || !category) {
      return { error: "Missing required fields" }
    }

    const slug = generateSlug(title)
    const excerpt = generateExcerpt(content)

    const newPost = dataStore.createPost({
      title,
      content,
      excerpt,
      category,
      slug,
      githubCommit: githubCommit || null,
      isPublic,
      authorId: "admin",
    })

    revalidatePath("/")
    revalidatePath("/admin/dashboard")

    return { success: true, post: newPost }
  } catch (error) {
    return { error: "Failed to create post" }
  }
}

export async function updatePostAction(id: number, formData: FormData) {
  try {
    const title = formData.get("title") as string
    const content = formData.get("content") as string
    const category = formData.get("category") as string
    const githubCommit = formData.get("githubCommit") as string
    const isPublic = formData.get("isPublic") === "true"

    const updates: any = {}
    if (title) {
      updates.title = title
      updates.slug = generateSlug(title)
    }
    if (content) {
      updates.content = content
      updates.excerpt = generateExcerpt(content)
    }
    if (category) updates.category = category
    if (githubCommit !== undefined) updates.githubCommit = githubCommit || null
    updates.isPublic = isPublic

    const updatedPost = dataStore.updatePost(id, updates)

    if (!updatedPost) {
      return { error: "Post not found" }
    }

    revalidatePath("/")
    revalidatePath("/admin/dashboard")
    revalidatePath(`/posts/${updatedPost.slug}`)

    return { success: true, post: updatedPost }
  } catch (error) {
    return { error: "Failed to update post" }
  }
}

export async function deletePostAction(id: number) {
  try {
    const deletedPost = dataStore.deletePost(id)

    if (!deletedPost) {
      return { error: "Post not found" }
    }

    revalidatePath("/")
    revalidatePath("/admin/dashboard")

    return { success: true }
  } catch (error) {
    return { error: "Failed to delete post" }
  }
}
