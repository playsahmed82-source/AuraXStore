import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from './supabase';
import type { Profile } from './types';

// Admin route configuration - hidden from normal navigation
export const ADMIN_ROUTE = '/aurax-admin-secure-2024';

// Role hierarchy for permission checks
const ROLE_HIERARCHY: Record<string, number> = {
  customer: 0,
  seller: 1,
  admin: 2,
  super_admin: 3,
};

export function useAuth() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user && mounted) {
          const { data: profileData, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();

          if (error) {
            setError(error.message);
          } else {
            setProfile(profileData as Profile);
            setIsAuthenticated(true);
          }
        }
        if (mounted) {
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Auth init error:', err);
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Auth init failed');
          setIsLoading(false);
        }
      }
    };

    initAuth();

    // CRITICAL: Avoid onAuthStateChange deadlock by using IIFE for async work
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;

      if (event === 'SIGNED_IN' && session?.user) {
        // Use IIFE to avoid deadlock - async work must be outside synchronous callback
        (async () => {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();

          if (mounted) {
            setProfile(profileData as Profile);
            setIsAuthenticated(true);
          }
        })();
      } else if (event === 'SIGNED_OUT') {
        setProfile(null);
        setIsAuthenticated(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const hasRole = useCallback((requiredRole: string): boolean => {
    if (!profile) return false;
    return (ROLE_HIERARCHY[profile.role] || 0) >= (ROLE_HIERARCHY[requiredRole] || 0);
  }, [profile]);

  const isAdmin = useCallback((): boolean => {
    return hasRole('admin');
  }, [hasRole]);

  const isSuperAdmin = useCallback((): boolean => {
    return hasRole('super_admin');
  }, [hasRole]);

  const isSeller = useCallback((): boolean => {
    return hasRole('seller');
  }, [hasRole]);

  return {
    profile,
    isLoading,
    isAuthenticated,
    error,
    hasRole,
    isAdmin,
    isSuperAdmin,
    isSeller,
  };
}

export function useAdminGuard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isChecked, setIsChecked] = useState(false);

  useEffect(() => {
    let mounted = true;
    let timeoutId: ReturnType<typeof setTimeout>;

    const checkAdminAccess = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (!session?.user) {
          if (mounted) {
            navigate('/auth/login', { state: { from: location } });
          }
          return;
        }

        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle();

        if (error || !profile) {
          if (mounted) {
            navigate('/auth/login', { state: { from: location } });
          }
          return;
        }

        const role = (profile as Profile).role;
        const isAdminRole = role === 'admin' || role === 'super_admin' || (profile as Profile).is_admin === true;

        if (!isAdminRole) {
          if (mounted) {
            navigate('/');
          }
          return;
        }

        // Check if 2FA is required for admin
        const { data: settings } = await supabase
          .from('site_settings')
          .select('value')
          .eq('key', 'two_factor_required_for_admin')
          .maybeSingle();

        if (settings?.value === 'true' && !(profile as Profile).two_factor_enabled) {
          if (mounted) {
            navigate('/dashboard/security?setup_2fa=true');
          }
          return;
        }

        if (mounted) {
          setIsChecked(true);
        }
      } catch (err) {
        console.error('Admin guard error:', err);
        if (mounted) {
          navigate('/auth/login', { state: { from: location } });
        }
      }
    };

    // Safety timeout to prevent infinite loading
    timeoutId = setTimeout(() => {
      if (mounted && !isChecked) {
        setIsChecked(true);
        navigate('/auth/login');
      }
    }, 10000);

    checkAdminAccess();

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
    };
  }, [navigate, location, isChecked]);

  return { isLoading: !isChecked };
}

export function useRequireAuth() {
  const { profile, isLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/auth/login', { state: { from: location } });
    }
  }, [isLoading, isAuthenticated, navigate, location]);

  return { profile, isLoading };
}

export function useRequireRole(requiredRole: string) {
  const { profile, isLoading, hasRole } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && profile && !hasRole(requiredRole)) {
      navigate('/unauthorized');
    }
  }, [profile, isLoading, hasRole, requiredRole, navigate]);

  return { profile, isLoading, hasAccess: profile ? hasRole(requiredRole) : false };
}

// Security logging
export async function logSecurityEvent(action: string, details: Record<string, unknown> = {}) {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    await supabase.from('security_logs').insert({
      user_id: user?.id || null,
      action,
      details,
      ip_address: null,
      user_agent: navigator.userAgent,
    });
  } catch (err) {
    console.error('Failed to log security event:', err);
  }
}

// Audit logging for data changes
export async function logAuditEvent(
  action: string,
  entityType: string,
  entityId: string,
  oldValues: Record<string, unknown> | null = null,
  newValues: Record<string, unknown> | null = null
) {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    await supabase.from('audit_logs').insert({
      user_id: user?.id || null,
      action,
      entity_type: entityType,
      entity_id: entityId,
      old_values: oldValues,
      new_values: newValues,
    });
  } catch (err) {
    console.error('Failed to log audit event:', err);
  }
}

// 2FA verification
export async function verify2FA(code: string): Promise<{ success: boolean; error?: string }> {
  const { data, error } = await supabase.rpc('verify_2fa', { code });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: data };
}

export async function setup2FA(): Promise<{ secret: string; qrCode: string } | null> {
  const { data, error } = await supabase.rpc('setup_2fa');

  if (error) {
    console.error('2FA setup error:', error);
    return null;
  }

  return data;
}

// Check if admin route is valid
export function isAdminRoute(pathname: string): boolean {
  return pathname.startsWith(ADMIN_ROUTE) || pathname === '/admin';
}

// Get site setting
export async function getSiteSetting(key: string): Promise<string | null> {
  const { data } = await supabase
    .from('site_settings')
    .select('value')
    .eq('key', key)
    .maybeSingle();

  return data?.value || null;
}
