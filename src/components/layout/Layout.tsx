// src/components/layout/Layout.tsx
import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import MobileNav from "./MobileNav";
import { ThemeToggle } from "../ui/ThemeToggle/ThemeToggle";

const Layout = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [showSidebar, setShowSidebar] = useState(!isMobile);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      setShowSidebar(!mobile);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Close mobile sidebar on route change
  useEffect(() => {
    if (isMobile) {
      setShowSidebar(false);
    }
  }, [location, isMobile]);


  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar onMenuClick={() => setShowSidebar(!showSidebar)}>
        <ThemeToggle />
      </Navbar>

      <div className="flex pt-16">
        {" "}
        {/* Add pt-16 to account for navbar height */}
        <AnimatePresence mode="wait">
          {showSidebar && (
            <motion.div
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className={`${
                isMobile ? "fixed" : "sticky top-16 h-[calc(100vh-64px)]"
              }`}
            >
              <Sidebar
                collapsed={sidebarCollapsed}
                onCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
              />
              {isMobile && (
                <motion.div
                  className="fixed inset-0 bg-black/50 -z-10"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowSidebar(false)}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
        <main
          className={`flex-1 p-4 md:p-6 lg:p-8 transition-all duration-300`}
        >
          <Outlet />
          {isMobile && <div className="h-16" />}
        </main>
      </div>

      {isMobile && <MobileNav />}
    </div>
  );
};

export default Layout;
