import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import CreateReport from "@/pages/CreateReport";
import Success from "@/pages/Success";
import StatusCheck from "@/pages/StatusCheck";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

// Basic layout wrapper to ensure Header/Footer consistency
function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background font-body">
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/">
        <Layout><Home /></Layout>
      </Route>
      <Route path="/nova-manifestacao">
        <Layout><CreateReport /></Layout>
      </Route>
      <Route path="/sucesso">
        <Layout><Success /></Layout>
      </Route>
      <Route path="/consultar">
        <Layout><StatusCheck /></Layout>
      </Route>
      <Route>
        <Layout><NotFound /></Layout>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
