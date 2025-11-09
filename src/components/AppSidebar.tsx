import { 
  LayoutDashboard, 
  ArrowDownCircle, 
  ArrowUpCircle, 
  Tags, 
  CheckSquare, 
  CreditCard,
  FileText,
  ChevronDown,
  User,
  LogOut,
  Settings
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

const menuItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Entradas", url: "/entradas", icon: ArrowDownCircle },
  { title: "Saídas", url: "/saidas", icon: ArrowUpCircle },
  { title: "Categorias", url: "/categorias", icon: Tags },
  { title: "Tarefas", url: "/tarefas", icon: CheckSquare },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => {
    if (path === "/") return currentPath === "/";
    return currentPath.startsWith(path);
  };

  const isContasActive = currentPath.startsWith("/contas");
  const isConfiguracoesActive = currentPath.startsWith("/configuracoes/contas");

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarContent className="py-4">
        {/* Cabeçalho com o nome do sistema */}
        <SidebarGroup className="px-4">
          <SidebarGroupLabel className="text-sidebar-foreground text-lg font-bold mb-3 flex items-center">
            {state !== "collapsed" && "Sistema Financeiro"}
          </SidebarGroupLabel>
        </SidebarGroup>
        
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground text-sm font-semibold px-4 mb-2">
            Menu Principal
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1 px-2">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)} className="h-12">
                    <NavLink 
                      to={item.url} 
                      end={item.url === "/"}
                      className={({ isActive }) =>
                        isActive 
                          ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold text-base" 
                          : "hover:bg-sidebar-accent/50 text-base font-medium"
                      }
                    >
                      <item.icon className="h-5 w-5" aria-hidden="true" />
                      {state !== "collapsed" && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              
              {/* Contas - Item expansível */}
              <Collapsible defaultOpen={isContasActive} className="group/collapsible">
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton className="h-12">
                      <FileText className="h-5 w-5" aria-hidden="true" />
                      {state !== "collapsed" && (
                        <>
                          <span className="text-base font-medium">Contas</span>
                          <ChevronDown className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                        </>
                      )}
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild isActive={isActive("/contas/pagar")}>
                          <NavLink 
                            to="/contas/pagar"
                            className={({ isActive }) =>
                              isActive 
                                ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold" 
                                : "hover:bg-sidebar-accent/50 font-medium"
                            }
                          >
                            <span>Contas a Pagar</span>
                          </NavLink>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild isActive={isActive("/contas/receber")}>
                          <NavLink 
                            to="/contas/receber"
                            className={({ isActive }) =>
                              isActive 
                                ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold" 
                                : "hover:bg-sidebar-accent/50 font-medium"
                            }
                          >
                            <span>Contas a Receber</span>
                          </NavLink>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        {/* Item de Configurações com subitens */}
        <Collapsible defaultOpen={isConfiguracoesActive} className="group/collapsible">
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1 px-2">
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton className="h-12">
                      <Settings className="h-5 w-5" aria-hidden="true" />
                      {state !== "collapsed" && (
                        <>
                          <span className="text-base font-medium">Configurações</span>
                          <ChevronDown className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                        </>
                      )}
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                </SidebarMenuItem>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton asChild isActive={isActive("/configuracoes/contas")}>
                        <NavLink 
                          to="/configuracoes/contas" 
                          className={({ isActive }) =>
                            isActive 
                              ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold" 
                              : "hover:bg-sidebar-accent/50 font-medium"
                          }
                        >
                          <span>Contas</span>
                        </NavLink>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </Collapsible>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border p-4">
        <SidebarMenu className="flex-row gap-2">
          <SidebarMenuItem className="flex-1">
            <SidebarMenuButton className="h-12">
              <User className="h-5 w-5" aria-hidden="true" />
              {state !== "collapsed" && <span className="text-base font-medium">Minha Conta</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
