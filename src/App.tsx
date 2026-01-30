import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import DashboardPage from "./pages/DashboardPage";
import CVScreening from "./pages/dashboard/CVScreening";
import CVHistory from "./pages/dashboard/CVHistory";
import CalendarPage from "./pages/dashboard/CalendarPage";
import JobRoles from "./pages/dashboard/JobRoles";
import EmailPage from "./pages/dashboard/EmailPage";
import PerformancePage from "./pages/dashboard/PerformancePage";
import ChatSupport from "./pages/dashboard/ChatSupport";
import SettingsPage from "./pages/dashboard/SettingsPage";
import AboutPage from "./pages/dashboard/AboutPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<DashboardPage />}>
              <Route index element={<CVScreening />} />
              <Route path="history" element={<CVHistory />} />
              <Route path="calendar" element={<CalendarPage />} />
              <Route path="jobs" element={<JobRoles />} />
              <Route path="email" element={<EmailPage />} />
              <Route path="performance" element={<PerformancePage />} />
              <Route path="chat" element={<ChatSupport />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="about" element={<AboutPage />} />
            </Route>
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
