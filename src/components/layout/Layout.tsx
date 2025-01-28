// Layout.tsx
import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import MobileNav from "./MobileNav";
import { ThemeToggle } from "../ui/ThemeToggle/ThemeToggle";
import { ScrollProgress } from "../ui/ScrollProgress/ScrollProgress";

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

  useEffect(() => {
    if (isMobile) {
      setShowSidebar(false);
    }
  }, [location, isMobile]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <ScrollProgress />
      <Navbar
        onMenuClick={() => !isMobile && setShowSidebar(!showSidebar)}
        showMenuButton={!isMobile}
      >
        <ThemeToggle />
      </Navbar>

      <div className="flex pt-16">
        <AnimatePresence mode="wait">
          {showSidebar && !isMobile && (
            <motion.div
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="sticky top-16 h-[calc(100vh-64px)]"
            >
              <Sidebar
                collapsed={sidebarCollapsed}
                onCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
              />
            </motion.div>
          )}
        </AnimatePresence>
        
        <main className="flex-1 p-4 md:p-6 lg:p-8 transition-all duration-300 pb-20 lg:pb-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
        </main>
      </div>

      {isMobile && <MobileNav />}
    </div>
  );
};

export default Layout;