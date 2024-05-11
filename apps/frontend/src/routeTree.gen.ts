/* prettier-ignore-start */

/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file is auto-generated by TanStack Router

import { createFileRoute } from '@tanstack/react-router'

// Import Routes

import { Route as rootRoute } from './routes/__root'
import { Route as LoginIndexImport } from './routes/login/index'
import { Route as DashboardIndexImport } from './routes/dashboard/index'
import { Route as AdminIndexImport } from './routes/admin/index'

// Create Virtual Routes

const AboutLazyImport = createFileRoute('/about')()
const IndexLazyImport = createFileRoute('/')()

// Create/Update Routes

const AboutLazyRoute = AboutLazyImport.update({
  path: '/about',
  getParentRoute: () => rootRoute,
} as any).lazy(() => import('./routes/about.lazy').then((d) => d.Route))

const IndexLazyRoute = IndexLazyImport.update({
  path: '/',
  getParentRoute: () => rootRoute,
} as any).lazy(() => import('./routes/index.lazy').then((d) => d.Route))

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

// Populate the FileRoutesByPath interface

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/': {
      preLoaderRoute: typeof IndexLazyImport
      parentRoute: typeof rootRoute
    }
    '/about': {
      preLoaderRoute: typeof AboutLazyImport
      parentRoute: typeof rootRoute
    }
    '/admin/': {
      preLoaderRoute: typeof AdminIndexImport
      parentRoute: typeof rootRoute
    }
    '/dashboard/': {
      preLoaderRoute: typeof DashboardIndexImport
      parentRoute: typeof rootRoute
    }
    '/login/': {
      preLoaderRoute: typeof LoginIndexImport
      parentRoute: typeof rootRoute
    }
  }
}

// Create and export the route tree

export const routeTree = rootRoute.addChildren([
  IndexLazyRoute,
  AboutLazyRoute,
  AdminIndexRoute,
  DashboardIndexRoute,
  LoginIndexRoute,
])

/* prettier-ignore-end */
