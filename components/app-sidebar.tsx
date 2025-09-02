"use client"

import { useEffect, useState } from "react"
import { SidebarGroupAction } from "@/components/ui/sidebar"

import {
  FileText,
  Home,
  Hospital,
  LineChart,
  Monitor,
  Plus,
  Search,
  Settings,
  Users,
  User2,
  ChevronDown,
  ChevronUp,
  Shield,
  MapPin,
  List,
  UserPlus,
} from "lucide-react"
import Link from "next/link"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export function AppSidebar() {
  const [userData, setUserData] = useState(null)

  useEffect(() => {
    const storedData = localStorage.getItem("userData")
    if (storedData) {
      setUserData(JSON.parse(storedData))
    }
  }, [])

  // Menu items for regular users
  const mainNavigation = [
    {
      title: "Overview",
      url: "/dashboard",
      icon: Home,
      description: "Dashboard overview",
    },
    {
      title: "Patient Registration",
      url: "/registration",
      icon: UserPlus,
      description: "Register new patients",
    },
    {
      title: "Patient Check-in",
      url: "/check-in",
      icon: Users,
      description: "Check-in registered patients and perform triage",
    },
    {
      title: "Queue Management",
      url: "/queue",
      icon: List,
      description: "Manage patient queues and priorities",
    },
    {
      title: "Resource Allocation",
      url: "#resource-allocation",
      icon: Hospital,
      description: "Optimize hospital resources",
    },
    {
      title: "Reporting",
      url: "#reporting",
      icon: FileText,
      description: "Generate comprehensive reports",
    },
    {
      title: "Check-Out Monitoring",
      url: "#check-out-monitoring",
      icon: Monitor,
      description: "Track patient check-outs",
    },
  ]

  // Admin-specific navigation
  const adminNavigation = [
    {
      title: "National Overview",
      url: "/admin",
      icon: Shield,
      description: "National healthcare administration",
    },
    {
      title: "Provincial Data",
      url: "/admin#provinces",
      icon: MapPin,
      description: "Province-wide healthcare data",
    },
    {
      title: "Resource Planning",
      url: "/admin#resources",
      icon: Hospital,
      description: "National resource allocation",
    },
    {
      title: "Facility Management",
      url: "#facility-management",
      icon: Settings,
      description: "Manage healthcare facilities",
    },
  ]

  const analyticsNavigation = [
    {
      title: "Trends",
      url: "#trends",
      icon: LineChart,
      description: "View data trends",
    },
    {
      title: "Settings",
      url: "#settings",
      icon: Settings,
      description: "Configure system settings",
    },
  ]

  const navigationItems = userData?.isAdmin ? adminNavigation : mainNavigation

  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton>
                  {userData?.isAdmin ? "HPRS Admin" : "HPRS Dashboard"}
                  <ChevronDown className="ml-auto" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-(--radix-popper-anchor-width)">
                <DropdownMenuItem>
                  <span>{userData?.isAdmin ? "Admin Panel" : "Main Dashboard"}</span>
                </DropdownMenuItem>
                {userData?.isAdmin && (
                  <DropdownMenuItem>
                    <span>Facility View</span>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarInput placeholder="Search..." icon={<Search />} />
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{userData?.isAdmin ? "Administration" : "Main"}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.description}>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel>Analytics</SidebarGroupLabel>
          <SidebarGroupAction title="Add New Report">
            <Plus /> <span className="sr-only">Add New Report</span>
          </SidebarGroupAction>
          <SidebarGroupContent>
            <SidebarMenu>
              {analyticsNavigation.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.description}>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton>
                  <User2 /> {userData?.isAdmin ? `Admin: ${userData.id}` : userData?.facilityName || "User"}
                  <ChevronUp className="ml-auto" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" className="w-(--radix-popper-anchor-width)">
                <DropdownMenuItem>
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
