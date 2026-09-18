'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { WILAYAS } from '@/data/wilayas';

export interface OrderItem {
  productId: string;
  productNameFr: string;
  productNameAr: string;
  price: number;
  quantity: number;
  selectedColor?: string;
  image?: string;
}

export type OrderStatus = 'pending' | 'confirmed' | 'in_delivery' | 'delivered' | 'cancelled' | 'retour';

export interface Order {
  id: string;
  trackingCode: string;
  fullName: string;
  phone: string;
  wilayaCode: string;
  wilayaNameFr: string;
  wilayaNameAr: string;
  commune: string;
  deliveryMode: 'home' | 'desk';
  notes?: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: OrderStatus;
  createdAt: string;
}

export interface BannedPhone {
  phone: string;
  reason: string;
  bannedBy?: string;
  notes?: string;
  createdAt: string;
}

export interface WilayaDeliveryFee {
  code: string;
  nameFr: string;
  nameAr: string;
  zone: string;
  homeFee: number;
  deskFee: number;
  isActive: boolean;
  estimatedDays: string;
  updatedAt?: string;
}

export function mapRowToDeliveryFee(row: any): WilayaDeliveryFee {
  return {
    code: String(row.code).padStart(2, '0'),
    nameFr: row.name_fr || '',
    nameAr: row.name_ar || '',
    zone: row.zone || 'centre',
    homeFee: Number(row.home_fee ?? 0),
    deskFee: Number(row.desk_fee ?? 0),
    isActive: row.is_active !== false,
    estimatedDays: row.estimated_days || '1-2',
    updatedAt: row.updated_at,
  };
}

export const DEFAULT_DELIVERY_FEES: WilayaDeliveryFee[] = WILAYAS.map((w) => ({
  code: w.code,
  nameFr: w.nameFr,
  nameAr: w.nameAr,
  zone: w.zone,
  homeFee: w.homeDeliveryFee,
  deskFee: w.deskDeliveryFee,
  isActive: true,
  estimatedDays: w.estimatedDays,
}));

export function normalizeAlgerianPhone(phone: string): string {
  if (!phone) return '';
  let digits = phone.replace(/\D/g, '');
  if (digits.startsWith('00213')) {
    digits = '0' + digits.substring(5);
  } else if (digits.startsWith('213') && digits.length > 9) {
    digits = '0' + digits.substring(3);
  }
  if (digits.length === 9 && (digits.startsWith('5') || digits.startsWith('6') || digits.startsWith('7'))) {
    digits = '0' + digits;
  }
  return digits;
}

interface OrderContextType {
  orders: Order[];
  bannedPhones: BannedPhone[];
  deliveryFees: WilayaDeliveryFee[];
  isSupabaseConnected: boolean;
  createOrder: (orderData: Omit<Order, 'id' | 'trackingCode' | 'createdAt' | 'status'>) => Order;
  updateOrderStatus: (orderId: string, status: OrderStatus, reason?: string) => void;
  getOrderById: (orderId: string) => Order | undefined;
  getOrderByTrackingCode: (code: string) => Order | undefined;
  deleteOrders: (orderIds: string[]) => Promise<{ success: boolean; error?: string }>;
  refreshOrders: () => Promise<void>;
  banPhone: (phone: string, reason?: string, notes?: string) => Promise<{ success: boolean; error?: string }>;
  unbanPhone: (phone: string) => Promise<{ success: boolean; error?: string }>;
  isPhoneBanned: (phone: string) => boolean;
  checkPhoneBannedAsync: (phone: string) => Promise<{ isBanned: boolean; reason?: string }>;
  refreshBannedPhones: () => Promise<void>;
  updateDeliveryFee: (code: string, homeFee: number, deskFee: number, isActive?: boolean) => Promise<{ success: boolean; error?: string }>;
  bulkUpdateDeliveryFees: (target: 'home' | 'desk' | 'both', amount: number, mode: 'set' | 'add') => Promise<{ success: boolean; error?: string }>;
  getDeliveryFeeForWilaya: (code: string, mode: 'home' | 'desk') => number;
  refreshDeliveryFees: () => Promise<void>;
  metrics: {
    totalRevenue: number;
    ordersCount: number;
    pendingCount: number;
    confirmedCount: number;
    inDeliveryCount: number;
    deliveredCount: number;
    retourCount: number;
  };
}

// Helper to map Supabase snake_case rows to Order interface
function mapRowToOrder(row: any): Order {
  return {
    id: row.id,
    trackingCode: row.tracking_code,
    fullName: row.full_name,
    phone: row.phone,
    wilayaCode: row.wilaya_code,
    wilayaNameFr: row.wilaya_name_fr,
    wilayaNameAr: row.wilaya_name_ar,
    commune: row.commune,
    deliveryMode: row.delivery_mode,
    notes: row.notes || undefined,
    items: Array.isArray(row.items) ? row.items : [],
    subtotal: Number(row.subtotal) || 0,
    deliveryFee: Number(row.delivery_fee) || 0,
    total: Number(row.total) || 0,
    status: row.status as OrderStatus,
    createdAt: row.created_at,
  };
}

// Helper to map Supabase snake_case rows to BannedPhone interface
function mapRowToBannedPhone(row: any): BannedPhone {
  return {
    phone: row.phone,
    reason: row.reason || 'Fraude ou refus de colis',
    bannedBy: row.banned_by || 'Admin',
    notes: row.notes || undefined,
    createdAt: row.created_at,
  };
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export function OrderProvider({ children }: { children: React.ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [bannedPhones, setBannedPhones] = useState<BannedPhone[]>([]);
  const [deliveryFees, setDeliveryFees] = useState<WilayaDeliveryFee[]>(DEFAULT_DELIVERY_FEES);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(false);

  // Fetch delivery fees from Supabase
  const fetchDeliveryFees = useCallback(async () => {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('delivery_fees')
          .select('*')
          .order('code', { ascending: true });

        if (!error && data && data.length > 0) {
          const mapped = data.map(mapRowToDeliveryFee);
          setDeliveryFees(mapped);
          try {
            localStorage.setItem('electronics_cached_delivery_fees', JSON.stringify(mapped));
          } catch (e) {
            // Ignore storage errors
          }
          return;
        }
      } catch (err) {
        console.warn('Supabase fetch delivery fees failed:', err);
      }
    }

    try {
      const saved = localStorage.getItem('electronics_cached_delivery_fees');
      if (saved) {
        setDeliveryFees(JSON.parse(saved));
      }
    } catch (e) {
      // Ignore
    }
  }, []);

  // Fetch banned phones from Supabase
  const fetchBannedPhones = useCallback(async () => {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('banned_phones')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data) {
          const mapped = data.map(mapRowToBannedPhone);
          setBannedPhones(mapped);
          try {
            localStorage.setItem('electronics_banned_phones', JSON.stringify(mapped));
          } catch (e) {
            // Ignore storage errors
          }
          return;
        }
      } catch (err) {
        console.warn('Supabase fetch banned phones failed:', err);
      }
    }

    try {
      const saved = localStorage.getItem('electronics_banned_phones');
      if (saved) {
        setBannedPhones(JSON.parse(saved));
      }
    } catch (e) {
      // Ignore
    }
  }, []);

  // Fetch orders from Supabase (strictly dynamic database data)
  const fetchOrders = useCallback(async () => {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data) {
          const mappedOrders = data.map(mapRowToOrder);
          setOrders(mappedOrders);
          setIsSupabaseConnected(true);
          try {
            localStorage.setItem('electronics_orders', JSON.stringify(mappedOrders));
          } catch (e) {
            // Ignore storage errors
          }
          return;
        }
      } catch (err) {
        console.warn('Supabase fetch orders failed:', err);
      }
    }

    // Fallback only to client's locally persisted orders from this session
    try {
      const saved = localStorage.getItem('electronics_orders');
      if (saved) {
        setOrders(JSON.parse(saved));
      } else {
        setOrders([]);
      }
    } catch (e) {
      setOrders([]);
    }
  }, []);

  useEffect(() => {
    // Attempt to load from localStorage cache first
    try {
      const savedFees = localStorage.getItem('electronics_cached_delivery_fees');
      if (savedFees) {
        const parsed = JSON.parse(savedFees);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setDeliveryFees(parsed);
        }
      }
    } catch (e) {
      // Ignore
    }

    fetchOrders();
    fetchBannedPhones();
    fetchDeliveryFees();

    // Subscribe to Realtime orders, banned_phones & delivery_fees if Supabase is available
    if (isSupabaseConfigured && supabase) {
      const client = supabase;
      const orderChannel = client
        .channel('public:orders')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'orders' },
          () => {
            fetchOrders();
          }
        )
        .subscribe();

      const banChannel = client
        .channel('public:banned_phones')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'banned_phones' },
          () => {
            fetchBannedPhones();
          }
        )
        .subscribe();

      const feeChannel = client
        .channel('public:delivery_fees')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'delivery_fees' },
          () => {
            fetchDeliveryFees();
          }
        )
        .subscribe();

      return () => {
        client.removeChannel(orderChannel);
        client.removeChannel(banChannel);
        client.removeChannel(feeChannel);
      };
    }
  }, [fetchOrders, fetchBannedPhones, fetchDeliveryFees]);

  const saveLocalOrders = (newOrders: Order[]) => {
    setOrders(newOrders);
    try {
      localStorage.setItem('electronics_orders', JSON.stringify(newOrders));
    } catch (e) {
      console.error('Failed to persist orders locally', e);
    }
  };

  const isPhoneBanned = useCallback(
    (rawPhone: string): boolean => {
      if (!rawPhone) return false;
      const clean = normalizeAlgerianPhone(rawPhone);
      return bannedPhones.some((b) => {
        const bClean = normalizeAlgerianPhone(b.phone);
        return bClean === clean || (clean.length >= 9 && bClean.endsWith(clean.slice(-9)));
      });
    },
    [bannedPhones]
  );

  const checkPhoneBannedAsync = useCallback(
    async (rawPhone: string): Promise<{ isBanned: boolean; reason?: string }> => {
      if (!rawPhone) return { isBanned: false };
      const clean = normalizeAlgerianPhone(rawPhone);

      // 1. Local state check
      const localMatch = bannedPhones.find((b) => {
        const bClean = normalizeAlgerianPhone(b.phone);
        return bClean === clean || (clean.length >= 9 && bClean.endsWith(clean.slice(-9)));
      });

      if (localMatch) {
        return { isBanned: true, reason: localMatch.reason };
      }

      // 2. Direct Supabase query
      if (isSupabaseConfigured && supabase) {
        try {
          const { data } = await supabase
            .from('banned_phones')
            .select('*')
            .or(`phone.eq.${clean},phone.eq.${rawPhone.trim()}`)
            .maybeSingle();

          if (data) {
            return { isBanned: true, reason: data.reason };
          }
        } catch (err) {
          // Ignore
        }
      }

      return { isBanned: false };
    },
    [bannedPhones]
  );

  const banPhone = async (
    rawPhone: string,
    reason?: string,
    notes?: string
  ): Promise<{ success: boolean; error?: string }> => {
    const clean = normalizeAlgerianPhone(rawPhone);
    if (!clean || clean.length < 9) {
      return {
        success: false,
        error: 'Numéro de téléphone invalide / رقم الهاتف غير صالح',
      };
    }

    const newBan: BannedPhone = {
      phone: clean,
      reason: reason?.trim() || 'Fraude, refus répété ou fausse commande',
      bannedBy: 'Admin DZ',
      notes: notes?.trim() || undefined,
      createdAt: new Date().toISOString(),
    };

    const updated = [newBan, ...bannedPhones.filter((b) => normalizeAlgerianPhone(b.phone) !== clean)];
    setBannedPhones(updated);
    try {
      localStorage.setItem('electronics_banned_phones', JSON.stringify(updated));
    } catch (e) {
      // Ignore
    }

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from('banned_phones').upsert({
          phone: newBan.phone,
          reason: newBan.reason,
          banned_by: newBan.bannedBy,
          notes: newBan.notes || null,
        });

        if (error) {
          console.error('Supabase ban phone error:', error.message);
          return { success: false, error: error.message };
        }
      } catch (err: any) {
        return { success: false, error: err?.message || 'Ban failed' };
      }
    }

    return { success: true };
  };

  const unbanPhone = async (rawPhone: string): Promise<{ success: boolean; error?: string }> => {
    const clean = normalizeAlgerianPhone(rawPhone);
    const updated = bannedPhones.filter(
      (b) => normalizeAlgerianPhone(b.phone) !== clean && b.phone !== rawPhone.trim()
    );
    setBannedPhones(updated);
    try {
      localStorage.setItem('electronics_banned_phones', JSON.stringify(updated));
    } catch (e) {
      // Ignore
    }

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase
          .from('banned_phones')
          .delete()
          .or(`phone.eq.${clean},phone.eq.${rawPhone.trim()}`);

        if (error) {
          console.error('Supabase unban phone error:', error.message);
          return { success: false, error: error.message };
        }
      } catch (err: any) {
        return { success: false, error: err?.message || 'Unban failed' };
      }
    }

    return { success: true };
  };

  const createOrder = (orderData: Omit<Order, 'id' | 'trackingCode' | 'createdAt' | 'status'>): Order => {
    const cleanPhone = normalizeAlgerianPhone(orderData.phone);
    if (isPhoneBanned(cleanPhone)) {
      throw new Error('BANNED_PHONE');
    }

    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const trackingCode = `DZ-${randomSuffix}-COD`;
    const newOrder: Order = {
      ...orderData,
      id: `ord-${Date.now()}`,
      trackingCode,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    // 1. Immediately update local state for smooth UX
    const updated = [newOrder, ...orders];
    saveLocalOrders(updated);

    // 2. Persist to Supabase if connected
    if (isSupabaseConfigured && supabase) {
      supabase
        .from('orders')
        .insert({
          id: newOrder.id,
          tracking_code: newOrder.trackingCode,
          full_name: newOrder.fullName,
          phone: newOrder.phone,
          wilaya_code: newOrder.wilayaCode,
          wilaya_name_fr: newOrder.wilayaNameFr,
          wilaya_name_ar: newOrder.wilayaNameAr,
          commune: newOrder.commune,
          delivery_mode: newOrder.deliveryMode,
          notes: newOrder.notes || null,
          items: newOrder.items,
          subtotal: newOrder.subtotal,
          delivery_fee: newOrder.deliveryFee,
          total: newOrder.total,
          status: newOrder.status,
          created_at: newOrder.createdAt,
        })
        .then(({ error }) => {
          if (error) {
            console.error('Error saving order to Supabase:', error.message);
          }
        });
    }

    return newOrder;
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus, reason?: string) => {
    // 1. Immediate local update
    const updated = orders.map((ord) => {
      if (ord.id !== orderId) return ord;
      const updatedNotes = reason
        ? ord.notes
          ? `${ord.notes} | Motif retour: ${reason}`
          : `Motif retour: ${reason}`
        : ord.notes;
      return { ...ord, status, notes: updatedNotes };
    });
    saveLocalOrders(updated);

    // 2. Persist to Supabase
    if (isSupabaseConfigured && supabase) {
      const target = updated.find((o) => o.id === orderId);
      const updatePayload: Record<string, any> = {
        status,
        updated_at: new Date().toISOString(),
      };
      if (target?.notes) {
        updatePayload.notes = target.notes;
      }

      supabase
        .from('orders')
        .update(updatePayload)
        .eq('id', orderId)
        .then(({ error }) => {
          if (error) {
            console.error('Error updating order status in Supabase:', error.message);
          }
        });
    }
  };

  const getOrderById = (orderId: string) => {
    return orders.find((ord) => ord.id === orderId);
  };

  const getOrderByTrackingCode = (code: string) => {
    return orders.find((ord) => ord.trackingCode.toLowerCase() === code.toLowerCase());
  };

  const deleteOrders = async (orderIds: string[]): Promise<{ success: boolean; error?: string }> => {
    if (!orderIds || orderIds.length === 0) return { success: true };
    const updated = orders.filter((o) => !orderIds.includes(o.id));
    saveLocalOrders(updated);

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from('orders').delete().in('id', orderIds);
        if (error) {
          console.error('Error deleting orders from Supabase:', error.message);
          return { success: false, error: error.message };
        }
      } catch (err: any) {
        return { success: false, error: err?.message || 'Delete orders failed' };
      }
    }
    return { success: true };
  };

  const getDeliveryFeeForWilaya = useCallback(
    (code: string, mode: 'home' | 'desk'): number => {
      const normalizedCode = String(code).padStart(2, '0');
      const found = deliveryFees.find((f) => f.code === normalizedCode || f.code === code);
      if (found && found.isActive) {
        return mode === 'home' ? found.homeFee : found.deskFee;
      }
      const staticWilaya = WILAYAS.find((w) => w.code === normalizedCode || w.code === code);
      if (staticWilaya) {
        return mode === 'home' ? staticWilaya.homeDeliveryFee : staticWilaya.deskDeliveryFee;
      }
      return mode === 'home' ? 600 : 350;
    },
    [deliveryFees]
  );

  const updateDeliveryFee = async (
    code: string,
    homeFee: number,
    deskFee: number,
    isActive: boolean = true
  ): Promise<{ success: boolean; error?: string }> => {
    const normalizedCode = String(code).padStart(2, '0');
    const updatedAt = new Date().toISOString();

    // 1. Immediate local update
    setDeliveryFees((prev) => {
      const next = prev.map((item) =>
        item.code === normalizedCode
          ? { ...item, homeFee, deskFee, isActive, updatedAt }
          : item
      );
      try {
        localStorage.setItem('electronics_cached_delivery_fees', JSON.stringify(next));
      } catch (e) {
        // Ignore
      }
      return next;
    });

    // 2. Database update
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase
          .from('delivery_fees')
          .update({
            home_fee: homeFee,
            desk_fee: deskFee,
            is_active: isActive,
            updated_at: updatedAt,
          })
          .eq('code', normalizedCode);

        if (error) {
          console.error('Database update delivery fee error:', error.message);
          return { success: false, error: error.message };
        }
      } catch (err: any) {
        return { success: false, error: err.message || 'Erreur mise à jour tarif livraison' };
      }
    }
    return { success: true };
  };

  const bulkUpdateDeliveryFees = async (
    target: 'home' | 'desk' | 'both',
    amount: number,
    mode: 'set' | 'add'
  ): Promise<{ success: boolean; error?: string }> => {
    const updatedAt = new Date().toISOString();

    const updated = deliveryFees.map((f) => {
      let newHome = f.homeFee;
      let newDesk = f.deskFee;

      if (target === 'home' || target === 'both') {
        newHome = mode === 'set' ? Math.max(0, amount) : Math.max(0, f.homeFee + amount);
      }
      if (target === 'desk' || target === 'both') {
        newDesk = mode === 'set' ? Math.max(0, amount) : Math.max(0, f.deskFee + amount);
      }

      return {
        ...f,
        homeFee: newHome,
        deskFee: newDesk,
        updatedAt,
      };
    });

    setDeliveryFees(updated);
    try {
      localStorage.setItem('electronics_cached_delivery_fees', JSON.stringify(updated));
    } catch (e) {
      // Ignore
    }

    if (isSupabaseConfigured && supabase) {
      try {
        const rows = updated.map((f) => ({
          code: f.code,
          name_fr: f.nameFr,
          name_ar: f.nameAr,
          zone: f.zone,
          home_fee: f.homeFee,
          desk_fee: f.deskFee,
          is_active: f.isActive,
          estimated_days: f.estimatedDays,
          updated_at: updatedAt,
        }));

        const { error } = await supabase
          .from('delivery_fees')
          .upsert(rows, { onConflict: 'code' });

        if (error) {
          console.error('Database bulk update delivery fees error:', error.message);
          return { success: false, error: error.message };
        }
      } catch (err: any) {
        return { success: false, error: err.message || 'Erreur mise à jour groupée' };
      }
    }

    return { success: true };
  };

  const totalRevenue = orders
    .filter((o) => o.status !== 'cancelled' && o.status !== 'retour')
    .reduce((sum, o) => sum + o.total, 0);

  const pendingCount = orders.filter((o) => o.status === 'pending').length;
  const confirmedCount = orders.filter((o) => o.status === 'confirmed').length;
  const inDeliveryCount = orders.filter((o) => o.status === 'in_delivery').length;
  const deliveredCount = orders.filter((o) => o.status === 'delivered').length;
  const retourCount = orders.filter((o) => o.status === 'retour').length;

  return (
    <OrderContext.Provider
      value={{
        orders,
        bannedPhones,
        deliveryFees,
        isSupabaseConnected,
        createOrder,
        updateOrderStatus,
        getOrderById,
        getOrderByTrackingCode,
        deleteOrders,
        refreshOrders: fetchOrders,
        banPhone,
        unbanPhone,
        isPhoneBanned,
        checkPhoneBannedAsync,
        refreshBannedPhones: fetchBannedPhones,
        updateDeliveryFee,
        bulkUpdateDeliveryFees,
        getDeliveryFeeForWilaya,
        refreshDeliveryFees: fetchDeliveryFees,
        metrics: {
          totalRevenue,
          ordersCount: orders.length,
          pendingCount,
          confirmedCount,
          inDeliveryCount,
          deliveredCount,
          retourCount,
        },
      }}
    >
      {children}
    </OrderContext.Provider>
  );
}

export function useOrders() {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
}

export function useDeliveryFees() {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useDeliveryFees must be used within an OrderProvider');
  }
  return {
    deliveryFees: context.deliveryFees,
    updateDeliveryFee: context.updateDeliveryFee,
    bulkUpdateDeliveryFees: context.bulkUpdateDeliveryFees,
    getDeliveryFeeForWilaya: context.getDeliveryFeeForWilaya,
    refreshDeliveryFees: context.refreshDeliveryFees,
  };
}
