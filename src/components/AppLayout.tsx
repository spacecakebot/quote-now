import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard, ShoppingBag, Users, Factory, FileText,
  Bell, MessageSquare, Settings, LogOut, Gem, Menu, X
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface NavItem {
  label: string;
  href: string;
  icon: ReactNode;
  roles?: string[];
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/', icon: <LayoutDashboard className="w-5 h-5" /> },
  { label: 'Orders', href: '/orders', icon: <ShoppingBag className="w-5 h-5" /> },
  { label: 'Customers', href: '/customers', icon: <Users className="w-5 h-5" />, roles: ['owner', 'admin'] },
  { label: 'Vendors', href: '/vendors', icon: <Factory className="w-5 h-5" />, roles: ['owner', 'admin'] },
  { label: 'Quotations', href: '/quotations', icon: <FileText className="w-5 h-5" /> },
  { label: 'Reminders', href: '/reminders', icon: <Bell className="w-5 h-5" />, roles: ['owner', 'admin'] },
  { label: 'Messages', href: '/messages', icon: <MessageSquare className="w-5 h-5" />, roles: ['owner', 'admin'] },
  { label: 'Settings', href: '/settings', icon: <Settings className="w-5 h-5" />, roles: ['owner'] },
];

export default function AppLayout({ children }: { children: ReactNode }) {
  const { profile, shop, role, signOut } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const filteredNav = navItems.filter(item => !item.roles || (role && item.roles.includes(role)));

  // Bottom nav items for mobile (max 5)
  const bottomNavItems = filteredNav.slice(0, 5);

  return (
    <div className="min-h-screen bg-background">
      {/* Top header - mobile */}
      <header className="sticky top-0 z-40 bg-card border-b px-4 py-3 flex items-center justify-between lg:hidden">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg gold-gradient flex items-center justify-center">
            <Gem className="w-4 h-4 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-sm font-display font-bold text-foreground leading-tight">{shop?.name || 'Gold Shop'}</h1>
            <p className="text-[10px] text-muted-foreground capitalize">{role} • {profile?.full_name}</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </header>

      {/* Mobile slide menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-foreground/20" onClick={() => setMobileMenuOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-64 bg-card border-l shadow-xl animate-slide-in-right">
            <div className="p-4 border-b">
              <p className="text-sm font-medium text-foreground">{profile?.full_name}</p>
              <p className="text-xs text-muted-foreground">{profile?.phone}</p>
            </div>
            <nav className="p-2">
              {filteredNav.map(item => (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                    location.pathname === item.href
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'text-muted-foreground hover:bg-muted'
                  }`}
                >
                  {item.icon}
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="absolute bottom-4 left-0 right-0 px-4">
              <Button variant="ghost" className="w-full justify-start text-destructive" onClick={signOut}>
                <LogOut className="w-4 h-4 mr-2" /> Sign Out
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="flex">
        {/* Desktop sidebar */}
        <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-secondary border-r">
          <div className="p-4 border-b border-border/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl gold-gradient flex items-center justify-center">
                <Gem className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-sm font-display font-bold text-secondary-foreground">{shop?.name || 'Gold Shop'}</h1>
                <p className="text-xs text-muted-foreground capitalize">{role}</p>
              </div>
            </div>
          </div>
          <nav className="flex-1 p-3 space-y-1">
            {filteredNav.map(item => (
              <Link
                key={item.href}
                to={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  location.pathname === item.href
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="p-3 border-t border-border/50">
            <div className="flex items-center gap-3 px-3 py-2">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                {profile?.full_name?.charAt(0) || '?'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-secondary-foreground truncate">{profile?.full_name}</p>
                <p className="text-xs text-muted-foreground truncate">{profile?.phone}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={signOut} className="text-muted-foreground hover:text-destructive">
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 lg:ml-64 pb-20 lg:pb-6">
          {children}
        </main>
      </div>

      {/* Bottom nav - mobile */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-card border-t lg:hidden">
        <div className="flex justify-around py-1">
          {bottomNavItems.map(item => {
            const active = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={`flex flex-col items-center py-2 px-3 text-[10px] transition-colors ${
                  active ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                {item.icon}
                <span className="mt-1">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
