import { useState } from "react"
import { supabase } from "@/lib/supabaseClient"

export function useCreateBookmark() {
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<unknown>(null)
  const [isError, setIsError] = useState(false)

  const mutateAsync = async (input: {
    title: string | null
    url: string
    description: string | null
    is_starred: boolean
    tagIds: string[]
  }) => {
    setIsPending(true)
    setIsError(false)
    try {
      const { data, error: err } = await supabase
        .from("bookmark")
        .insert({ title: input.title, url: input.url, description: input.description, is_starred: input.is_starred })
        .select()
        .single()
      if (err) throw err
      if (input.tagIds.length > 0 && data?.id) {
        const rows = input.tagIds.map(tagId => ({ bookmark_id: data.id, tag_id: tagId }))
        await supabase.from("bookmark_tag").insert(rows)
      }
      return data
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
