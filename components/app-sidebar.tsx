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
  LogOut,
  Stethoscope,
  ClipboardList,
  Activity,
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
interface UserData {
  role: string
  first_name?: string
  last_name?: string
  username?: string
  facility_name?: string
}


export function AppSidebar() {
  const [userData, setUserData] = useState<UserData | null>(null)

  useEffect(() => {
    const storedData = localStorage.getItem("userData")
    if (storedData) {
      setUserData(JSON.parse(storedData))
    }
  }, [])

  // Clerk navigation - Registration and Check-in only
  const clerkNavigation = [
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
      description: "Check-in registered patients",
    },
    {
      title: "Patients",
      url: "/patients",
      icon: List,
      description: "View patients",
    },
    {
      title: "Sign Out",
      url: "/sign-out",
      icon: LogOut,
      description: "Sign out of your account",
    },
  ]

  // Nurse navigation - Triage focused
  const nurseNavigation = [
    {
      title: "Overview",
      url: "/dashboard",
      icon: Home,
      description: "Dashboard overview",
    },
    {
      title: "Triage",
      url: "/triage",
      icon: Activity,
      description: "Perform patient triage assessment",
    },
    {
      title: "Queue Management",
      url: "/queue",
      icon: List,
      description: "Manage patient queues and priorities",
    },
    {
      title: "Patients",
      url: "/patients",
      icon: List,
      description: "View patients",
    },
    {
      title: "Check-Out Monitoring",
      url: "/check-out",
      icon: Monitor,
      description: "Track patient check-outs",
    },
    {
      title: "Sign Out",
      url: "/sign-out",
      icon: LogOut,
      description: "Sign out of your account",
    },
  ]

  // Doctor navigation - Diagnosis and treatment
  const doctorNavigation = [
    {
      title: "Overview",
      url: "/dashboard",
      icon: Home,
      description: "Dashboard overview",
    },
    {
      title: "Patient Consultation",
      url: "/consultation",
      icon: Stethoscope,
      description: "Diagnose and treat patients",
    },
    {
      title: "Queue Management",
      url: "/queue",
      icon: List,
      description: "View patient queue",
    },
    {
      title: "Patients",
      url: "/patients",
      icon: List,
      description: "View all patients",
    },
    {
      title: "Resource Allocation",
      url: "/resource-allocation",
      icon: Hospital,
      description: "View hospital resources",
    },
    {
      title: "Check-Out Monitoring",
      url: "/check-out",
      icon: Monitor,
      description: "Track patient check-outs",
    },
    {
      title: "Sign Out",
      url: "/sign-out",
      icon: LogOut,
      description: "Sign out of your account",
    },
  ]

  // Admin navigation - Full system access
  const adminNavigation = [
    {
      title: "National Overview",
      url: "/admin",
      icon: Shield,
      description: "National healthcare administration",
    },
    
    {
      title: "Analytics & Reports",
      url: "/admin/analytics",
      icon: LineChart,
      description: "Comprehensive analytics and reporting",
    },
    {
      title: "Resource Planning",
      url: "/admin/resources",
      icon: Hospital,
      description: "National resource allocation",
    },
    
    {
      title: "User Management",
      url: "/admin/users",
      icon: Users,
      description: "Manage system users",
    },
    {
      title: "Sign Out",
      url: "/sign-out",
      icon: LogOut,
      description: "Sign out of your account",
    },
  ]

  // Analytics navigation - visible to all except clerks
  const analyticsNavigation = [
    {
      title: "Trends",
      url: "/analytics/trends",
      icon: LineChart,
      description: "View data trends",
    },
    {
      title: "Reports",
      url: "/analytics/reports",
      icon: FileText,
      description: "Generate reports",
    },
  ]

  // Determine navigation based on role
  const getNavigationItems = () => {
    const role = userData?.role?.toLowerCase()
    
    switch (role) {
      case 'clerk':
      case 'front_desk':
        return clerkNavigation
      case 'nurse':
        return nurseNavigation
      case 'doctor':
        return doctorNavigation
      case 'admin':
        return adminNavigation
      default:
        return clerkNavigation // Default to most restricted
    }
  }

  const navigationItems = getNavigationItems()
  const showAnalytics = userData?.role?.toLowerCase() !== 'clerk' && userData?.role?.toLowerCase() !== 'front_desk'

  // Get role display name
  const getRoleDisplay = () => {
    const role = userData?.role?.toLowerCase()
    switch (role) {
      case 'clerk':
      case 'front_desk':
        return 'Front Desk'
      case 'nurse':
        return 'Nurse'
      case 'doctor':
        return 'Doctor'
      case 'admin':
        return 'Administrator'
      default:
        return 'User'
    }
  }

  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton>
                  {userData?.role === 'admin' ? "HPRS Admin" : "HPRS System"}
                  <ChevronDown className="ml-auto" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-(--radix-popper-anchor-width)">
                <DropdownMenuItem>
                  <span>{getRoleDisplay()} Panel</span>
                </DropdownMenuItem>
                {userData?.facility_name && (
                  <DropdownMenuItem>
                    <span>{userData.facility_name}</span>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarInput placeholder="Search..."  />
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{getRoleDisplay()}</SidebarGroupLabel>
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

        {showAnalytics && (
          <>
            <SidebarSeparator />
            <SidebarGroup>
              <SidebarGroupLabel>Analytics</SidebarGroupLabel>
              {userData?.role !== 'admin' && (
                <SidebarGroupAction title="Add New Report">
                  <Plus /> <span className="sr-only">Add New Report</span>
                </SidebarGroupAction>
              )}
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
          </>
        )}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton>
                  <User2 /> 
                  {userData?.first_name && userData?.last_name 
                    ? `${userData.first_name} ${userData.last_name}` 
                    : userData?.username || "User"}
                  <ChevronUp className="ml-auto" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" className="w-(--radix-popper-anchor-width)">
                <DropdownMenuItem>
                  <span>Role: {getRoleDisplay()}</span>
                </DropdownMenuItem>
                {userData?.facility_name && (
                  <DropdownMenuItem>
                    <span>Facility: {userData.facility_name}</span>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem>
                  <Link href="/profile">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href="/settings">Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href="/sign-out">Sign out</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}