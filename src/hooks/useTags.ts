import { useQuery } from "@tanstack/react-query"
import * as tagsApi from "@/lib/tags"

export function useTags() {
  return useQuery({
    queryKey: ["tags", "list"],
    queryFn: () => tagsApi.listTags(),
  })
}
