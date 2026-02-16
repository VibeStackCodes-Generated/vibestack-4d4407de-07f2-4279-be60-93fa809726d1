import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"

export function useBookmark({ id }: { id: string }) {
  const [data, setData] = useState<Record<string, unknown> | null>(null)
  const [error, setError] = useState<unknown>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isError, setIsError] = useState(false)

  const refetch = async () => {
    setIsLoading(true)
    setIsError(false)
    try {
      const { data: row, error: err } = await supabase
        .from("bookmark")
        .select("*, bookmark_tag(tag(*))")
        .eq("id", id)
        .single()
      if (err) throw err
      const tags = ((row as any)?.bookmark_tag ?? []).map((bt: any) => bt.tag).filter(Boolean)
      setData({ ...row, tags })
    } catch (e) {
      setError(e)
      setIsError(true)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { if (id) refetch() }, [id])
  return { data, error, isLoading, isError, refetch }
}
