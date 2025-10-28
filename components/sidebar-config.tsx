"use client";

import * as React from "react";
import type { LucideIcon } from "lucide-react";
import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  Frame,
  GalleryVerticalEnd,
  MapIcon,
  PieChart,
  Settings2,
  SquareTerminal,
  ClipboardList,
  CheckCircle2,
  Users,
  Info,
  CircleGauge,
} from "lucide-react";

export type SidebarVariant = "admission" | "portal";

export interface SidebarUser {
  name: string;
  email: string;
  avatar: string;
}

export interface SidebarTeam {
  name: string;
  logo: LucideIcon;
  plan: string;
}

export interface SidebarNavItem {
  title: string;
  url: string;
}

export interface SidebarNavSection {
  title: string;
  url: string;
  icon: LucideIcon;
  isActive?: boolean;
  items?: SidebarNavItem[];
}

export interface SidebarProject {
  name: string;
  url: string;
  icon: LucideIcon;
}

export interface SidebarData {
  teams: SidebarTeam[];
  navMain: SidebarNavSection[];
  projects: SidebarProject[];
}

function buildPortalData(): SidebarData {
  return {
    teams: [
      {
        name: "Admin Portal",
        logo: GalleryVerticalEnd,
        plan: "Enterprise",
      },
    ],
    navMain: [
      {
        title: "Dashboard",
        url: "#",
        icon: CircleGauge,
        isActive: true,
        items: [
          { title: "Overview", url: "/portal" },
          { title: "Statistik", url: "/portal/statistik" },
        ],
      },
      {
        title: "Informasi",
        url: "#",
        icon: Info,
        isActive: true,
        items: [{ title: "Kelola Informasi", url: "/portal/informasi" }],
      },
      {
        title: "Pendaftaran",
        url: "#",
        icon: BookOpen,
        isActive: true,
        items: [
          { title: "Pendaftaran", url: "/portal/pendaftaran" },
          { title: "Data Peserta", url: "/portal/peserta" },
          { title: "Kelulusan", url: "/portal/kelulusan" },
        ],
      },
      {
        title: "Settings",
        url: "#",
        icon: Settings2,
        isActive: true,
        items: [
          { title: "Halaman", url: "#" },
          { title: "Pengguna", url: "#" },
        ],
      },
    ],
    projects: [],
  };
}

function buildAdmissionData(): SidebarData {
  return {
    teams: [
      {
        name: "Admissions",
        logo: Users,
        plan: "Department",
      },
    ],
    navMain: [
      {
        title: "Dashboard",
        url: "#",
        icon: CircleGauge,
        isActive: true,
        items: [{ title: "Overview", url: "#" }],
      },
      {
        title: "Pendaftaran",
        url: "#",
        icon: BookOpen,
        items: [
          { title: "Pendaftaran", url: "#" },
          { title: "Status Pendaftaran", url: "#" },
        ],
      },
      {
        title: "Informasi",
        url: "#",
        icon: Info,
        items: [
          { title: "Umum", url: "#" },
          { title: "Kelulusan", url: "#" },
        ],
      },
    ],
    projects: [],
  };
}

export function getSidebarData(variant: SidebarVariant): SidebarData {
  switch (variant) {
    case "admission":
      return buildAdmissionData();
    case "portal":
    default:
      return buildPortalData();
  }
}

interface SidebarConfigContextValue {
  variant: SidebarVariant;
  data: SidebarData;
}

const SidebarConfigContext =
  React.createContext<SidebarConfigContextValue | null>(null);

export function SidebarConfigProvider({
  variant,
  children,
}: {
  variant: SidebarVariant;
  children: React.ReactNode;
}) {
  const data = React.useMemo(() => getSidebarData(variant), [variant]);
  const value = React.useMemo(() => ({ variant, data }), [variant, data]);
  return (
    <SidebarConfigContext.Provider value={value}>
      {children}
    </SidebarConfigContext.Provider>
  );
}

export function useSidebarConfig(): SidebarConfigContextValue {
  const ctx = React.useContext(SidebarConfigContext);
  if (ctx) return ctx;
  // Fallback ensures ease of integration without requiring provider usage.
  const variant: SidebarVariant = "portal";
  return { variant, data: getSidebarData(variant) };
}
