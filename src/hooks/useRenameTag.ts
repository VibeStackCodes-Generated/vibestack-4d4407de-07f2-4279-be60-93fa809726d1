import { useState } from "react"
import { supabase } from "@/lib/supabaseClient"

export function useRenameTag() {
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<unknown>(null)
  const [isError, setIsError] = useState(false)

  const mutateAsync = async (input: { id: string; name: string }) => {
    setIsPending(true)
    setIsError(false)
    try {
      const { error: err } = await supabase.from("tag").update({ name: input.name }).eq("id", input.id)
      if (err) throw err
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
