/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Platillo {
  id: string;
  nombre: string;
  precio: number;
  categoria: 'tacos' | 'gringas-volcanes' | 'bebidas' | 'especiales' | 'postres';
  descripcion: string;
  disponible: boolean;
  imagen?: string;
}

export interface ItemComanda {
  id: string;
  platillo: Platillo;
  cantidad: number;
  notas?: string;
}

export interface Orden {
  id: string;
  folio: string; // Ejemplo: #0045
  mesa: string; // 1-12, "Barra A", "Llevar" etc.
  mesero: string; // Nombre del mesero
  platillos: ItemComanda[];
  estado: 'pendiente' | 'preparando' | 'lista' | 'entregada' | 'pagada';
  total: number;
  createdAt: string;
  updatedAt: string;
  tiempoPreparacion?: number; // en segundos
  notasGenerales?: string;
  clienteNombre?: string;
}

export interface Personal {
  id: string;
  nombre: string;
  rol: 'administrador' | 'cocinero' | 'mesero';
  activo: boolean;
  avatar?: string;
}

export interface Cliente {
  id: string;
  nombre: string;
  telefono?: string;
  puntos: number;
  visitas: number;
  ultimaVisita: string;
}

export interface Transaccion {
  id: string;
  ordenId: string;
  folioOrden: string;
  mesa: string;
  mesero: string;
  total: number;
  metodoPago: 'efectivo' | 'tarjeta' | 'transferencia';
  montoRecibido: number;
  cambio: number;
  createdAt: string;
}

export interface AlertaTaqueria {
  id: string;
  tipo: 'lista' | 'nueva_orden' | 'pago' | 'info';
  mensaje: string;
  leido: boolean;
  createdAt: string;
  meta?: {
    ordenId?: string;
    mesa?: string;
    folio?: string;
  };
}
