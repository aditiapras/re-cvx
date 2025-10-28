"use client";

import { ClerkLoaded, ClerkLoading, UserButton, useUser } from "@clerk/nextjs";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Skeleton } from "./ui/skeleton";

export function NavUser() {
  const { user: clerkUser } = useUser();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          size="lg"
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
        >
          <ClerkLoading>
            <Skeleton className="size-7 rounded-full" />
          </ClerkLoading>
          <ClerkLoaded>
            <UserButton />
          </ClerkLoaded>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-medium">
              {clerkUser?.fullName || clerkUser?.firstName || "Loading..."}
            </span>
            <span className="truncate text-xs">
              {clerkUser?.primaryEmailAddress?.emailAddress || "Loading..."}
            </span>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
