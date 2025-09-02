"use client"

import { usePathname } from "next/navigation"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import type React from "react"

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const showSidebar = pathname !== "/login"

  return (
    <>
      {showSidebar ? (
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            <main className="flex flex-col w-full min-h-screen">
              <header className="flex items-center h-16 px-4 border-b shrink-0 md:px-6">
                <SidebarTrigger className="mr-4" />
                <h1 className="text-lg font-semibold">HPRS Dashboard</h1>
                <div className="flex items-center w-full gap-4 md:ml-auto md:gap-2 lg:gap-4">
                  {/* Placeholder for user menu or other header elements */}
                </div>
              </header>
              <div className="flex-1 p-4 md:p-10">{children}</div>
            </main>
          </SidebarInset>
        </SidebarProvider>
      ) : (
        <main className="flex flex-col w-full min-h-screen">{children}</main>
      )}
    </>
  )
}
