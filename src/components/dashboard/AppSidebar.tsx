import { 
  FileText, 
  Calendar, 
  Settings, 
  Briefcase, 
  Mail, 
  BarChart3, 
  MessageCircle, 
  Info,
  Upload,
  History
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

const mainItems = [
  { title: "CV Screening", url: "/dashboard", icon: Upload },
  { title: "CV History", url: "/dashboard/history", icon: History },
  { title: "Job Roles", url: "/dashboard/jobs", icon: Briefcase },
  { title: "Calendar", url: "/dashboard/calendar", icon: Calendar },
  { title: "Email", url: "/dashboard/email", icon: Mail },
];

const analyticsItems = [
  { title: "Performance", url: "/dashboard/performance", icon: BarChart3 },
];

const supportItems = [
  { title: "Chat Support", url: "/dashboard/chat", icon: MessageCircle },
  { title: "Settings", url: "/dashboard/settings", icon: Settings },
  { title: "About", url: "/dashboard/about", icon: Info },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => {
    if (path === "/dashboard") {
      return currentPath === "/dashboard";
    }
    return currentPath.startsWith(path);
  };

  const renderMenuItems = (items: typeof mainItems) => (
    <SidebarMenu>
      {items.map((item) => (
        <SidebarMenuItem key={item.title}>
          <SidebarMenuButton asChild isActive={isActive(item.url)}>
            <NavLink 
              to={item.url} 
              end={item.url === "/dashboard"}
              className="flex items-center gap-3 hover:bg-muted/50" 
              activeClassName="bg-primary/10 text-primary font-medium"
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span>{item.title}</span>}
            </NavLink>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );

  return (
    <Sidebar collapsible="icon" className="border-r border-border">
      <SidebarContent className="pt-4">
        <SidebarGroup>
          <SidebarGroupLabel className={collapsed ? "sr-only" : ""}>
            Recruitment
          </SidebarGroupLabel>
          <SidebarGroupContent>
            {renderMenuItems(mainItems)}
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className={collapsed ? "sr-only" : ""}>
            Analytics
          </SidebarGroupLabel>
          <SidebarGroupContent>
            {renderMenuItems(analyticsItems)}
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className={collapsed ? "sr-only" : ""}>
            Support
          </SidebarGroupLabel>
          <SidebarGroupContent>
            {renderMenuItems(supportItems)}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
