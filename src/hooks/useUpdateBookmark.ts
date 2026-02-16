import { useState } from "react"
import { supabase } from "@/lib/supabaseClient"

export function useUpdateBookmark() {
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<unknown>(null)
  const [isError, setIsError] = useState(false)

  const mutateAsync = async (input: {
    id: string
    title: string | null
    url: string
    description: string | null
    is_starred: boolean
    tagIds: string[]
  }) => {
    setIsPending(true)
    setIsError(false)
    try {
      const { error: err } = await supabase
        .from("bookmark")
        .update({ title: input.title, url: input.url, description: input.description, is_starred: input.is_starred })
        .eq("id", input.id)
      if (err) throw err
      await supabase.from("bookmark_tag").delete().eq("bookmark_id", input.id)
      if (input.tagIds.length > 0) {
        const rows = input.tagIds.map(tagId => ({ bookmark_id: input.id, tag_id: tagId }))
        await supabase.from("bookmark_tag").insert(rows)
      }
    } catch (e) {
      setError(e)
      setIsError(true)
      throw e
    } finally {
      setIsPending(false)
    }
  }

  return { mutateAsync, isPending, error, isError }
}
