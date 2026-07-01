'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, Layers, BookOpen, MessageSquare, FileText, Image, Users, LogOut, ChevronRight } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ username: string; role: string } | null>(null);

  useEffect(() => {
    async function checkAuth() {
      if (pathname === '/admin/login') {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch('/api/auth/session');
        if (!res.ok) {
          router.push('/admin/login');
        } else {
          const data = await res.json();
          if (data.authenticated) {
            setIsAuthenticated(true);
            setUser(data.user);
          } else {
            router.push('/admin/login');
          }
        }
      } catch (err) {
        router.push('/admin/login');
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
  }, [pathname, router]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/admin/login');
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-ink flex items-center justify-center text-xs font-mono tracking-wider uppercase text-stone-dim">
        Verifying Session...
      </div>
    );
  }

  // If on login screen, render directly
  if (pathname === '/admin/login') {
    return <div className="bg-ink min-h-screen">{children}</div>;
  }

  const menuItems = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Products Catalog', href: '/admin/products', icon: Layers },
    { name: 'Blog Journal', href: '/admin/blog', icon: BookOpen },
    { name: 'Testimonials', href: '/admin/testimonials', icon: MessageSquare },
    { name: 'Page Copy Editor', href: '/admin/content', icon: FileText },
    { name: 'Hero Media', href: '/admin/media', icon: Image },
    { name: 'Leads & Analytics', href: '/admin/leads', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-ink flex flex-col md:flex-row text-stone font-sans">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-ink-2 border-r border-line flex flex-col justify-between p-6 shrink-0">
        <div className="space-y-8">
          <div className="space-y-1">
            <span className="block text-[9px] font-mono tracking-widest text-brass uppercase">Sitka Surfaces</span>
            <span className="block text-sm font-display font-bold text-parchment uppercase tracking-wide">Admin Console</span>
          </div>

          {/* User Profile Info */}
          {user && (
            <div className="bg-ink p-3 border border-line/50 rounded-sm space-y-0.5 text-xs">
              <span className="block text-stone-dim text-[10px] font-mono uppercase">Log In As</span>
              <span className="block font-semibold text-parchment">{user.username}</span>
              <span className="block text-[9px] text-brass uppercase tracking-wider">{user.role}</span>
            </div>
          )}

          {/* Nav Links */}
          <nav className="flex flex-col gap-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link 
                  key={item.name} 
                  href={item.href}
                  className={`flex items-center justify-between p-3 rounded-sm text-xs transition-colors ${
                    isActive 
                      ? 'bg-ember text-parchment font-semibold' 
                      : 'hover:bg-ink text-stone-dim hover:text-stone'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Icon className="w-4.5 h-4.5" />
                    {item.name}
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Logout Button */}
        <button 
          onClick={handleLogout}
          className="mt-8 flex items-center justify-center gap-2 w-full bg-ink hover:bg-ember/15 border border-line hover:border-ember text-stone-dim hover:text-ember-light py-3 rounded-sm text-xs font-mono tracking-wider uppercase transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" /> Log Out
        </button>
      </aside>

      {/* Main Panel Content */}
      <main className="flex-grow p-6 md:p-12 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
