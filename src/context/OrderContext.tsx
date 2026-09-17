'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Wilaya, getWilayaByCode } from '@/data/wilayas';

export interface OrderItem {
  productId: string;
  productNameFr: string;
  productNameAr: string;
  price: number;
  quantity: number;
  selectedColor?: string;
  image?: string;
}

export type OrderStatus = 'pending' | 'confirmed' | 'in_delivery' | 'delivered' | 'cancelled';

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
  createOrder: (orderData: Omit<Order, 'id' | 'trackingCode' | 'createdAt' | 'status'>) => Order;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  getOrderById: (orderId: string) => Order | undefined;
  getOrderByTrackingCode: (code: string) => Order | undefined;
  metrics: {
    totalRevenue: number;
    ordersCount: number;
    pendingCount: number;
    deliveredCount: number;
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
];

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export function OrderProvider({ children }: { children: React.ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('electronics_orders');
      if (saved) {
        setOrders(JSON.parse(saved));
      } else {
        setOrders(INITIAL_ORDERS);
        localStorage.setItem('electronics_orders', JSON.stringify(INITIAL_ORDERS));
      }
    } catch (e) {
      console.error('Failed to load orders', e);
      setOrders(INITIAL_ORDERS);
    }
  }, []);

  const saveOrders = (newOrders: Order[]) => {
    setOrders(newOrders);
    try {
      localStorage.setItem('electronics_orders', JSON.stringify(newOrders));
    } catch (e) {
      console.error('Failed to persist orders', e);
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

    const updated = [newOrder, ...orders];
    saveOrders(updated);
    return newOrder;
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    const updated = orders.map((ord) => (ord.id === orderId ? { ...ord, status } : ord));
    saveOrders(updated);
  };

  const getOrderById = (orderId: string) => {
    return orders.find((ord) => ord.id === orderId);
  };

  const getOrderByTrackingCode = (code: string) => {
    return orders.find((ord) => ord.trackingCode.toLowerCase() === code.toLowerCase());
  };

  const totalRevenue = orders
    .filter((o) => o.status !== 'cancelled')
    .reduce((sum, o) => sum + o.total, 0);

  const pendingCount = orders.filter((o) => o.status === 'pending').length;
  const deliveredCount = orders.filter((o) => o.status === 'delivered').length;

  return (
    <OrderContext.Provider
      value={{
        orders,
        createOrder,
        updateOrderStatus,
        getOrderById,
        getOrderByTrackingCode,
        metrics: {
          totalRevenue,
          ordersCount: orders.length,
          pendingCount,
          deliveredCount,
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
