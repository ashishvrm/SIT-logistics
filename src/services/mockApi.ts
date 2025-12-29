import { Alert, Branch, Driver, Invoice, NotificationItem, Org, Trip, TripStatus, Vehicle } from './types';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const orgs: Org[] = [
  { id: 'org1', name: 'Apex Logistics' },
  { id: 'org2', name: 'Northlane Freight' }
];

const branches: Branch[] = [
  { id: 'b1', name: 'Mumbai Hub', orgId: 'org1' },
  { id: 'b2', name: 'Delhi Hub', orgId: 'org1' },
  { id: 'b3', name: 'Bengaluru Yard', orgId: 'org2' }
];

const drivers: Driver[] = [
  { id: 'd1', name: 'Arjun Singh', phone: '+91 98765 12345', rating: 4.8 },
  { id: 'd2', name: 'Meera Iyer', phone: '+91 98111 11223', rating: 4.6 }
];

const routePolyline = [
  { lat: 19.076, lng: 72.8777 },
  { lat: 19.17, lng: 73.0 },
  { lat: 19.25, lng: 73.1 },
  { lat: 19.35, lng: 73.2 }
];

const trips: Trip[] = [
  {
    id: 't1',
    code: 'TRK-1042',
    status: 'InTransit',
    vehicleId: 'v1',
    driverId: 'd1',
    pickup: 'Nhava Sheva Port',
    drop: 'Pune DC',
    customer: 'IndiRetail',
    startTime: new Date().toISOString(),
    eta: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
    distanceKm: 152,
    cargo: 'FMCG - 18 pallets',
    checkpoints: ['Port Gate', 'Talegaon Toll', 'Chakan'],
    route: routePolyline
  },
  {
    id: 't2',
    code: 'TRK-2040',
    status: 'Assigned',
    vehicleId: 'v2',
    driverId: 'd2',
    pickup: 'Nagpur ICD',
    drop: 'Hyderabad DC',
    customer: 'ElectroHub',
    startTime: new Date().toISOString(),
    eta: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
    distanceKm: 540,
    cargo: 'Electronics',
    checkpoints: ['Wardha', 'Adilabad', 'Kamareddy'],
    route: routePolyline
  }
];

const vehicles: Vehicle[] = [
  {
    id: 'v1',
    plate: 'MH12 AB 3945',
    model: 'Ashok Leyland 4825',
    status: 'on-trip',
    lat: routePolyline[0].lat,
    lng: routePolyline[0].lng,
    speed: 42,
    heading: 150,
    lastSeen: new Date().toISOString(),
    driverId: 'd1'
  },
  {
    id: 'v2',
    plate: 'MH14 XY 2210',
    model: 'Tata Signa 3521',
    status: 'idle',
    lat: 19.1,
    lng: 73.05,
    speed: 0,
    heading: 0,
    lastSeen: new Date().toISOString(),
    driverId: 'd2'
  }
];

const invoices: Invoice[] = [
  { id: 'inv1', customer: 'IndiRetail', amount: 54000, status: 'Draft', dueDate: '2024-07-10' },
  { id: 'inv2', customer: 'ElectroHub', amount: 92000, status: 'Paid', dueDate: '2024-07-02' }
];

const alerts: Alert[] = [
  { id: 'al1', severity: 'high', title: 'Route Deviation', description: 'TRK-1042 deviated 4km', createdAt: new Date().toISOString(), acknowledged: false },
  { id: 'al2', severity: 'medium', title: 'Idle Too Long', description: 'MH14 XY 2210 idle 45m', createdAt: new Date().toISOString(), acknowledged: true }
];

const notifications: NotificationItem[] = [
  { id: 'n1', title: 'Trip assigned', message: 'TRK-2040 assigned to you', createdAt: new Date().toISOString(), read: false },
  { id: 'n2', title: 'Document expiring', message: 'PUC expiring in 7 days', createdAt: new Date().toISOString(), read: false }
];

export const mockApi = {
  async login(): Promise<{ token: string }> {
    await delay(800);
    return { token: 'mock-token' };
  },
  async fetchOrgs(): Promise<Org[]> {
    await delay(500);
    return orgs;
  },
  async fetchBranches(orgId: string): Promise<Branch[]> {
    await delay(500);
    return branches.filter((b) => b.orgId === orgId);
  },
  async fetchTrips(filter?: TripStatus): Promise<Trip[]> {
    await delay(600);
    if (!filter) return trips;
    return trips.filter((t) => t.status === filter);
  },
  async updateTripStatus(id: string, status: TripStatus): Promise<Trip> {
    await delay(400);
    const trip = trips.find((t) => t.id === id);
    if (!trip) throw new Error('Trip not found');
    trip.status = status;
    return trip;
  },
  async fetchVehicles(): Promise<Vehicle[]> {
    await delay(500);
    return vehicles;
  },
  async fetchInvoices(): Promise<Invoice[]> {
    await delay(500);
    return invoices;
  },
  async fetchAlerts(): Promise<Alert[]> {
    await delay(400);
    return alerts;
  },
  async fetchNotifications(): Promise<NotificationItem[]> {
    await delay(400);
    return notifications;
  },
  async markNotificationRead(id: string): Promise<void> {
    await delay(200);
    const item = notifications.find((n) => n.id === id);
    if (item) item.read = true;
  }
};
