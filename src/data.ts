/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Platillo, Personal, Cliente, Orden } from './types';

export const PLATILLOS_INICIALES: Platillo[] = [
  // Categoria: Tacos
  {
    id: 't-pastor',
    nombre: 'Taco al Pastor',
    precio: 18,
    categoria: 'tacos',
    descripcion: 'Deliciosa carne al pastor marinada con receta de la casa, servida en tortilla de maíz doble con cebolla, cilantro y piña dulce.',
    disponible: true
  },
  {
    id: 't-suadero',
    nombre: 'Taco de Suadero',
    precio: 20,
    categoria: 'tacos',
    descripcion: 'Pechito de res finamente picado, confitado lentamente en nuestro comal bola tradicional, jugoso y calientito.',
    disponible: true
  },
  {
    id: 't-campechano',
    nombre: 'Taco Campechano',
    precio: 22,
    categoria: 'tacos',
    descripcion: 'El legendario dueto de suadero jugoso y longaniza de Toluca bien doradita con un toque de chicharrón crujiente.',
    disponible: true
  },
  {
    id: 't-bistec',
    nombre: 'Taco de Bistec',
    precio: 21,
    categoria: 'tacos',
    descripcion: 'Corte magro de res a la plancha sazonado con sal de grano, servido en tortilla fresca.',
    disponible: true
  },
  {
    id: 't-tripa',
    nombre: 'Taco de Tripa',
    precio: 25,
    categoria: 'tacos',
    descripcion: 'Tripa de res bien lavada y frita en el comal de bola. Pídela tierna o súper doradita.',
    disponible: true
  },

  // Categoria: Gringas y Volcanes
  {
    id: 'g-pastor',
    nombre: 'Gringa de Pastor',
    precio: 45,
    categoria: 'gringas-volcanes',
    descripcion: 'Tortilla de harina de trigo grande con queso asadero fundido hilado y deliciosa carne al pastor con piña.',
    disponible: true
  },
  {
    id: 'g-bistec',
    nombre: 'Gringa de Bistec',
    precio: 48,
    categoria: 'gringas-volcanes',
    descripcion: 'Queso fundido y bistec picado fino entre dos tortillas de harina doraditas en la plancha.',
    disponible: true
  },
  {
    id: 'v-campechano',
    nombre: 'Volcán Campechano',
    precio: 35,
    categoria: 'gringas-volcanes',
    descripcion: 'Tortilla de maíz deshidratada a las brasas, una base de costra de queso fundido, bistec, longaniza y puré de aguacate.',
    disponible: true
  },

  // Categoria: Especiales
  {
    id: 'e-alambre',
    nombre: 'Alambre Especial Tizón',
    precio: 120,
    categoria: 'especiales',
    descripcion: 'Mezcla generosa de bistec, tocino ahumado, pimientos verdes, cebolla fileteada y un volcán de queso derretido encima. Acompañado de 5 tortillas.',
    disponible: true
  },
  {
    id: 'e-parrillada',
    nombre: 'Parrillada Norteña (Para 2)',
    precio: 240,
    categoria: 'especiales',
    descripcion: 'Bistec, pastor, longaniza, cebollitas cambray asadas, nopales tiernos al grill, chiles listos y tortillas de maíz/harina ilimitadas.',
    disponible: true
  },

  // Categoria: Bebidas
  {
    id: 'b-horchata',
    nombre: 'Agua de Horchata Litro',
    precio: 35,
    categoria: 'bebidas',
    descripcion: 'Agua tradicional de arroz ultra cremosa con un toque sutil de canela de ceilán y vainilla de Papantla. Fría y refrescante.',
    disponible: true
  },
  {
    id: 'b-jamaica',
    nombre: 'Agua de Jamaica Litro',
    precio: 32,
    categoria: 'bebidas',
    descripcion: 'Concentrado natural de flor de jamaica seleccionada de Guerrero, endulzada al punto exacto de frescura.',
    disponible: true
  },
  {
    id: 'b-coca',
    nombre: 'Coca-Cola Vidrio (355ml)',
    precio: 25,
    categoria: 'bebidas',
    descripcion: 'La reina de los tacos. Coca-Cola original bien helada en botella de vidrio retornable tradicional.',
    disponible: true
  },
  {
    id: 'b-boing',
    nombre: 'Boing de Guayaba',
    precio: 24,
    categoria: 'bebidas',
    descripcion: 'Jugo de guayaba tradicional de pulpa natural en envase de vidrio frío friísimo.',
    disponible: true
  },

  // Categoria: Postres
  {
    id: 'p-flan',
    nombre: 'Flan Napolitano de la Abuela',
    precio: 35,
    categoria: 'postres',
    descripcion: 'Pristino flan horneado a baño maría con base de cajeta quemada de Celaya y un toque de queso crema original.',
    disponible: true
  }
];

export const MESAS_INICIALES = [
  { id: '1', nombre: 'Mesa 1', capacidad: 4, estado: 'libre' },
  { id: '2', nombre: 'Mesa 2', capacidad: 4, estado: 'libre' },
  { id: '3', nombre: 'Mesa 3', capacidad: 4, estado: 'libre' },
  { id: '4', nombre: 'Mesa 4', capacidad: 4, estado: 'libre' },
  { id: '5', nombre: 'Mesa 5', capacidad: 2, estado: 'libre' },
  { id: '6', nombre: 'Mesa 6', capacidad: 2, estado: 'libre' },
  { id: '7', nombre: 'Mesa 7', capacidad: 6, estado: 'libre' },
  { id: '8', nombre: 'Mesa 8', capacidad: 6, estado: 'libre' },
  { id: '9', nombre: 'Mesa 9 (Vip)', capacidad: 8, estado: 'libre' },
  { id: '10', nombre: 'Mesa 10 (Vip)', capacidad: 8, estado: 'libre' },
  { id: '11', nombre: 'Barra Asientos 1-4', capacidad: 4, estado: 'libre' },
  { id: '12', nombre: 'Servicio Para Llevar', capacidad: 20, estado: 'libre' }
];

export const PERSONAL_INICIAL: Personal[] = [
  {
    id: 'p-1',
    nombre: 'Don Kike',
    rol: 'administrador',
    activo: true,
    avatar: '👨‍💼'
  },
  {
    id: 'p-2',
    nombre: 'Charly (Taquero Estelar)',
    rol: 'cocinero',
    activo: true,
    avatar: '👨‍🍳'
  },
  {
    id: 'p-3',
    nombre: 'Lupita',
    rol: 'mesero',
    activo: true,
    avatar: '👩‍🍳'
  },
  {
    id: 'p-4',
    nombre: 'Beto',
    rol: 'mesero',
    activo: true,
    avatar: '🤵'
  }
];

export const CLIENTES_INICIALES: Cliente[] = [
  {
    id: 'c-1',
    nombre: 'Lic. Martínez (Cliente Distinguido)',
    telefono: '5512345678',
    puntos: 152,
    visitas: 12,
    ultimaVisita: '2026-05-20'
  },
  {
    id: 'c-2',
    nombre: 'Gaby - Vecina de enfrente',
    telefono: '5598765432',
    puntos: 45,
    visitas: 5,
    ultimaVisita: '2026-05-19'
  },
  {
    id: 'c-3',
    nombre: 'Familia Sánchez',
    telefono: '5545678901',
    puntos: 210,
    visitas: 18,
    ultimaVisita: '2026-05-21'
  }
];

export const ORDENES_EJEMPLO: Orden[] = [
  {
    id: 'ord-101',
    folio: '#101',
    mesa: 'Mesa 4',
    mesero: 'Lupita',
    platillos: [
      {
        id: 'item-1',
        platillo: PLATILLOS_INICIALES[0], // Al Pastor
        cantidad: 5,
        notas: '3 con piña cebolla y cilantro, 2 con todo menos piña.'
      },
      {
        id: 'item-2',
        platillo: PLATILLOS_INICIALES[11], // Agua de Horchata Litro
        cantidad: 1,
        notas: 'Bien fría.'
      }
    ],
    estado: 'pagada',
    total: 125,
    createdAt: '2026-05-21T16:15:00Z',
    updatedAt: '2026-05-21T16:35:00Z',
    tiempoPreparacion: 180,
    clienteNombre: 'Lic. Martínez (Cliente Distinguido)'
  },
  {
    id: 'ord-102',
    folio: '#102',
    mesa: 'Mesa 1',
    mesero: 'Beto',
    platillos: [
      {
        id: 'item-3',
        platillo: PLATILLOS_INICIALES[2], // Campechanos
        cantidad: 4,
        notas: 'Con bastante pápalo y salsa verde aparte.'
      },
      {
        id: 'item-4',
        platillo: PLATILLOS_INICIALES[5], // Gringa de Pastor
        cantidad: 2,
        notas: 'Con bastante piña bien frita.'
      },
      {
        id: 'item-5',
        platillo: PLATILLOS_INICIALES[12], // Coca-Cola
        cantidad: 2,
        notas: 'Con vasos con hielos y limones.'
      }
    ],
    estado: 'preparando',
    total: 228,
    createdAt: '2026-05-21T17:48:00Z',
    updatedAt: '2026-05-21T17:50:00Z',
    clienteNombre: 'Familia Sánchez'
  },
  {
    id: 'ord-103',
    folio: '#103',
    mesa: 'Mesa 7',
    mesero: 'Lupita',
    platillos: [
      {
        id: 'item-6',
        platillo: PLATILLOS_INICIALES[8], // Alambre Especial Tizón
        cantidad: 1,
        notas: 'Tortillas de harina por favor.'
      }
    ],
    estado: 'pendiente',
    total: 120,
    createdAt: '2026-05-21T17:58:00Z',
    updatedAt: '2026-05-21T17:58:00Z'
  }
];
