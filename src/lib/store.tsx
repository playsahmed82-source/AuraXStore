import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { supabase } from './supabase';
import type { User, Session } from '@supabase/supabase-js';
import type { Profile, CartItem, Product } from './types';

interface AuthState {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  isLoading: boolean;
  isAdmin: boolean;
  isSeller: boolean;
  error: string | null;
}

interface CartState {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  isLoading: boolean;
}

interface StoreContextType {
  auth: AuthState;
  cart: CartState;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, username?: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  addToCart: (productId: string, quantity?: number) => Promise<{ error: Error | null }>;
  removeFromCart: (cartItemId: string) => Promise<{ error: Error | null }>;
  updateCartQuantity: (cartItemId: string, quantity: number) => Promise<{ error: Error | null }>;
  clearCart: () => Promise<{ error: Error | null }>;
  refreshCart: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const StoreContext = createContext<StoreContextType | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<AuthState>({
    user: null,
    profile: null,
    session: null,
    isLoading: true,
    isAdmin: false,
    isSeller: false,
    error: null,
  });

  const [cart, setCart] = useState<CartState>({
    items: [],
    itemCount: 0,
    subtotal: 0,
    isLoading: false,
  });

  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (!mounted) return;

        if (session?.user) {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();

          if (error) {
            console.error('Profile fetch error:', error);
          }

          if (mounted) {
            setAuth({
              user: session.user,
              profile: profile as Profile,
              session,
              isLoading: false,
              isAdmin: (profile as Profile)?.role === 'admin' || (profile as Profile)?.role === 'super_admin' || ((profile as Profile)?.is_admin ?? false),
              isSeller: (profile as Profile)?.role === 'seller' || (profile as Profile)?.role === 'admin' || (profile as Profile)?.role === 'super_admin',
              error: error ? error.message : null,
            });
          }
        } else {
          if (mounted) {
            setAuth({
              user: null,
              profile: null,
              session: null,
              isLoading: false,
              isAdmin: false,
              isSeller: false,
              error: null,
            });
          }
        }
      } catch (err) {
        console.error('Auth init error:', err);
        if (mounted) {
          setAuth({
            user: null,
            profile: null,
            session: null,
            isLoading: false,
            isAdmin: false,
            isSeller: false,
            error: err instanceof Error ? err.message : 'Authentication failed',
          });
        }
      }
    };

    initAuth();

    // CRITICAL: Use IIFE to avoid onAuthStateChange deadlock
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;

      if (event === 'SIGNED_IN' && session?.user) {
        // Use IIFE to avoid deadlock - async work must be OUTSIDE the synchronous callback
        (async () => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();

          if (mounted) {
            setAuth({
              user: session.user,
              profile: profile as Profile,
              session,
              isLoading: false,
              isAdmin: (profile as Profile)?.role === 'admin' || (profile as Profile)?.role === 'super_admin' || ((profile as Profile)?.is_admin ?? false),
              isSeller: (profile as Profile)?.role === 'seller' || (profile as Profile)?.role === 'admin' || (profile as Profile)?.role === 'super_admin',
              error: null,
            });
          }
        })();
      } else if (event === 'SIGNED_OUT') {
        setAuth({
          user: null,
          profile: null,
          session: null,
          isLoading: false,
          isAdmin: false,
          isSeller: false,
          error: null,
        });
        setCart({ items: [], itemCount: 0, subtotal: 0, isLoading: false });
      } else if (event === 'USER_UPDATED') {
        // Session refreshed - update without full profile fetch
        setAuth(prev => ({
          ...prev,
          user: session?.user ?? null,
          session: session ?? null,
        }));
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (auth.user) {
      refreshCart();
    }
  }, [auth.user]);

  const refreshCart = useCallback(async () => {
    if (!auth.user) {
      setCart({ items: [], itemCount: 0, subtotal: 0, isLoading: false });
      return;
    }

    setCart(prev => ({ ...prev, isLoading: true }));

    try {
      const { data: items, error } = await supabase
        .from('cart_items')
        .select(`
          *,
          product:products(*)
        `)
        .eq('user_id', auth.user.id);

      if (error) throw error;

      const cartItems = items as (CartItem & { product: Product })[];
      const subtotal = cartItems.reduce((sum, item) => {
        const price = item.product?.price ?? 0;
        return sum + price * item.quantity;
      }, 0);

      setCart({
        items: cartItems,
        itemCount: cartItems.reduce((sum, item) => sum + item.quantity, 0),
        subtotal,
        isLoading: false,
      });
    } catch {
      setCart(prev => ({ ...prev, isLoading: false }));
    }
  }, [auth.user]);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setAuth(prev => ({ ...prev, error: error.message }));
      } else {
        setAuth(prev => ({ ...prev, error: null }));
      }
      return { error };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Sign in failed');
      setAuth(prev => ({ ...prev, error: error.message }));
      return { error };
    }
  };

  const signUp = async (email: string, password: string, username?: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { username },
        },
      });
      if (error) {
        setAuth(prev => ({ ...prev, error: error.message }));
      } else {
        setAuth(prev => ({ ...prev, error: null }));
      }
      return { error };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Sign up failed');
      setAuth(prev => ({ ...prev, error: error.message }));
      return { error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const refreshProfile = useCallback(async () => {
    if (!auth.user) return;

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', auth.user.id)
      .maybeSingle();

    if (profile) {
      setAuth(prev => ({
        ...prev,
        profile: profile as Profile,
        isAdmin: (profile as Profile)?.role === 'admin' || (profile as Profile)?.role === 'super_admin' || ((profile as Profile)?.is_admin ?? false),
        isSeller: (profile as Profile)?.role === 'seller' || (profile as Profile)?.role === 'admin' || (profile as Profile)?.role === 'super_admin',
      }));
    }
  }, [auth.user]);

  const addToCart = async (productId: string, quantity = 1) => {
    if (!auth.user) {
      return { error: new Error('Please sign in to add items to cart') };
    }

    setCart(prev => ({ ...prev, isLoading: true }));

    const { error } = await supabase
      .from('cart_items')
      .insert({
        user_id: auth.user!.id,
        product_id: productId,
        quantity,
      });

    if (!error) {
      await refreshCart();
    } else {
      setCart(prev => ({ ...prev, isLoading: false }));
    }

    return { error };
  };

  const removeFromCart = async (cartItemId: string) => {
    setCart(prev => ({ ...prev, isLoading: true }));

    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', cartItemId);

    if (!error) {
      await refreshCart();
    } else {
      setCart(prev => ({ ...prev, isLoading: false }));
    }

    return { error };
  };

  const updateCartQuantity = async (cartItemId: string, quantity: number) => {
    if (quantity < 1) {
      return removeFromCart(cartItemId);
    }

    setCart(prev => ({ ...prev, isLoading: true }));

    const { error } = await supabase
      .from('cart_items')
      .update({ quantity })
      .eq('id', cartItemId);

    if (!error) {
      await refreshCart();
    } else {
      setCart(prev => ({ ...prev, isLoading: false }));
    }

    return { error };
  };

  const clearCart = async () => {
    if (!auth.user) return { error: null };

    setCart(prev => ({ ...prev, isLoading: true }));

    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', auth.user!.id);

    if (!error) {
      setCart({ items: [], itemCount: 0, subtotal: 0, isLoading: false });
    } else {
      setCart(prev => ({ ...prev, isLoading: false }));
    }

    return { error };
  };

  return (
    <StoreContext.Provider value={{
      auth,
      cart,
      signIn,
      signUp,
      signOut,
      addToCart,
      removeFromCart,
      updateCartQuantity,
      clearCart,
      refreshCart,
      refreshProfile,
    }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}
