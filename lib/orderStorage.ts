export type StoredOrder = {
  orderId: string;
  items: {
    id: string;
    name: string;
    price: number;
    image: string;
    quantity: number;
  }[];
  fulfillmentType: "delivery" | "pickup";
  berthInfo: {
    marinaName?: string;
    berthNumber?: string;
    timeSlot?: string;
    deliveryDate?: string;
    deliveryTime?: string;
  };
  pickupInfo?: {
    pickupDate?: string;
    pickupTimeSlot?: string;
    pickupTime?: string;
  };
  placedAt: string;
  total: number;
};

const STORAGE_KEY = "yachtdrop_orders";

export function saveOrder(order: StoredOrder): void {
  const orders = getOrders();
  orders.unshift(order);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
}

export function getOrders(): StoredOrder[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
  } catch {
    return [];
  }
}
