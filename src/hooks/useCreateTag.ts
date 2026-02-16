import { useState } from "react"
import { supabase } from "@/lib/supabaseClient"

export function useCreateTag() {
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<unknown>(null)
  const [isError, setIsError] = useState(false)

  const mutateAsync = async (input: { name: string }) => {
    setIsPending(true)
    setIsError(false)
    try {
      const { data, error: err } = await supabase.from("tag").insert({ name: input.name }).select().single()
      if (err) throw err
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
