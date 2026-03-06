import { Activity, RefreshCw, Server, Settings, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Machine } from '@/types/monitoring';
import { Link } from 'react-router-dom';

interface DashboardHeaderProps {
  machines: Machine[];
}

export function DashboardHeader({ machines }: DashboardHeaderProps) {
  const onlineCount = machines.filter(m => m.status === 'online').length;
  const warningCount = machines.filter(m => m.status === 'warning').length;
  const offlineCount = machines.filter(m => m.status === 'offline').length;

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-primary/10 p-2.5">
              <Activity className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">
                <span className="text-gradient">System Monitor</span>
              </h1>
              <p className="text-sm text-muted-foreground">
                Surveillance en temps réel
              </p>
            </div>
          </div>

          {/* Stats & Actions */}
          <div className="flex items-center gap-6">
            {/* Quick Stats */}
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Server className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Machines:</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-success status-pulse" />
                  <span className="font-mono font-medium text-success">{onlineCount}</span>
                </span>
                {warningCount > 0 && (
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-warning" />
                    <span className="font-mono font-medium text-warning">{warningCount}</span>
                  </span>
                )}
                {offlineCount > 0 && (
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-destructive" />
                    <span className="font-mono font-medium text-destructive">{offlineCount}</span>
                  </span>
                )}
              </div>
            </div>

            {/* Refresh Button */}
            <Button variant="outline" size="sm" className="gap-2" asChild>
              <Link to="/scenarios">
                <Zap className="h-4 w-4" />
                <span className="hidden sm:inline">Scénarios</span>
              </Link>
            </Button>
            <Button variant="outline" size="sm" className="gap-2" asChild>
              <Link to="/config">
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">Config</span>
              </Link>
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              <span className="hidden sm:inline">Actualiser</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
