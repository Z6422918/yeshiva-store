import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type {
  User, Product, ProductVariant, Supplier, Transaction, SafeEntry,
  Settings, CartItem, BuyerType, PaymentMethod, SpecialApproval,
  Supply, SupplierPayment
} from '../types';

interface AppState {
  // Auth
  currentUser: User | null;
  users: User[];

  // Data
  products: Product[];
  suppliers: Supplier[];
  transactions: Transaction[];
  safeEntries: SafeEntry[];
  specialApprovals: SpecialApproval[];
  supplierPayments: SupplierPayment[];

  // Settings
  settings: Settings;

  // Cart
  cart: CartItem[];
  buyerType: BuyerType;

  // Actions - Auth
  login: (username: string, password: string) => boolean;
  logout: () => void;
  addUser: (user: Omit<User, 'id'>) => void;
  updateUser: (id: string, data: Partial<User>) => void;
  deleteUser: (id: string) => void;

  // Actions - Products
  addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => string;
  updateProduct: (id: string, data: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  addVariant: (productId: string, variant: Omit<ProductVariant, 'id' | 'priceHistory' | 'supplies' | 'currentStock' | 'totalSold'>) => void;
  updateVariant: (productId: string, variantId: string, data: Partial<ProductVariant>) => void;
  deleteVariant: (productId: string, variantId: string) => void;
  addSupply: (productId: string, variantId: string, supply: Omit<Supply, 'id'>) => void;
  deleteSupply: (productId: string, variantId: string, supplyId: string) => void;

  // Actions - Suppliers
  addSupplier: (supplier: Omit<Supplier, 'id'>) => void;
  updateSupplier: (id: string, data: Partial<Supplier>) => void;
  deleteSupplier: (id: string) => void;

  // Actions - Cart
  setBuyerType: (type: BuyerType) => void;
  addToCart: (item: CartItem) => void;
  updateCartItem: (variantId: string, quantity: number) => void;
  removeFromCart: (variantId: string) => void;
  clearCart: () => void;

  // Actions - Transactions
  completeTransaction: (paymentMethod: PaymentMethod, nedarimRef?: string) => Transaction;
  completeSpecialApproval: (approvalId: string, approverName: string) => void;
  moveTransactionToMethod: (transactionId: string, method: 'cash' | 'credit') => void;
  transferToSafe: (source: 'cash' | 'credit', transactionIds: string[], amount: number) => void;

  // Actions - Safe
  addSafeEntry: (entry: Omit<SafeEntry, 'id'>) => void;
  deleteSafeEntry: (id: string) => void;
  paySupplier: (supplierId: string, amount: number, description: string) => void;

  // Actions - Special Approvals
  addSpecialApproval: (approval: Omit<SpecialApproval, 'id' | 'date'>) => void;
  updateApprovalStatus: (id: string, status: 'approved' | 'rejected' | 'cancelled', approverName?: string) => void;

  // Actions - Settings
  updateSettings: (settings: Partial<Settings>) => void;

  // Computed
  getCashNotTransferred: () => number;
  getCreditNotTransferred: () => number;
  getSafeBalance: () => number;
  getSupplierDebt: (supplierId: string) => number;
  getTotalCommissionDebt: () => number;
  getTotalPurchaseDebt: () => number;
  getProductById: (id: string) => Product | undefined;
  getSupplierById: (id: string) => Supplier | undefined;
}

const initialSettings: Settings = {
  nedarimInstitutionCode: '',
  nedarimApiKey: '',
  storeName: 'חנות הישיבה',
  specialApprovalCode: '1234',
};

const adminUser: User = {
  id: 'admin-1',
  name: 'מנהל ראשי',
  username: 'admin',
  password: '1234',
  role: 'admin',
};

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      users: [adminUser],
      products: [],
      suppliers: [],
      transactions: [],
      safeEntries: [],
      specialApprovals: [],
      supplierPayments: [],
      settings: initialSettings,
      cart: [],
      buyerType: 'yeshiva',

      login: (username, password) => {
        const user = get().users.find(u => u.username === username && u.password === password);
        if (user) { set({ currentUser: user }); return true; }
        return false;
      },
      logout: () => set({ currentUser: null, cart: [], buyerType: 'yeshiva' }),

      addUser: (user) => set(s => ({ users: [...s.users, { ...user, id: uuidv4() }] })),
      updateUser: (id, data) => set(s => ({ users: s.users.map(u => u.id === id ? { ...u, ...data } : u) })),
      deleteUser: (id) => set(s => ({ users: s.users.filter(u => u.id !== id) })),

      addProduct: (product) => {
        const id = uuidv4();
        set(s => ({
          products: [...s.products, { ...product, id, createdAt: new Date().toISOString() }]
        }));
        return id;
      },
      updateProduct: (id, data) => set(s => ({
        products: s.products.map(p => p.id === id ? { ...p, ...data } : p)
      })),
      deleteProduct: (id) => set(s => ({ products: s.products.filter(p => p.id !== id) })),

      addVariant: (productId, variant) => set(s => ({
        products: s.products.map(p => p.id === productId ? {
          ...p,
          variants: [...p.variants, {
            ...variant,
            size: variant.size ?? '',
            id: uuidv4(),
            priceHistory: [],
            supplies: [],
            currentStock: 0,
            totalSold: 0,
          }]
        } : p)
      })),

      updateVariant: (productId, variantId, data) => set(s => ({
        products: s.products.map(p => {
          if (p.id !== productId) return p;
          return {
            ...p,
            variants: p.variants.map(v => {
              if (v.id !== variantId) return v;
              // If price changed, save to history
              const priceChanged = data.yeshivaPrice !== undefined && data.yeshivaPrice !== v.yeshivaPrice ||
                                   data.externalPrice !== undefined && data.externalPrice !== v.externalPrice;
              const newHistory = priceChanged ? [
                ...v.priceHistory.map(h => h.toDate === null ? { ...h, toDate: new Date().toISOString().split('T')[0] } : h),
                {
                  id: uuidv4(),
                  fromDate: new Date().toISOString().split('T')[0],
                  toDate: null,
                  yeshivaPrice: data.yeshivaPrice ?? v.yeshivaPrice,
                  externalPrice: data.externalPrice ?? v.externalPrice,
                  costPrice: data.costPrice ?? v.costPrice,
                  quantitySold: 0,
                  totalRevenue: 0,
                  totalProfit: 0,
                }
              ] : v.priceHistory;
              return { ...v, ...data, priceHistory: newHistory };
            })
          };
        })
      })),

      deleteVariant: (productId, variantId) => set(s => ({
        products: s.products.map(p => p.id === productId
          ? { ...p, variants: p.variants.filter(v => v.id !== variantId) }
          : p)
      })),

      addSupply: (productId, variantId, supply) => set(s => ({
        products: s.products.map(p => {
          if (p.id !== productId) return p;
          return {
            ...p,
            variants: p.variants.map(v => {
              if (v.id !== variantId) return v;
              return {
                ...v,
                supplies: [...v.supplies, { ...supply, id: uuidv4() }],
                currentStock: v.currentStock + supply.quantity,
              };
            })
          };
        })
      })),

      deleteSupply: (productId, variantId, supplyId) => set(s => ({
        products: s.products.map(p => {
          if (p.id !== productId) return p;
          return {
            ...p,
            variants: p.variants.map(v => {
              if (v.id !== variantId) return v;
              const removed = v.supplies.find(s => s.id === supplyId);
              return {
                ...v,
                supplies: v.supplies.filter(s => s.id !== supplyId),
                currentStock: Math.max(0, v.currentStock - (removed?.quantity ?? 0)),
              };
            })
          };
        })
      })),

      addSupplier: (supplier) => set(s => ({ suppliers: [...s.suppliers, { ...supplier, id: uuidv4() }] })),
      updateSupplier: (id, data) => set(s => ({ suppliers: s.suppliers.map(sup => sup.id === id ? { ...sup, ...data } : sup) })),
      deleteSupplier: (id) => set(s => ({ suppliers: s.suppliers.filter(s => s.id !== id) })),

      setBuyerType: (type) => set({ buyerType: type }),

      addToCart: (item) => set(s => {
        const existing = s.cart.find(c => c.variantId === item.variantId);
        if (existing) {
          return {
            cart: s.cart.map(c => c.variantId === item.variantId
              ? { ...c, quantity: c.quantity + item.quantity, totalPrice: (c.quantity + item.quantity) * c.unitPrice }
              : c)
          };
        }
        return { cart: [...s.cart, item] };
      }),

      updateCartItem: (variantId, quantity) => set(s => ({
        cart: quantity <= 0
          ? s.cart.filter(c => c.variantId !== variantId)
          : s.cart.map(c => c.variantId === variantId
              ? { ...c, quantity, totalPrice: quantity * c.unitPrice }
              : c)
      })),

      removeFromCart: (variantId) => set(s => ({ cart: s.cart.filter(c => c.variantId !== variantId) })),
      clearCart: () => set({ cart: [] }),

      completeTransaction: (paymentMethod, nedarimRef) => {
        const { cart, buyerType, currentUser } = get();
        const total = cart.reduce((sum, item) => sum + item.totalPrice, 0);
        const transaction: Transaction = {
          id: uuidv4(),
          date: new Date().toISOString(),
          items: [...cart],
          buyerType,
          paymentMethod,
          totalAmount: total,
          nedarimReference: nedarimRef,
          transferredToSafe: false,
          cashierName: currentUser?.name ?? 'לא ידוע',
        };
        set(s => {
          // Update stock for each item
          const updatedProducts = s.products.map(p => ({
            ...p,
            variants: p.variants.map(v => {
              const cartItem = cart.find(c => c.productId === p.id && c.variantId === v.id);
              if (!cartItem) return v;
              return {
                ...v,
                currentStock: Math.max(0, v.currentStock - cartItem.quantity),
                totalSold: v.totalSold + cartItem.quantity,
              };
            })
          }));
          return {
            transactions: [...s.transactions, transaction],
            products: updatedProducts,
            cart: [],
            buyerType: 'yeshiva',
          };
        });
        return transaction;
      },

      transferToSafe: (source, transactionIds, amount) => set(s => ({
        transactions: s.transactions.map(t =>
          transactionIds.includes(t.id) ? { ...t, transferredToSafe: true } : t
        ),
        safeEntries: [...s.safeEntries, {
          id: uuidv4(),
          date: new Date().toISOString().split('T')[0],
          type: 'income',
          source,
          amount,
          description: `העברה מ${source === 'cash' ? 'מזומן' : 'אשראי'} לכספת`,
        }]
      })),

      addSafeEntry: (entry) => set(s => ({ safeEntries: [...s.safeEntries, { ...entry, id: uuidv4() }] })),
      deleteSafeEntry: (id) => set(s => ({ safeEntries: s.safeEntries.filter(e => e.id !== id) })),

      paySupplier: (supplierId, amount, description) => {
        const supplier = get().suppliers.find(s => s.id === supplierId);
        set(s => ({
          safeEntries: [...s.safeEntries, {
            id: uuidv4(),
            date: new Date().toISOString().split('T')[0],
            type: 'expense',
            source: 'supplier_payment',
            amount,
            description: `תשלום ל${supplier?.name ?? 'ספק'}: ${description}`,
          }],
          supplierPayments: [...s.supplierPayments, {
            id: uuidv4(),
            supplierId,
            date: new Date().toISOString().split('T')[0],
            amount,
            description,
          }]
        }));
      },

      addSpecialApproval: (approval) => set(s => ({
        specialApprovals: [...s.specialApprovals, {
          ...approval, id: uuidv4(), date: new Date().toISOString()
        }]
      })),

      updateApprovalStatus: (id, status, approverName) => set(s => ({
        specialApprovals: s.specialApprovals.map(a =>
          a.id === id ? { ...a, status, approverName: approverName ?? a.approverName, resolvedAt: new Date().toISOString() } : a
        )
      })),

      completeSpecialApproval: (approvalId, approverName) => {
        const { specialApprovals, products } = get();
        const approval = specialApprovals.find(a => a.id === approvalId);
        if (!approval) return;
        const transaction: Transaction = {
          id: uuidv4(),
          date: new Date().toISOString(),
          items: approval.items,
          buyerType: approval.customerType,
          paymentMethod: 'special',
          totalAmount: approval.total,
          transferredToSafe: false,
          cashierName: approverName,
        };
        set(s => {
          const updatedProducts = s.products.map(p => ({
            ...p,
            variants: p.variants.map(v => {
              const item = approval.items.find(i => i.productId === p.id && i.variantId === v.id);
              if (!item) return v;
              return {
                ...v,
                currentStock: Math.max(0, v.currentStock - item.quantity),
                totalSold: v.totalSold + item.quantity,
              };
            })
          }));
          return {
            transactions: [...s.transactions, transaction],
            products: updatedProducts,
            specialApprovals: s.specialApprovals.map(a =>
              a.id === approvalId
                ? { ...a, status: 'approved', approverName, resolvedAt: new Date().toISOString() }
                : a
            ),
          };
        });
      },

      moveTransactionToMethod: (transactionId, method) => set(s => ({
        transactions: s.transactions.map(t =>
          t.id === transactionId ? { ...t, paymentMethod: method } : t
        )
      })),

      updateSettings: (settings) => set(s => ({ settings: { ...s.settings, ...settings } })),

      getCashNotTransferred: () => {
        const { transactions } = get();
        return transactions
          .filter(t => t.paymentMethod === 'cash' && !t.transferredToSafe)
          .reduce((sum, t) => sum + t.totalAmount, 0);
      },

      getCreditNotTransferred: () => {
        const { transactions } = get();
        return transactions
          .filter(t => t.paymentMethod === 'credit' && !t.transferredToSafe)
          .reduce((sum, t) => sum + t.totalAmount, 0);
      },

      getSafeBalance: () => {
        const { safeEntries } = get();
        return safeEntries.reduce((sum, e) => e.type === 'income' ? sum + e.amount : sum - e.amount, 0);
      },

      getSupplierDebt: (supplierId) => {
        const { products, transactions, supplierPayments } = get();
        const supplier = get().suppliers.find(s => s.id === supplierId);
        if (!supplier) return 0;

        let totalOwed = 0;

        if (supplier.type === 'purchase') {
          // Owe for all supplied merchandise (cost of all supplies)
          products
            .filter(p => p.supplierId === supplierId)
            .forEach(p => {
              p.variants.forEach(v => {
                v.supplies.forEach(sup => {
                  totalOwed += sup.quantity * sup.costPerUnit;
                });
              });
            });
        } else {
          // Commission: only owe for sold items
          transactions.forEach(t => {
            t.items.forEach(item => {
              const product = products.find(p => p.id === item.productId);
              if (product?.supplierId === supplierId) {
                const variant = product.variants.find(v => v.id === item.variantId);
                if (variant) {
                  totalOwed += item.quantity * variant.costPrice;
                }
              }
            });
          });
        }

        const paid = supplierPayments
          .filter(p => p.supplierId === supplierId)
          .reduce((sum, p) => sum + p.amount, 0);

        return Math.max(0, totalOwed - paid);
      },

      getTotalCommissionDebt: () => {
        const { suppliers } = get();
        return suppliers
          .filter(s => s.type === 'commission')
          .reduce((sum, s) => sum + get().getSupplierDebt(s.id), 0);
      },

      getTotalPurchaseDebt: () => {
        const { suppliers } = get();
        return suppliers
          .filter(s => s.type === 'purchase')
          .reduce((sum, s) => sum + get().getSupplierDebt(s.id), 0);
      },

      getProductById: (id) => get().products.find(p => p.id === id),
      getSupplierById: (id) => get().suppliers.find(s => s.id === id),
    }),
    { name: 'yeshiva-store-data' }
  )
);
