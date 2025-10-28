"use client";

import * as React from "react";

import { NavMain } from "@/components/nav-main";
import { NavProjects } from "@/components/nav-projects";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import {
  useSidebarConfig,
  getSidebarData,
  type SidebarVariant,
} from "@/components/sidebar-config";

export interface AppSidebarProps
  extends Omit<React.ComponentProps<typeof Sidebar>, "variant"> {
  variant?: SidebarVariant;
}

export function AppSidebar({ variant, ...props }: AppSidebarProps) {
  // Prioritise props; fall back to context; default remains "portal".
  const ctx = useSidebarConfig();
  const data = variant ? getSidebarData(variant) : ctx.data;

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
