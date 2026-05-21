/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Platillo, Orden, Personal, Cliente, Transaccion, AlertaTaqueria, ItemComanda } from '../types';
import { PLATILLOS_INICIALES, PERSONAL_INICIAL, CLIENTES_INICIALES, ORDENES_EJEMPLO } from '../data';

interface AppContextType {
  platillos: Platillo[];
  ordenes: Orden[];
  personal: Personal[];
  clientes: Cliente[];
  transacciones: Transaccion[];
  alertas: AlertaTaqueria[];
  usuarioActivo: Personal;
  setUsuarioActivo: (personal: Personal) => void;
  crearOrden: (mesa: string, mesero: string, items: ItemComanda[], notasGenerales?: string, clienteNombre?: string) => string;
  anexarAOrdenExistente: (ordenId: string, nuevosItems: ItemComanda[], nuevasNotasGenerales?: string) => void;
  actualizarEstadoOrden: (ordenId: string, nuevoEstado: Orden['estado']) => void;
  registrarCobro: (ordenId: string, metodoPago: Transaccion['metodoPago'], montoRecibido: number) => Transaccion;
  agregarPlatillo: (platillo: Omit<Platillo, 'id'>) => void;
  actualizarPlatillo: (platillo: Platillo) => void;
  agregarCliente: (nombre: string, telefono: string) => void;
  actualizarClientePuntos: (clienteNombre: string, montoGastado: number) => void;
  eliminarAlerta: (alertaId: string) => void;
  marcarAlertasLeidas: () => void;
  reproducirSonidoAlert: (tipo: 'campana' | 'comanda' | 'caja') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  // Inicialización de estados desde localStorage o predeterminados
  const [platillos, setPlatillos] = useState<Platillo[]>(() => {
    const saved = localStorage.getItem('taqueria_platillos');
    return saved ? JSON.parse(saved) : PLATILLOS_INICIALES;
  });

  const [ordenes, setOrdenes] = useState<Orden[]>(() => {
    const saved = localStorage.getItem('taqueria_ordenes');
    return saved ? JSON.parse(saved) : ORDENES_EJEMPLO;
  });

  const [personal, setPersonal] = useState<Personal[]>(() => {
    const saved = localStorage.getItem('taqueria_personal');
    return saved ? JSON.parse(saved) : PERSONAL_INICIAL;
  });

  const [clientes, setClientes] = useState<Cliente[]>(() => {
    const saved = localStorage.getItem('taqueria_clientes');
    return saved ? JSON.parse(saved) : CLIENTES_INICIALES;
  });

  const [transacciones, setTransacciones] = useState<Transaccion[]>(() => {
    const saved = localStorage.getItem('taqueria_transacciones');
    return saved ? JSON.parse(saved) : [];
  });

  const [alertas, setAlertas] = useState<AlertaTaqueria[]>(() => {
    const saved = localStorage.getItem('taqueria_alertas');
    return saved ? JSON.parse(saved) : [
      {
        id: 'alerta-bienvenida',
        tipo: 'info',
        mensaje: '🌮 ¡Bienvenidos a Sabor y Control! El sistema de taquería profesional está activo.',
        leido: false,
        createdAt: new Date().toISOString()
      }
    ];
  });

  const [usuarioActivo, setUsuarioActivo] = useState<Personal>(() => {
    const saved = localStorage.getItem('taqueria_usuario_activo');
    if (saved) return JSON.parse(saved);
    return PERSONAL_INICIAL.find(p => p.rol === 'mesero') || PERSONAL_INICIAL[2];
  });

  // Guardar datos en local storage cuando cambian
  useEffect(() => {
    localStorage.setItem('taqueria_platillos', JSON.stringify(platillos));
  }, [platillos]);

  useEffect(() => {
    localStorage.setItem('taqueria_ordenes', JSON.stringify(ordenes));
  }, [ordenes]);

  useEffect(() => {
    localStorage.setItem('taqueria_personal', JSON.stringify(personal));
  }, [personal]);

  useEffect(() => {
    localStorage.setItem('taqueria_clientes', JSON.stringify(clientes));
  }, [clientes]);

  useEffect(() => {
    localStorage.setItem('taqueria_transacciones', JSON.stringify(transacciones));
  }, [transacciones]);

  useEffect(() => {
    localStorage.setItem('taqueria_alertas', JSON.stringify(alertas));
  }, [alertas]);

  useEffect(() => {
    localStorage.setItem('taqueria_usuario_activo', JSON.stringify(usuarioActivo));
  }, [usuarioActivo]);

  // Auxiliar para difundir cambios mediante BroadcastChannel al instante
  const difundirCambios = () => {
    try {
      const channel = new BroadcastChannel('taqueria_sinc_channel');
      channel.postMessage({ tipo: 'sync_all' });
      channel.close();
    } catch (e) {
      // Ignorar si no es soportado
    }
  };

  // Sincronizar en tiempo real entre múltiples pestañas/ventanas del navegador (BroadcastChannel + storage)
  useEffect(() => {
    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel('taqueria_sinc_channel');
      channel.onmessage = (event) => {
        if (event.data?.tipo === 'sync_all') {
          const platSaved = localStorage.getItem('taqueria_platillos');
          const ordSaved = localStorage.getItem('taqueria_ordenes');
          const cliSaved = localStorage.getItem('taqueria_clientes');
          const txSaved = localStorage.getItem('taqueria_transacciones');
          const alertSaved = localStorage.getItem('taqueria_alertas');
          
          if (platSaved) setPlatillos(JSON.parse(platSaved));
          if (ordSaved) {
            const viejasOrdenes = ordenes;
            const nuevasOrdenes = JSON.parse(ordSaved) as Orden[];
            setOrdenes(nuevasOrdenes);
            detectarCambiosEnOrdenes(viejasOrdenes, nuevasOrdenes);
          }
          if (cliSaved) setClientes(JSON.parse(cliSaved));
          if (txSaved) setTransacciones(JSON.parse(txSaved));
          if (alertSaved) setAlertas(JSON.parse(alertSaved));
        }
      };
    } catch (e) {
      console.warn("BroadcastChannel no soportado, se usará storage API de respaldo", e);
    }

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'taqueria_ordenes' && e.newValue) {
        const viejasOrdenes = ordenes;
        const nuevasOrdenes = JSON.parse(e.newValue) as Orden[];
        setOrdenes(nuevasOrdenes);

        // Emitir alerta sonora si hay una orden nueva o si alguna orden pasó de preparando a lista
        detectarCambiosEnOrdenes(viejasOrdenes, nuevasOrdenes);
      } else if (e.key === 'taqueria_platillos' && e.newValue) {
        setPlatillos(JSON.parse(e.newValue));
      } else if (e.key === 'taqueria_clientes' && e.newValue) {
        setClientes(JSON.parse(e.newValue));
      } else if (e.key === 'taqueria_transacciones' && e.newValue) {
        setTransacciones(JSON.parse(e.newValue));
      } else if (e.key === 'taqueria_alertas' && e.newValue) {
        setAlertas(JSON.parse(e.newValue));
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      if (channel) channel.close();
    };
  }, [ordenes]);

  // Auxiliar para reproducir sonidos sintéticos usando la Web Audio API (para evitar descargas de archivos externos)
  const reproducirSonidoAlert = (tipo: 'campana' | 'comanda' | 'caja') => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      if (tipo === 'campana') {
        // Sonido de campana de cocina (Ting!)
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, ctx.currentTime); // La5
        osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.05); // Ting high harmon
        
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8);
        
        osc.start();
        osc.stop(ctx.currentTime + 0.8);
      } else if (tipo === 'comanda') {
        // Sonido rápido de impresora de comandas (Trrr-trrr)
        const totalDur = 0.3;
        for (let i = 0; i < 4; i++) {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(150 + (i * 80), ctx.currentTime + (i * 0.07));
          
          gain.gain.setValueAtTime(0.15, ctx.currentTime + (i * 0.07));
          gain.gain.setValueAtTime(0.0, ctx.currentTime + (i * 0.07) + 0.04);
          
          osc.start(ctx.currentTime + (i * 0.07));
          osc.stop(ctx.currentTime + (i * 0.07) + 0.05);
        }
      } else if (tipo === 'caja') {
        // Sonido de caja registradora (Ka-ching!)
        // Sonido 1 (Golpe metálico de fricción)
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc1.type = 'square';
        osc1.frequency.setValueAtTime(2500, ctx.currentTime);
        gain1.gain.setValueAtTime(0.1, ctx.currentTime);
        gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
        osc1.start();
        osc1.stop(ctx.currentTime + 0.12);

        // Sonido 2 (Timbre cantarín de monedas)
        setTimeout(() => {
          const osc2 = ctx.createOscillator();
          const gain2 = ctx.createGain();
          osc2.connect(gain2);
          gain2.connect(ctx.destination);
          osc2.type = 'sine';
          osc2.frequency.setValueAtTime(1100, ctx.currentTime);
          osc2.frequency.setValueAtTime(1500, ctx.currentTime + 0.05);
          gain2.gain.setValueAtTime(0.2, ctx.currentTime);
          gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
          osc2.start();
          osc2.stop(ctx.currentTime + 0.42);
        }, 50);
      }
    } catch (e) {
      console.warn("La reproducción de sonido falló (permisos del navegador):", e);
    }
  };

  const detectarCambiosEnOrdenes = (viejas: Orden[], nuevas: Orden[]) => {
    if (viejas.length === 0) return;

    // 1. Detectar si hay órdenes nuevas
    if (nuevas.length > viejas.length) {
      const nuevasAgregadas = nuevas.filter(n => !viejas.some(v => v.id === n.id));
      nuevasAgregadas.forEach(ord => {
        reproducirSonidoAlert('comanda');
      });
      return;
    }

    // 2. Detectar si alguna orden cambió a "lista" (Aviso para Mesero!)
    nuevas.forEach(n => {
      const v = viejas.find(item => item.id === n.id);
      if (v && v.estado !== 'lista' && n.estado === 'lista') {
        reproducirSonidoAlert('campana');
      }
    });
  };

  // Acciones de Negocio
  const crearOrden = (
    mesa: string,
    mesero: string,
    items: ItemComanda[],
    notasGenerales?: string,
    clienteNombre?: string
  ): string => {
    const rawFolio = Math.floor(100 + Math.random() * 900); // 100-999
    const id = `ord-${Date.now()}`;
    const folio = `#${rawFolio}`;
    
    // Calcular el total
    const total = items.reduce((acc, current) => acc + (current.platillo.precio * current.cantidad), 0);

    const nuevaOrden: Orden = {
      id,
      folio,
      mesa,
      mesero,
      platillos: items,
      estado: 'pendiente',
      total,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      notasGenerales,
      clienteNombre
    };

    const nuevasOrdenes = [nuevaOrden, ...ordenes];
    setOrdenes(nuevasOrdenes);

    // Crear alerta
    const nuevaAlerta: AlertaTaqueria = {
      id: `alert-${Date.now()}`,
      tipo: 'nueva_orden',
      mensaje: `📋 Nueva Orden en ${mesa} levantada por ${mesero} (Monto: $${total} MXN)`,
      leido: false,
      createdAt: new Date().toISOString(),
      meta: { ordenId: id, mesa, folio }
    };

    setAlertas([nuevaAlerta, ...alertas]);
    reproducirSonidoAlert('comanda');
    
    // Propagar cambios de inmediato
    setTimeout(difundirCambios, 10);

    return id;
  };

  const anexarAOrdenExistente = (
    ordenId: string,
    nuevosItems: ItemComanda[],
    nuevasNotasGenerales?: string
  ) => {
    const nuevasOrdenes = ordenes.map(ord => {
      if (ord.id === ordenId) {
        // Combinar items
        const platillosActualizados = [...ord.platillos];
        
        nuevosItems.forEach(nuevo => {
          const coincidente = platillosActualizados.find(
            existente => existente.platillo.id === nuevo.platillo.id && (existente.notas || '') === (nuevo.notas || '')
          );
          if (coincidente) {
            coincidente.cantidad += nuevo.cantidad;
          } else {
            platillosActualizados.push({
              ...nuevo,
              id: `item-anexo-${Date.now()}-${Math.floor(Math.random() * 10000)}-${nuevo.platillo.id}`
            });
          }
        });

        // Recalcular total de la orden
        const nuevoTotal = platillosActualizados.reduce((acc, current) => acc + (current.platillo.precio * current.cantidad), 0);

        return {
          ...ord,
          platillos: platillosActualizados,
          total: nuevoTotal,
          estado: 'pendiente' as const, // Regresa a pendiente para que cocina lo prepare
          updatedAt: new Date().toISOString(),
          notasGenerales: nuevasNotasGenerales 
            ? ord.notasGenerales 
              ? `${ord.notasGenerales} | Adición: ${nuevasNotasGenerales}` 
              : nuevasNotasGenerales
            : ord.notasGenerales
        };
      }
      return ord;
    });

    setOrdenes(nuevasOrdenes);

    const ordenModif = ordenes.find(o => o.id === ordenId);
    if (ordenModif) {
      const nombresPlatillos = nuevosItems.map(i => `${i.cantidad}x ${i.platillo.nombre}`).join(', ');
      
      const nuevaAlerta: AlertaTaqueria = {
        id: `alert-${Date.now()}`,
        tipo: 'nueva_orden',
        mensaje: `⚠️ ¡Adición en ${ordenModif.mesa}! Se agregaron ${nombresPlatillos} al pedido ${ordenModif.folio}.`,
        leido: false,
        createdAt: new Date().toISOString(),
        meta: { ordenId, mesa: ordenModif.mesa }
      };
      setAlertas(prev => [nuevaAlerta, ...prev]);
    }

    reproducirSonidoAlert('comanda');
    
    // Propagar cambios de inmediato
    setTimeout(difundirCambios, 10);
  };

  const actualizarEstadoOrden = (ordenId: string, nuevoEstado: Orden['estado']) => {
    let alertaMensaje = '';
    let alertaTipo: AlertaTaqueria['tipo'] = 'info';

    const nuevasOrdenes = ordenes.map(ord => {
      if (ord.id === ordenId) {
        const anteriorEstado = ord.estado;
        const enPreparacionTime = anteriorEstado === 'preparando' && nuevoEstado === 'lista';
        let tiempoPrep = ord.tiempoPreparacion;

        if (enPreparacionTime) {
          const inicio = new Date(ord.updatedAt).getTime();
          const fin = new Date().getTime();
          tiempoPrep = Math.floor((fin - inicio) / 1000);
        }

        if (nuevoEstado === 'preparando') {
          alertaMensaje = `🔥 El taquero Charly empezó a preparar el pedido ${ord.folio} de la ${ord.mesa}.`;
          alertaTipo = 'info';
        } else if (nuevoEstado === 'lista') {
          alertaMensaje = `🔔 ¡Pedidazo listo! El pedido ${ord.folio} de la ${ord.mesa} está en la barra esperando al mesero. ¡Ting!`;
          alertaTipo = 'lista';
        } else if (nuevoEstado === 'entregada') {
          alertaMensaje = `🌮 Comida colocada. Mesero entregó pedido ${ord.folio} en la ${ord.mesa}.`;
          alertaTipo = 'info';
        }

        return {
          ...ord,
          estado: nuevoEstado,
          updatedAt: new Date().toISOString(),
          tiempoPreparacion: tiempoPrep
        };
      }
      return ord;
    });

    setOrdenes(nuevasOrdenes);

    if (alertaMensaje) {
      const nuevaAlerta: AlertaTaqueria = {
        id: `alert-${Date.now()}`,
        tipo: alertaTipo,
        mensaje: alertaMensaje,
        leido: false,
        createdAt: new Date().toISOString(),
        meta: { ordenId }
      };
      setAlertas(prev => [nuevaAlerta, ...prev]);

      if (nuevoEstado === 'lista') {
        reproducirSonidoAlert('campana');
      }
    }

    // Propagar cambios de inmediato
    setTimeout(difundirCambios, 10);
  };

  const registrarCobro = (ordenId: string, metodoPago: Transaccion['metodoPago'], montoRecibido: number): Transaccion => {
    const orden = ordenes.find(o => o.id === ordenId);
    if (!orden) throw new Error('Orden no encontrada');

    const total = orden.total;
    const cambio = Math.max(0, montoRecibido - total);
    
    const nuevaTransaccion: Transaccion = {
      id: `tx-${Date.now()}`,
      ordenId,
      folioOrden: orden.folio,
      mesa: orden.mesa,
      mesero: orden.mesero,
      total,
      metodoPago,
      montoRecibido,
      cambio,
      createdAt: new Date().toISOString()
    };

    setTransacciones([nuevaTransaccion, ...transacciones]);

    // Marcar la orden como pagada
    setOrdenes(prev => prev.map(o => {
      if (o.id === ordenId) {
        return {
          ...o,
          estado: 'pagada',
          updatedAt: new Date().toISOString()
        };
      }
      return o;
    }));

    // Generar Alerta de pago
    const nuevaAlerta: AlertaTaqueria = {
      id: `alert-${Date.now()}`,
      tipo: 'pago',
      mensaje: `💰 Pedido ${orden.folio} de la ${orden.mesa} ha sido cobrado. $${total} MXN vía ${metodoPago.toUpperCase()}.`,
      leido: false,
      createdAt: new Date().toISOString(),
      meta: { ordenId, mesa: orden.mesa }
    };
    setAlertas(prev => [nuevaAlerta, ...prev]);

    // Sincronizar sistema de fidelización de clientes (puntos) si corresponde
    if (orden.clienteNombre) {
      actualizarClientePuntos(orden.clienteNombre, total);
    }

    reproducirSonidoAlert('caja');

    // Propagar cambios de inmediato
    setTimeout(difundirCambios, 10);

    return nuevaTransaccion;
  };

  const agregarPlatillo = (platillo: Omit<Platillo, 'id'>) => {
    const nuevo: Platillo = {
      ...platillo,
      id: `plat-${Date.now()}`
    };
    setPlatillos([...platillos, nuevo]);
    setTimeout(difundirCambios, 10);
  };

  const actualizarPlatillo = (platilloActualizado: Platillo) => {
    setPlatillos(platillos.map(p => p.id === platilloActualizado.id ? platilloActualizado : p));
    setTimeout(difundirCambios, 10);
  };

  const agregarCliente = (nombre: string, telefono: string) => {
    const nuevo: Cliente = {
      id: `cli-${Date.now()}`,
      nombre,
      telefono,
      puntos: 0,
      visitas: 0,
      ultimaVisita: new Date().toLocaleDateString('es-MX')
    };
    setClientes([nuevo, ...clientes]);
    setTimeout(difundirCambios, 10);
  };

  const actualizarClientePuntos = (clienteNombre: string, montoGastado: number) => {
    const puntosGanados = Math.floor(montoGastado * 0.1); 
    setClientes(prev => prev.map(cli => {
      if (cli.nombre === clienteNombre) {
        return {
          ...cli,
          puntos: cli.puntos + puntosGanados,
          visitas: cli.visitas + 1,
          ultimaVisita: new Date().toLocaleDateString('es-MX')
        };
      }
      return cli;
    }));
    setTimeout(difundirCambios, 10);
  };

  const eliminarAlerta = (alertaId: string) => {
    setAlertas(alertas.filter(a => a.id !== alertaId));
    setTimeout(difundirCambios, 10);
  };

  const marcarAlertasLeidas = () => {
    setAlertas(alertas.map(a => ({ ...a, leido: true })));
    setTimeout(difundirCambios, 10);
  };

  return (
    <AppContext.Provider
      value={{
        platillos,
        ordenes,
        personal,
        clientes,
        transacciones,
        alertas,
        usuarioActivo,
        setUsuarioActivo,
        crearOrden,
        anexarAOrdenExistente,
        actualizarEstadoOrden,
        registrarCobro,
        agregarPlatillo,
        actualizarPlatillo,
        agregarCliente,
        actualizarClientePuntos,
        eliminarAlerta,
        marcarAlertasLeidas,
        reproducirSonidoAlert
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp debe utilizarse dentro de un AppProvider');
  }
  return context;
}
