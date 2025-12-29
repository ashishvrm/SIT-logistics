export type TripStatus =
  | 'Draft'
  | 'Assigned'
  | 'Accepted'
  | 'Started'
  | 'PickupArrived'
  | 'Loaded'
  | 'InTransit'
  | 'DropArrived'
  | 'PODSubmitted'
  | 'Completed';

export interface Org {
  id: string;
  name: string;
}

export interface Branch {
  id: string;
  name: string;
  orgId: string;
}

export type Role = 'Driver' | 'Fleet';

export interface Driver {
  id: string;
  name: string;
  phone: string;
  rating: number;
}

export interface Vehicle {
  id: string;
  plate: string;
  model: string;
  status: 'moving' | 'idle' | 'offline' | 'on-trip';
  lat: number;
  lng: number;
  speed: number;
  heading: number;
  lastSeen: string;
  driverId?: string;
}

export interface Shipment {
  id: string;
  customer: string;
  cargo: string;
  weight: string;
  pickup: string;
  drop: string;
  eta: string;
}

export interface Trip {
  id: string;
  code: string;
  status: TripStatus;
  vehicleId: string;
  driverId: string;
  pickup: string;
  drop: string;
  customer: string;
  startTime: string;
  eta: string;
  distanceKm: number;
  cargo: string;
  checkpoints: string[];
  route: { lat: number; lng: number }[];
}

export interface Invoice {
  id: string;
  customer: string;
  amount: number;
  status: 'Draft' | 'Sent' | 'Paid' | 'Overdue';
  dueDate: string;
}

export interface Alert {
  id: string;
  severity: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  createdAt: string;
  acknowledged: boolean;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
}

export interface PendingAction {
  id: string;
  type: 'POD' | 'Status';
  payload: Record<string, unknown>;
  createdAt: string;
}
