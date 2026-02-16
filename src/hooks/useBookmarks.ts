import { useQuery } from "@tanstack/react-query"
import * as bookmarksApi from "@/lib/bookmarks"

export function useBookmarks(params?: { query?: string; starredOnly?: boolean; tagId?: string }) {
  return useQuery({
    queryKey: ["bookmarks", "list", params ?? null],
    queryFn: () => bookmarksApi.listBookmarks(params as never),
  })
}
