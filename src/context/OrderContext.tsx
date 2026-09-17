'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

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

interface OrderContextType {
  orders: Order[];
  isSupabaseConnected: boolean;
  createOrder: (orderData: Omit<Order, 'id' | 'trackingCode' | 'createdAt' | 'status'>) => Order;
  updateOrderStatus: (orderId: string, status: OrderStatus, reason?: string) => void;
  getOrderById: (orderId: string) => Order | undefined;
  getOrderByTrackingCode: (code: string) => Order | undefined;
  refreshOrders: () => Promise<void>;
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

const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord-101',
    trackingCode: 'DZ-92841-COD',
    fullName: 'Yacine Brahimi',
    phone: '0550123456',
    wilayaCode: '16',
    wilayaNameFr: 'Alger',
    wilayaNameAr: 'الجزائر العاصمة',
    commune: 'Hydra, Résidence Les Pins',
    deliveryMode: 'home',
    notes: 'Appeler avant 14h svp',
    items: [
      {
        productId: 'prod-1',
        productNameFr: 'Aura Pro 2 — Écouteurs ANC Transparent',
        productNameAr: 'أورا برو 2 — سماعات لاسلكية شفافة مع عزل نشط',
        price: 6800,
        quantity: 1,
        selectedColor: 'Noir Obsidian Fumé',
        image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?q=80&w=300&auto=format&fit=crop',
      },
    ],
    subtotal: 6800,
    deliveryFee: 400,
    total: 7200,
    status: 'in_delivery',
    createdAt: '2026-09-17T14:30:00Z',
  },
  {
    id: 'ord-102',
    trackingCode: 'DZ-74198-COD',
    fullName: 'Sara Mansouri',
    phone: '0661987654',
    wilayaCode: '31',
    wilayaNameFr: 'Oran',
    wilayaNameAr: 'وهران',
    commune: 'Akid Lotfi, Face Clinique',
    deliveryMode: 'desk',
    items: [
      {
        productId: 'prod-2',
        productNameFr: 'Apex Studio 90 — Casque Hi-Res Wireless',
        productNameAr: 'أبيكس ستوديو 90 — سماعات رأس محيطية احترافية Hi-Res',
        price: 14900,
        quantity: 1,
        selectedColor: 'Gris Sidéral Brossé',
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=300&auto=format&fit=crop',
      },
      {
        productId: 'prod-7',
        productNameFr: 'Pack Câbles Armored Kevlar 240W',
        productNameAr: 'حزمة كابلات كيفلار المدرعة 240 واط',
        price: 3200,
        quantity: 1,
        selectedColor: 'Noir & Tissage Orange',
      },
    ],
    subtotal: 18100,
    deliveryFee: 300,
    total: 18400,
    status: 'confirmed',
    createdAt: '2026-09-17T11:15:00Z',
  },
  {
    id: 'ord-103',
    trackingCode: 'DZ-61520-COD',
    fullName: 'Karim Ziane',
    phone: '0770456123',
    wilayaCode: '25',
    wilayaNameFr: 'Constantine',
    wilayaNameAr: 'قسنطينة',
    commune: 'Ali Mendjeli, UV 05',
    deliveryMode: 'home',
    items: [
      {
        productId: 'prod-4',
        productNameFr: 'HyperGaN 120W — Chargeur 4 Ports Ultra-Compact',
        productNameAr: 'هايبر جان 120 واط — شاحن GaN فائق السرعة',
        price: 7200,
        quantity: 2,
        selectedColor: 'Noir Mat Graphite',
      },
    ],
    subtotal: 14400,
    deliveryFee: 600,
    total: 15000,
    status: 'delivered',
    createdAt: '2026-09-16T18:45:00Z',
  },
  {
    id: 'ord-104',
    trackingCode: 'DZ-48209-COD',
    fullName: 'Mehdi Belkacem',
    phone: '0555332211',
    wilayaCode: '19',
    wilayaNameFr: 'Sétif',
    wilayaNameAr: 'سطيف',
    commune: 'El Eulma Centre',
    deliveryMode: 'home',
    items: [
      {
        productId: 'prod-5',
        productNameFr: 'TitanMag 10000 — Batterie MagSafe Transparent',
        productNameAr: 'تيتان ماج 10000 — بطارية ماغ سيف شفافة سريعة Qi2',
        price: 6400,
        quantity: 1,
        selectedColor: 'Noir Fumé Transparent',
      },
    ],
    subtotal: 6400,
    deliveryFee: 600,
    total: 7000,
    status: 'pending',
    createdAt: '2026-09-17T18:10:00Z',
  },
  {
    id: 'ord-105',
    trackingCode: 'DZ-31902-COD',
    fullName: 'Amine Benali',
    phone: '0561884422',
    wilayaCode: '06',
    wilayaNameFr: 'Béjaïa',
    wilayaNameAr: 'بجاية',
    commune: 'Akbou Centre',
    deliveryMode: 'home',
    notes: 'Motif retour: Client injoignable au téléphone après 3 tentatives d\'appel',
    items: [
      {
        productId: 'prod-3',
        productNameFr: 'Horizon Ultra — Smartwatch AMOLED Titane',
        productNameAr: 'هورايزون ألترا — ساعة ذكية تيتانيوم شاشة أموليد',
        price: 18500,
        quantity: 1,
        selectedColor: 'Titane Naturel',
      },
    ],
    subtotal: 18500,
    deliveryFee: 500,
    total: 19000,
    status: 'retour',
    createdAt: '2026-09-15T09:20:00Z',
  },
];

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

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export function OrderProvider({ children }: { children: React.ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(false);

  // Fetch orders from Supabase (or fallback to localStorage)
  const fetchOrders = useCallback(async () => {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          const mappedOrders = data.map(mapRowToOrder);
          setOrders(mappedOrders);
          setIsSupabaseConnected(true);
          try {
            localStorage.setItem('electronics_orders', JSON.stringify(mappedOrders));
          } catch (e) {
            // Ignore storage errors
          }
          return;
        } else if (!error && data && data.length === 0) {
          setIsSupabaseConnected(true);
        }
      } catch (err) {
        console.warn('Supabase fetch failed, falling back to local data', err);
      }
    }

    // Fallback to localStorage or INITIAL_ORDERS
    try {
      const saved = localStorage.getItem('electronics_orders');
      if (saved) {
        setOrders(JSON.parse(saved));
      } else {
        setOrders(INITIAL_ORDERS);
        localStorage.setItem('electronics_orders', JSON.stringify(INITIAL_ORDERS));
      }
    } catch (e) {
      setOrders(INITIAL_ORDERS);
    }
  }, []);

  useEffect(() => {
    fetchOrders();

    // Subscribe to Realtime orders if Supabase is available
    if (isSupabaseConfigured && supabase) {
      const client = supabase;
      const channel = client
        .channel('public:orders')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'orders' },
          () => {
            fetchOrders();
          }
        )
        .subscribe();

      return () => {
        client.removeChannel(channel);
      };
    }
  }, [fetchOrders]);

  const saveLocalOrders = (newOrders: Order[]) => {
    setOrders(newOrders);
    try {
      localStorage.setItem('electronics_orders', JSON.stringify(newOrders));
    } catch (e) {
      console.error('Failed to persist orders locally', e);
    }
  };

  const createOrder = (orderData: Omit<Order, 'id' | 'trackingCode' | 'createdAt' | 'status'>): Order => {
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
        isSupabaseConnected,
        createOrder,
        updateOrderStatus,
        getOrderById,
        getOrderByTrackingCode,
        refreshOrders: fetchOrders,
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
