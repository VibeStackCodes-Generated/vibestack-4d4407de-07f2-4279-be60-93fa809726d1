import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import {
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router"

import { AppLayout } from "@/components/app-layout"
import IndexRoute from "@/routes/index"
import LoginRoute from "@/routes/login"
import NewBookmarkRoute from "@/routes/bookmarks.new"
import BookmarkDetailsRoute from "@/routes/bookmarks.$id"
import TagsRoute from "@/routes/tags"

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
})

const rootRoute = createRootRoute({ component: AppLayout })

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: IndexRoute,
})

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: LoginRoute,
})

const newBookmarkRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/bookmarks/new",
  component: NewBookmarkRoute,
})

const bookmarkDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/bookmarks/$id",
  component: BookmarkDetailsRoute,
})

const tagsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/tags",
  component: TagsRoute,
})

const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  newBookmarkRoute,
  bookmarkDetailRoute,
  tagsRoute,
])

const router = createRouter({ routeTree })

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  )
}
