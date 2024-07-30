/* prettier-ignore-start */

/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file is auto-generated by TanStack Router

// Import Routes

import { Route as rootRoute } from './routes/__root'
import { Route as IndexImport } from './routes/index'
import { Route as LoginIndexImport } from './routes/login/index'
import { Route as DashboardIndexImport } from './routes/dashboard/index'
import { Route as AdminIndexImport } from './routes/admin/index'
import { Route as AdminUserImport } from './routes/admin/user'
import { Route as AdminBucketImport } from './routes/admin/bucket'

// Create/Update Routes

const IndexRoute = IndexImport.update({
  path: '/',
  getParentRoute: () => rootRoute,
} as any)

const LoginIndexRoute = LoginIndexImport.update({
  path: '/login/',
  getParentRoute: () => rootRoute,
} as any)

const DashboardIndexRoute = DashboardIndexImport.update({
  path: '/dashboard/',
  getParentRoute: () => rootRoute,
} as any)

const AdminIndexRoute = AdminIndexImport.update({
  path: '/admin/',
  getParentRoute: () => rootRoute,
} as any)

const AdminUserRoute = AdminUserImport.update({
  path: '/admin/user',
  getParentRoute: () => rootRoute,
} as any)

const AdminBucketRoute = AdminBucketImport.update({
  path: '/admin/bucket',
  getParentRoute: () => rootRoute,
} as any)

// Populate the FileRoutesByPath interface

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/': {
      id: '/'
      path: '/'
      fullPath: '/'
      preLoaderRoute: typeof IndexImport
      parentRoute: typeof rootRoute
    }
    '/admin/bucket': {
      id: '/admin/bucket'
      path: '/admin/bucket'
      fullPath: '/admin/bucket'
      preLoaderRoute: typeof AdminBucketImport
      parentRoute: typeof rootRoute
    }
    '/admin/user': {
      id: '/admin/user'
      path: '/admin/user'
      fullPath: '/admin/user'
      preLoaderRoute: typeof AdminUserImport
      parentRoute: typeof rootRoute
    }
    '/admin/': {
      id: '/admin/'
      path: '/admin'
      fullPath: '/admin'
      preLoaderRoute: typeof AdminIndexImport
      parentRoute: typeof rootRoute
    }
    '/dashboard/': {
      id: '/dashboard/'
      path: '/dashboard'
      fullPath: '/dashboard'
      preLoaderRoute: typeof DashboardIndexImport
      parentRoute: typeof rootRoute
    }
    '/login/': {
      id: '/login/'
      path: '/login'
      fullPath: '/login'
      preLoaderRoute: typeof LoginIndexImport
      parentRoute: typeof rootRoute
    }
  }
}

// Create and export the route tree

export const routeTree = rootRoute.addChildren({
  IndexRoute,
  AdminBucketRoute,
  AdminUserRoute,
  AdminIndexRoute,
  DashboardIndexRoute,
  LoginIndexRoute,
})

/* prettier-ignore-end */

/* ROUTE_MANIFEST_START
{
  "routes": {
    "__root__": {
      "filePath": "__root.tsx",
      "children": [
        "/",
        "/admin/bucket",
        "/admin/user",
        "/admin/",
        "/dashboard/",
        "/login/"
      ]
    },
    "/": {
      "filePath": "index.tsx"
    },
    "/admin/bucket": {
      "filePath": "admin/bucket.tsx"
    },
    "/admin/user": {
      "filePath": "admin/user.tsx"
    },
    "/admin/": {
      "filePath": "admin/index.tsx"
    },
    "/dashboard/": {
      "filePath": "dashboard/index.tsx"
    },
    "/login/": {
      "filePath": "login/index.tsx"
    }
  }
}
ROUTE_MANIFEST_END */
