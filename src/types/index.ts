export type UserRole = 'kupa' | 'manager' | 'admin';
export type BuyerType = 'yeshiva' | 'external';
export type PaymentMethod = 'cash' | 'credit' | 'special';
export type AgentType = 'commission' | 'purchase';

export interface User {
  id: string;
  name: string;
  username: string;
  password: string;
  role: UserRole;
}

export interface PriceHistoryEntry {
  id: string;
  fromDate: string;
  toDate: string | null;
  yeshivaPrice: number;
  externalPrice: number;
  costPrice: number;
  quantitySold: number;
  totalRevenue: number;
  totalProfit: number;
}

export interface Supply {
  id: string;
  date: string;
  quantity: number;
  costPerUnit: number;
}

export interface ProductVariant {
  id: string;
  sizeType: string;   // = type (סוג)
  size: string;       // מידה (separate field)
  details1: string;   // = details (פרטים נוספים)
  details2: string;   // = cut (פרטים נוספים 2)
  yeshivaPrice: number;   // = priceInternal
  externalPrice: number;  // = priceExternal
  costPrice: number;
  priceHistory: PriceHistoryEntry[];
  supplies: Supply[];
  currentStock: number;
  totalSold: number;
}

export interface Product {
  id: string;
  name: string;
  supplierId: string;
  category: string;
  barcode: string;
  company: string;
  variants: ProductVariant[];
  isActive: boolean;
  createdAt: string;
}

export interface CartItem {
  productId: string;
  productName: string;
  variantId: string;
  variantDescription: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Transaction {
  id: string;
  date: string;
  items: CartItem[];
  buyerType: BuyerType;
  paymentMethod: PaymentMethod;
  totalAmount: number;
  nedarimReference?: string;
  transferredToSafe: boolean;
  cashierName: string;
}

export interface Supplier {
  id: string;
  name: string;
  type: AgentType;
  contactInfo: string;
  phone: string;
}

export interface SupplierPayment {
  id: string;
  supplierId: string;
  date: string;
  amount: number;
  description: string;
}

export interface SafeEntry {
  id: string;
  date: string;
  type: 'income' | 'expense';
  source: 'cash' | 'credit' | 'special' | 'supplier_payment';
  amount: number;
  description: string;
}

export interface Settings {
  nedarimInstitutionCode: string;
  nedarimApiKey: string;
  storeName: string;
  specialApprovalCode: string;
}

export interface SpecialApproval {
  id: string;
  date: string;
  customerType: 'yeshiva' | 'external';
  total: number;
  items: CartItem[];
  firstName: string;
  lastName: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  approverName: string;
  resolvedAt: string | null;
}
