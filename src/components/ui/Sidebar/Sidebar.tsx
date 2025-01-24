// src/components/ui/Sidebar/Sidebar.tsx
import * as React from "react";
import { Transition } from "@headlessui/react";
import { ChevronLeft, ChevronRight, Menu } from "lucide-react";
import { cn } from "../../../utils/cn";

interface SidebarItem {
  key: string;
  icon?: React.ReactNode;
  label: string;
  href?: string;
  onClick?: () => void;
  children?: SidebarItem[];
}

interface SidebarProps {
  items: SidebarItem[];
  header?: React.ReactNode;
  footer?: React.ReactNode;
  collapsed?: boolean;
  onCollapse?: (collapsed: boolean) => void;
  className?: string;
  activeItem?: string;
  onSelect?: (key: string) => void;
}

export const Sidebar = ({
  items,
  header,
  footer,
  collapsed,
  onCollapse,
  className,
  activeItem,
  onSelect,
}: SidebarProps) => {
  const [isCollapsed, setIsCollapsed] = React.useState(collapsed);
  const [isMobileOpen, setIsMobileOpen] = React.useState(false);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
    onCollapse?.(!isCollapsed);
  };

  const renderItems = (items: SidebarItem[], level = 0) => {
    return items.map((item) => (
      <div key={item.key} className="relative">
        <button
          onClick={() => {
            item.onClick?.();
            onSelect?.(item.key);
          }}
          className={cn(
            "flex w-full items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors",
            "hover:bg-gray-100 dark:hover:bg-gray-800",
            activeItem === item.key && "bg-gray-100 dark:bg-gray-800",
            level > 0 && "ml-4"
          )}
        >
          {item.icon && (
            <span className={cn("text-gray-500", !isCollapsed && "mr-3")}>
              {item.icon}
            </span>
          )}
          {!isCollapsed && <span>{item.label}</span>}
        </button>
        {!isCollapsed && item.children && renderItems(item.children, level + 1)}
      </div>
    ));
  };

  return (
    <>
      {/* Mobile Toggle */}
      <button
        className="lg:hidden fixed top-4 left-4 z-20 p-2 rounded-lg bg-white dark:bg-gray-800 shadow-lg"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        <Menu className="h-6 w-6" />
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <Transition
          show={isMobileOpen}
          enter="transition-opacity duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity duration-300"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div
            className="lg:hidden fixed inset-0 z-30 bg-black/50"
            onClick={() => setIsMobileOpen(false)}
          />
        </Transition>
      )}

      {/* Sidebar */}
      <Transition
        show={true}
        enter="transition-all duration-300"
        enterFrom="-translate-x-full"
        enterTo="translate-x-0"
        leave="transition-all duration-300"
        leaveFrom="translate-x-0"
        leaveTo="-translate-x-full"
      >
        <div
          className={cn(
            "fixed lg:relative inset-y-0 left-0 z-40",
            "flex flex-col",
            "bg-white dark:bg-gray-900",
            "border-r border-gray-200 dark:border-gray-800",
            isCollapsed ? "w-16" : "w-64",
            isMobileOpen
              ? "translate-x-0"
              : "-translate-x-full lg:translate-x-0",
            "transition-all duration-300",
            className
          )}
        >
          {/* Header */}
          {header && (
            <div className="p-4 border-b border-gray-200 dark:border-gray-800">
              {header}
            </div>
          )}

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {renderItems(items)}
          </div>

          {/* Footer */}
          {footer && (
            <div className="p-4 border-t border-gray-200 dark:border-gray-800">
              {footer}
            </div>
          )}

          {/* Collapse Button */}
          <button
            className="hidden lg:flex absolute -right-3 top-8 h-6 w-6 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700"
            onClick={toggleCollapse}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        </div>
      </Transition>
    </>
  );
};
