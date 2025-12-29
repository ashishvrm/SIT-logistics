import { mockApi } from './mockApi';
import { Vehicle } from './types';

// Simple EventEmitter implementation for React Native
class SimpleEventEmitter {
  private listeners: { [key: string]: Function[] } = {};

  on(event: string, callback: Function) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  emit(event: string, data: any) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => callback(data));
    }
  }

  off(event: string, callback: Function) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }
  }

  removeListener(event: string, callback: Function) {
    this.off(event, callback);
  }

  removeAllListeners(event?: string) {
    if (event) {
      delete this.listeners[event];
    } else {
      this.listeners = {};
    }
  }
}

const emitter = new SimpleEventEmitter();
let started = false;

const moveVehicle = (vehicle: Vehicle, step: number) => {
  const route = [
    { lat: 19.076, lng: 72.8777 },
    { lat: 19.17, lng: 73.0 },
    { lat: 19.25, lng: 73.1 },
    { lat: 19.35, lng: 73.2 }
  ];
  const next = route[step % route.length];
  vehicle.lat = next.lat;
  vehicle.lng = next.lng;
  vehicle.speed = 40 + (step % 10);
  vehicle.heading = 120 + step * 10;
  vehicle.lastSeen = new Date().toISOString();
};

export const startGpsSimulator = async () => {
  if (started) return;
  started = true;
  const vehicles = await mockApi.fetchVehicles();
  let step = 0;
  setInterval(() => {
    step += 1;
    vehicles.forEach((v) => moveVehicle(v, step));
    emitter.emit('positions', vehicles);
  }, 2500);
};

export const gpsEvents = emitter;
