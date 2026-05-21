/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PLATILLOS_INICIALES, MESAS_INICIALES } from '../data';
import { Platillo, ItemComanda } from '../types';
import { Plus, Minus, Send, Clipboard, Clock, Check, Utensils, CreditCard, ShoppingBag, UserPlus, FileText } from 'lucide-react';

export default function MeseroView() {
  const { 
    platillos, 
    ordenes, 
    usuarioActivo, 
    crearOrden, 
    anexarAOrdenExistente,
    actualizarEstadoOrden, 
    clientes, 
    agregarCliente 
  } = useApp();

  // Estados de control para la comandera
  const [mesaSeleccionada, setMesaSeleccionada] = useState<string>('Mesa 1');
  const [categoriaActiva, setCategoriaActiva] = useState<Platillo['categoria']>('tacos');
  const [comandaItems, setComandaItems] = useState<ItemComanda[]>([]);
  const [notasGenerales, setNotasGenerales] = useState<string>('');
  const [filtroMesa, setFiltroMesa] = useState<string>('todas');
  const [mobileTab, setMobileTab] = useState<'pedido' | 'ticket'>('pedido');
  
  // Buscar si la mesa tiene una orden activa (pendiente de pago) para acumular al instante
  const ordenActivaDeMesa = ordenes.find(o => o.mesa === mesaSeleccionada && o.estado !== 'pagada');
  const sumaCuentaAcumulada = ordenes
    .filter(o => o.mesa === mesaSeleccionada && o.estado !== 'pagada')
    .reduce((sum, ord) => sum + ord.total, 0);

  const [showDesgloseMesa, setShowDesgloseMesa] = useState<boolean>(false);
  
  // Cliente frecuente opcional
  const [clienteNombre, setClienteNombre] = useState<string>('');
  const [buscarCliente, setBuscarCliente] = useState<string>('');
  const [nuevoClienteNombre, setNuevoClienteNombre] = useState<string>('');
  const [nuevoClienteTel, setNuevoClienteTel] = useState<string>('');
  const [showClienteModal, setShowClienteModal] = useState<boolean>(false);

  // Categorías amigables en español
  const categoriasLabel: { [key in Platillo['categoria']]: { label: string; icon: string } } = {
    'tacos': { label: 'Tacos Dorados y Suaves', icon: '🌮' },
    'gringas-volcanes': { label: 'Gringas y Volcanes', icon: '🫓' },
    'especiales': { label: 'Especialidades al Grill', icon: '🔥' },
    'bebidas': { label: 'Bebidas y Aguas Frías', icon: '🥤' },
    'postres': { label: 'Postres Caseros', icon: '🍮' }
  };

  // Filtrar platillos disponibles
  const platillosFiltrados = platillos.filter(p => p.categoria === categoriaActiva && p.disponible);

  // Agregar platillo al carrito / comanda temporal
  const handleAgregarItem = (platillo: Platillo, cantidadCustom: number = 1) => {
    setComandaItems(prev => {
      const existente = prev.find(item => item.platillo.id === platillo.id);
      if (existente) {
        return prev.map(item => 
          item.platillo.id === platillo.id 
            ? { ...item, cantidad: item.cantidad + cantidadCustom } 
            : item
        );
      } else {
        return [...prev, {
          id: `item-${Date.now()}-${platillo.id}`,
          platillo,
          cantidad: cantidadCustom,
          notas: ''
        }];
      }
    });
  };

  // Cambiar cantidad de item en comanda
  const handleCambiarCantidad = (itemId: string, increment: number) => {
    setComandaItems(prev => {
      return prev.map(item => {
        if (item.id === itemId) {
          const nuevaCant = item.cantidad + increment;
          return nuevaCant > 0 ? { ...item, cantidad: nuevaCant } : null;
        }
        return item;
      }).filter((item): item is ItemComanda => item !== null);
    });
  };

  // Guardar nota para un platillo específico
  const handleGuardarNotaVal = (itemId: string, nota: string) => {
    setComandaItems(prev => prev.map(item => 
      item.id === itemId ? { ...item, notas: nota } : item
    ));
  };

  // Enviar orden formalmente a cocina (anexando o creando cuenta nueva al instante)
  const handleEnviarComanda = (e: React.FormEvent) => {
    e.preventDefault();
    if (comandaItems.length === 0) return;

    if (ordenActivaDeMesa) {
      // Si ya hay un pedido activo, anexarle estos platillos a la cuenta acumulada al instante
      anexarAOrdenExistente(ordenActivaDeMesa.id, comandaItems, notasGenerales);
    } else {
      // Si es una mesa limpia sin cuenta activa, crear la orden principal
      crearOrden(
        mesaSeleccionada,
        usuarioActivo.nombre,
        comandaItems,
        notasGenerales,
        clienteNombre || undefined
      );
    }

    // Reiniciar comanda
    setComandaItems([]);
    setNotasGenerales('');
    setClienteNombre('');
  };

  // Agregar nuevo cliente al vuelo
  const registrarNuevoCliente = () => {
    if (!nuevoClienteNombre) return;
    agregarCliente(nuevoClienteNombre, nuevoClienteTel);
    setClienteNombre(nuevoClienteNombre);
    setNuevoClienteNombre('');
    setNuevoClienteTel('');
    setShowClienteModal(false);
  };

  // Filtrar todas las órdenes relacionadas con el mesero actual o de todas las mesas
  const ordenesMesero = ordenes.filter(o => {
    const coincideMesa = filtroMesa === 'todas' || o.mesa === filtroMesa;
    const coincideMesero = o.mesero === usuarioActivo.nombre;
    const noCobradaAun = o.estado !== 'pagada';
    return coincideMesa && coincideMesero && noCobradaAun;
  });

  const todasLasOrdenesActivas = ordenes.filter(o => o.estado !== 'pagada');

  // Calcular total comanda temporal
  const totalTemporal = comandaItems.reduce((sum, item) => sum + (item.platillo.precio * item.cantidad), 0);

  // Lista de clientes filtrados para auto-completar
  const clientesFiltrados = clientes.filter(c => 
    buscarCliente && c.nombre.toLowerCase().includes(buscarCliente.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-4 max-w-7xl mx-auto p-4 md:p-6 pb-24 lg:pb-6">
      
      {/* PESTAÑAS DE NAVEGACIÓN RÁPIDA PARA CELULARES (Visible únicamente en celulares/pantallas táctiles) */}
      <div className="flex lg:hidden w-full gap-2 p-1 bg-stone-100 rounded-xl border-2 border-taq-brown">
        <button
          type="button"
          onClick={() => setMobileTab('pedido')}
          className={`flex-1 py-3 px-2 rounded font-sans bold-label text-xs transition-colors duration-75 flex items-center justify-center gap-2 ${
            mobileTab === 'pedido'
              ? 'bg-taq-orange text-white border-2 border-taq-brown shadow-retro'
              : 'bg-white hover:bg-stone-50 text-taq-brown'
          }`}
        >
          <span>🌮</span> MESAS Y MENÚ
        </button>
        <button
          type="button"
          onClick={() => setMobileTab('ticket')}
          className={`relative flex-1 py-3 px-2 rounded font-sans bold-label text-xs transition-colors duration-75 flex items-center justify-center gap-2 ${
            mobileTab === 'ticket'
              ? 'bg-taq-orange text-white border-2 border-taq-brown shadow-retro'
              : 'bg-white hover:bg-stone-50 text-taq-brown'
          }`}
        >
          <span>📋</span> TICKET ({comandaItems.reduce((acc, item) => acc + item.cantidad, 0)})
          {comandaItems.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[9px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-taq-brown shadow-retro animate-pulse">
              {comandaItems.length}
            </span>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
        
        {/* SECCIÓN IZQUIERDA: COMANDERA (8 slots de grilla) */}
        <div className={`lg:col-span-8 flex flex-col gap-6 ${mobileTab === 'pedido' ? 'flex' : 'hidden lg:flex'}`}>
        
        {/* Paso 1: Selección de Mesa */}
        <div className="rounded-xl border-4 border-taq-brown bg-taq-white p-4 shadow-retro">
          <div className="mb-3 flex flex-wrap items-center justify-between border-b-2 border-taq-brown pb-2">
            <h2 className="display-font text-xl text-taq-brown tracking-tight flex items-center gap-1.5">
              📍 1. SELECCIONAR MESA / AREA
            </h2>
            <span className="bold-label text-xs bg-taq-orange text-white py-1 px-3 rounded border-2 border-taq-brown shadow-retro">
              Mesa activa: {mesaSeleccionada}
            </span>
          </div>
          
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 max-h-40 overflow-y-auto pr-1">
            {MESAS_INICIALES.map(m => {
              const activa = mesaSeleccionada === m.nombre;
              // Verificar si la mesa tiene órdenes activas en preparación/lista
              const tieneOrdenActiva = todasLasOrdenesActivas.some(o => o.mesa === m.nombre && o.estado !== 'pagada');
              return (
                <button
                  type="button"
                  key={m.id}
                  onClick={() => setMesaSeleccionada(m.nombre)}
                  className={`relative flex flex-col items-center justify-center p-2.5 rounded-xl border-2 transition font-bold text-xs ${
                    activa 
                      ? 'border-orange-600 bg-orange-500 text-white shadow-md scale-[1.03]' 
                      : tieneOrdenActiva
                      ? 'border-red-400 bg-red-50 text-red-950 hover:bg-red-100/80'
                      : 'border-amber-900/20 bg-amber-50/30 text-amber-950 hover:bg-amber-50'
                  }`}
                >
                  <span className="text-base mb-1">
                    {m.nombre.includes('Barra') ? '🍺' : m.nombre.includes('Llevar') ? '🛍️' : '🪑'}
                  </span>
                  <span>{m.nombre.replace('Mesa ', '')}</span>
                  {tieneOrdenActiva && (
                    <span className="absolute top-1 right-1 flex h-2 w-2 rounded-full bg-red-600 animate-pulse" />
                  )}
                </button>
              );
            })}
          </div>

          {sumaCuentaAcumulada > 0 && (
            <div className="mt-4 p-3 bg-taq-orange/10 border-2 border-taq-brown rounded-xl text-taq-brown flex flex-wrap items-center justify-between gap-3 shadow-retro-sm">
              <div className="flex items-center gap-2">
                <span className="text-xl animate-bounce">💸</span>
                <div>
                  <p className="bold-label text-[10px] uppercase tracking-wider text-taq-orange leading-none">Mesa Con Consumo Activo</p>
                  <p className="bold-label text-xs mt-1">Cuenta acumulada al instante: <strong className="text-taq-brown font-black font-mono underline">${sumaCuentaAcumulada} MXN</strong></p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowDesgloseMesa(true)}
                className="bg-taq-orange hover:bg-orange-600 text-white border-2 border-taq-brown py-1.5 px-3 rounded bold-label text-[10px] shadow-retro hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all duration-75 cursor-pointer"
              >
                🔍 VER DETALLE DE LA CUENTA
              </button>
            </div>
          )}
        </div>

        {/* Paso 2: El Menú Taquero */}
        <div className="rounded-xl border-4 border-taq-brown bg-taq-white p-4 shadow-retro flex-1">
          <div className="mb-4 border-b-2 border-taq-brown pb-3">
            <h2 className="display-font text-xl text-taq-brown tracking-tight flex items-center gap-1.5 mb-3">
              🌮 2. AGREGAR ANTOJITOS AL PEDIDO
            </h2>

            {/* Categorías (Pestañas horizontales) */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
              {Object.entries(categoriasLabel).map(([key, value]) => {
                const activa = categoriaActiva === key;
                return (
                  <button
                    type="button"
                    key={key}
                    onClick={() => setCategoriaActiva(key as Platillo['categoria'])}
                    className={`whitespace-nowrap flex items-center gap-1.5 py-2 px-4 rounded border-2 text-xs font-black transition-all ${
                      activa 
                        ? 'border-taq-brown bg-taq-orange text-white shadow-retro' 
                        : 'border-taq-brown bg-white text-taq-brown hover:bg-stone-100'
                    }`}
                  >
                    <span>{value.icon}</span>
                    <span className="bold-label text-[10px]">{value.label.split(' ')[0]}</span> {/* abreviado */}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tarjetas de Platillos del Menú */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[380px] overflow-y-auto pr-1">
            {platillosFiltrados.map(p => (
              <div 
                key={p.id}
                onClick={() => handleAgregarItem(p, 1)}
                className="group relative flex flex-col justify-between p-3.5 rounded border-2 border-taq-brown bg-white hover:bg-orange-50 cursor-pointer transition shadow-retro hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none duration-100"
              >
                <div>
                  <div className="flex items-start justify-between gap-1">
                    <h3 className="bold-label text-sm text-taq-brown">{p.nombre}</h3>
                    <span className="bold-label text-xs text-white bg-taq-orange px-2 py-0.5 rounded border border-taq-brown">
                      ${p.precio}
                    </span>
                  </div>
                  <p className="mt-2 text-[11px] text-stone-600 font-bold leading-relaxed line-clamp-2">
                    {p.descripcion}
                  </p>
                </div>
                
                {/* Multiplicadores y agregadores súper veloces */}
                <div className="mt-3 flex items-center justify-between border-t border-dashed border-stone-200 pt-2" onClick={(e) => e.stopPropagation()}>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => handleAgregarItem(p, 1)}
                      className="bg-stone-100 hover:bg-taq-brown hover:text-white text-stone-700 hover:border-taq-brown border border-stone-300 font-black text-[10px] py-1 px-2 rounded transition duration-75"
                      title="Agregar 1 unidad"
                    >
                      +1
                    </button>
                    {p.categoria === 'tacos' && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleAgregarItem(p, 3)}
                          className="bg-stone-50 hover:bg-taq-brown hover:text-white text-stone-700 hover:border-taq-brown border border-stone-300 font-black text-[10px] py-1 px-2 rounded transition duration-75"
                          title="Orden de 3 tacos"
                        >
                          +3
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAgregarItem(p, 5)}
                          className="bg-[#FFF6D9] hover:bg-taq-orange hover:text-white text-taq-brown hover:border-taq-brown border border-taq-brown font-black text-[10px] py-1 px-1.5 rounded transition duration-75 animate-pulse"
                          title="Súper orden de 5 tacos"
                        >
                          +5
                        </button>
                      </>
                    )}
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => handleAgregarItem(p, 1)}
                    className="bold-label text-[10px] bg-taq-brown text-white px-2 py-1.5 flex items-center gap-1 hover:bg-taq-orange transition rounded"
                  >
                    <Plus className="h-3 w-3" /> AGREGAR COMANDA
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* SECCIÓN DERECHA: LA ORDEN / COMANDERA ACTIVA (4 slots de grilla) */}
      <div className={`lg:col-span-4 flex flex-col gap-6 ${mobileTab === 'ticket' ? 'flex' : 'hidden lg:flex'}`}>
        
        {/* Ticket de la Comanda */}
        <form 
          onSubmit={handleEnviarComanda}
          className="rounded-xl border-4 border-taq-brown bg-taq-white p-4 shadow-retro-lg flex flex-col justify-between min-h-[500px]"
        >
          {/* Encabezado del ticket de papel */}
          <div>
            <div className="text-center border-b-[3px] border-dashed border-taq-brown pb-3">
              <span className="text-2xl block animate-bounce">📋</span>
              <h3 className="display-font text-2xl text-taq-brown mt-1">COMANDA</h3>
              <p className="bold-label text-[10px] text-taq-orange">MESERO: {usuarioActivo.nombre}</p>
              <div className="mt-2 inline-block rounded bg-taq-brown text-white text-xs bold-label py-1.5 px-3 border border-taq-brown shadow-retro">
                {mesaSeleccionada.toUpperCase()}
              </div>
            </div>

            {/* Lista de alimentos en la comanda */}
            <div className="my-4 max-h-64 overflow-y-auto pr-1 space-y-3.5">
              {comandaItems.length === 0 ? (
                <div className="py-12 flex flex-col items-center text-center">
                  <Utensils className="h-10 w-10 text-amber-900/20 stroke-1 animate-bounce" />
                  <p className="mt-2 font-sans font-bold text-amber-900/40 text-xs">La comanda está vacía.<br/>¡Echa unos de Pastor!</p>
                </div>
              ) : (
                comandaItems.map(item => (
                  <div key={item.id} className="border-b border-stone-200 pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <span className="font-sans font-black text-taq-brown text-xs text-wrap leading-tight block">{item.platillo.nombre}</span>
                        <span className="font-mono text-[10px] text-taq-orange font-bold block mt-1">
                          ${item.platillo.precio} c/u • Subt: ${item.platillo.precio * item.cantidad}
                        </span>
                      </div>

                      {/* Botones de control de cantidad súper cómodos para móvil */}
                      <div className="flex items-center gap-1.5 bg-stone-100 border border-taq-brown p-0.5 rounded shadow-retro-sm">
                        <button
                          type="button"
                          onClick={() => handleCambiarCantidad(item.id, -1)}
                          className="h-8 w-8 flex items-center justify-center rounded hover:bg-stone-200 text-taq-brown font-black text-sm"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="font-mono text-xs font-black text-taq-brown px-1 text-center min-w-[20px]">{item.cantidad}</span>
                        <button
                          type="button"
                          onClick={() => handleCambiarCantidad(item.id, 1)}
                          className="h-8 w-8 flex items-center justify-center rounded hover:bg-stone-200 text-taq-brown font-black text-sm"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Nota de Preparación Rápida con plantilla de Botoncitos de un solo toque */}
                    <div className="mt-2 bg-stone-50 p-2 rounded border border-dashed border-stone-300">
                      <input
                        type="text"
                        placeholder="✍️ Nota (Ej: sin piña, ddorado...)"
                        value={item.notas || ''}
                        onChange={(e) => handleGuardarNotaVal(item.id, e.target.value)}
                        className="w-full text-[10px] font-black text-taq-brown placeholder-stone-400 bg-transparent py-1 px-1 outline-none border-b border-stone-200 focus:border-taq-orange"
                      />
                      
                      {/* Botoncitos para autocompletar notas en un solo tap */}
                      <div className="mt-1.5 flex flex-wrap gap-1">
                        {['Con Todo', 'Sin Cebolla', 'Sin Cilantro', 'P/ Llevar', 'Dorado'].map((notaPill) => {
                          const yaTieneNota = (item.notas || '').includes(notaPill);
                          return (
                            <button
                              type="button"
                              key={notaPill}
                              onClick={() => {
                                const notaActual = item.notas || '';
                                const nuevasNotas = notaActual
                                  ? notaActual.includes(notaPill)
                                    ? notaActual.replace(new RegExp(`(, )?${notaPill}`), '')
                                    : `${notaActual}, ${notaPill}`
                                  : notaPill;
                                handleGuardarNotaVal(item.id, nuevasNotas.trim().replace(/^,/, '').trim());
                              }}
                              className={`text-[8px] font-black uppercase tracking-tight py-1 px-1.5 rounded transition duration-75 ${
                                yaTieneNota 
                                  ? 'bg-taq-orange text-white border border-taq-brown' 
                                  : 'bg-white hover:bg-stone-100 text-stone-600 border border-stone-300'
                              }`}
                            >
                              {notaPill}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            {/* Notas opcionales y cliente */}
            {comandaItems.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-amber-900/10 mb-4 text-xs font-semibold">
                
                {/* Notas generales para el Taquero */}
                <div>
                  <label className="text-[10px] uppercase font-black tracking-wider text-amber-800 flex items-center gap-1">
                    <FileText className="h-3.5 w-3.5" /> Notas Generales de Cocina:
                  </label>
                  <input
                    type="text"
                    placeholder="Instrucciones del mesero para el taquero..."
                    value={notasGenerales}
                    onChange={(e) => setNotasGenerales(e.target.value)}
                    className="mt-1 w-full text-xs text-amber-950 border border-amber-900/20 rounded-xl px-2.5 py-1.5 focus:border-orange-500 outline-none bg-white"
                  />
                </div>

                {/* Cliente Frecuente */}
                <div>
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] uppercase font-black tracking-wider text-amber-800 flex items-center gap-1">
                      👤 Cliente Frecuente (Puntos):
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowClienteModal(true)}
                      className="text-[10px] text-orange-600 font-black hover:underline"
                    >
                      + Registrar Nuevo
                    </button>
                  </div>
                  
                  <div className="relative mt-1">
                    <input
                      type="text"
                      placeholder="Buscar o escribir nombre de cliente..."
                      value={clienteNombre || buscarCliente}
                      onChange={(e) => {
                        setBuscarCliente(e.target.value);
                        if (clienteNombre) setClienteNombre('');
                      }}
                      className="w-full text-xs text-amber-950 border border-amber-900/20 rounded-xl px-2.5 py-1.5 focus:border-orange-500 outline-none bg-white"
                    />

                    {/* Auto-completar clientes en tiempo real */}
                    {buscarCliente && !clienteNombre && clientesFiltrados.length > 0 && (
                      <div className="absolute left-0 right-0 top-full mt-1 max-h-36 overflow-y-auto rounded-xl border border-amber-900/30 bg-white shadow-lg z-50">
                        {clientesFiltrados.map(c => (
                          <button
                            type="button"
                            key={c.id}
                            onClick={() => {
                              setClienteNombre(c.nombre);
                              setBuscarCliente('');
                            }}
                            className="w-full text-left font-sans text-xs hover:bg-amber-100 text-amber-950 py-2 px-3 "
                          >
                            ⭐ {c.nombre} <span className="font-mono font-bold text-amber-700">({c.puntos} pts)</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  {clienteNombre && (
                    <div className="mt-1.5 rounded-lg bg-orange-50 border border-orange-200 px-2.5 py-1 text-[10px] text-orange-900 font-bold flex items-center justify-between">
                      <span>Cliente: <strong>{clienteNombre}</strong></span>
                      <button type="button" onClick={() => setClienteNombre('')} className="text-red-500 hover:text-red-700">✕</button>
                    </div>
                  )}
                </div>

              </div>
            )}
          </div>

          {/* Totales y Envío a cocina */}
          <div className="border-t-[3px] border-dashed border-taq-brown pt-3">
            <div className="flex items-center justify-between mb-4">
              <span className="bold-label text-xs tracking-wider text-taq-brown">TOTAL ESTIMADO</span>
              <span className="bold-label text-lg text-taq-orange">${totalTemporal} MXN</span>
            </div>

            <button
              type="submit"
              disabled={comandaItems.length === 0}
              className={`w-full py-4 px-4 rounded font-sans bold-label text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition duration-75 border-2 border-taq-brown ${
                comandaItems.length === 0 
                  ? 'bg-stone-300 text-stone-600 cursor-not-allowed shadow-none' 
                  : 'bg-taq-orange text-[#FFFDF7] shadow-retro hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none'
              }`}
            >
              <Send className="h-4 w-4" /> {ordenActivaDeMesa ? 'ANEXAR ADICIÓN A LA CUENTA 🔥' : 'ENVIAR A LA COCINA 🔥'}
            </button>
          </div>
        </form>

      </div>

    </div> {/* cierra el grid de columnas internas para móvil */}

      {/* SECCIÓN COMPLETA DE ABAJO: NOTIFICACIONES DE SEGUIMIENTO EN TIEMPO REAL */}
      <div className="lg:col-span-12 mt-4 rounded-xl border-4 border-taq-brown bg-taq-white p-5 shadow-retro-lg">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b-2 border-taq-brown pb-3">
          <div>
            <h3 className="display-font text-2xl text-taq-brown flex items-center gap-2">
              🔔 SEGUIMIENTO DE TUS MESAS ACTIVAS
            </h3>
            <p className="bold-label text-[10px] text-taq-orange">Tus órdenes pendientes de ser servidas o cobradas.</p>
          </div>

          {/* Filtro de Mesa */}
          <div className="flex items-center gap-2">
            <span className="bold-label text-[11px] text-taq-brown">Ubicación:</span>
            <select
              value={filtroMesa}
              onChange={(e) => setFiltroMesa(e.target.value)}
              className="text-xs font-black uppercase text-taq-brown border-2 border-taq-brown rounded px-2.5 py-1.5 bg-white"
            >
              <option value="todas">Todas las mesas</option>
              {MESAS_INICIALES.map(m => (
                <option key={m.id} value={m.nombre}>{m.nombre}</option>
              ))}
            </select>
          </div>
        </div>

        {ordenesMesero.length === 0 ? (
          <div className="py-8 text-center text-zinc-400 font-bold text-xs">
            Sin comandas activas tuyas en este filtro. ¡Levanta un pedido arriba!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ordenesMesero.map(o => {
              // Estados: 'pendiente' | 'preparando' | 'lista' | 'entregada' | 'pagada'
              const colorBg = 
                o.estado === 'pendiente' ? 'bg-[#FFF6D9] border-taq-brown' :
                o.estado === 'preparando' ? 'bg-[#FFE6D9] border-taq-brown' :
                o.estado === 'lista' ? 'bg-[#D9F2E6] border-taq-brown alert-ring animate-pulse' :
                'bg-white border-taq-brown';

              const badgeColor = 
                o.estado === 'pendiente' ? 'bg-taq-orange text-white' :
                o.estado === 'preparando' ? 'bg-taq-orange text-white' :
                o.estado === 'lista' ? 'bg-taq-green text-white' :
                'bg-stone-500 text-white';

              const msjBoton = 
                o.estado === 'pendiente' ? 'Esperando inicio...' :
                o.estado === 'preparando' ? 'Taquero preparando... 🔥' :
                o.estado === 'lista' ? '🛎️ ¡LLEVAR A MESA! 🌮' :
                '✓ Entregado en mesa';

              return (
                <div key={o.id} className={`rounded border-4 p-4 flex flex-col justify-between shadow-retro ${colorBg}`}>
                  <div>
                    <div className="flex items-center justify-between border-b-2 border-taq-brown pb-1.5 mb-2.5">
                      <span className="bold-label text-xs text-taq-brown">{o.folio}</span>
                      <span className={`bold-label text-[9px] px-2 py-1 rounded border border-taq-brown ${badgeColor}`}>
                        {o.estado === 'pendiente' ? 'En Cola' : o.estado === 'preparando' ? 'En Plancha' : o.estado === 'lista' ? '¡LISTO!' : 'Servido'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs bold-label text-taq-brown mb-2">
                      <span>{o.mesa}</span>
                      <span className="bold-label text-taq-orange">${o.total} MXN</span>
                    </div>

                    {/* Alimentos en la tarjeta resumen */}
                    <div className="space-y-1 py-1.5 text-[11px] font-bold text-stone-800 border-t-2 border-b-2 border-taq-brown mb-3">
                      {o.platillos.map(item => (
                        <div key={item.id} className="flex justify-between gap-1 leading-snug">
                          <span>• {item.cantidad}x {item.platillo.nombre}</span>
                          {item.notas && <span className="text-[10px] text-taq-orange font-bold truncate">({item.notas})</span>}
                        </div>
                      ))}
                      {o.notasGenerales && (
                        <div className="text-[10px] text-stone-500 font-bold pt-1 border-t border-dashed border-taq-brown mt-1">
                          Nota: {o.notasGenerales}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-2 text-center">
                    {o.estado === 'lista' ? (
                      <button
                        type="button"
                        onClick={() => actualizarEstadoOrden(o.id, 'entregada')}
                        className="w-full py-2.5 px-3 rounded bg-taq-green text-white font-sans bold-label text-xs uppercase tracking-wider border-2 border-taq-brown shadow-retro hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all duration-75"
                      >
                        {msjBoton}
                      </button>
                    ) : (
                      <div className="w-full py-2.5 px-3 rounded bg-stone-100 border-2 border-taq-brown text-center text-stone-700 text-wrap font-sans bold-label text-[10px] uppercase">
                        {msjBoton}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL PARA CREAR CLIENTES AL VUELO */}
      {showClienteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl border-4 border-amber-950 bg-white p-6 shadow-2xl">
            <h3 className="font-sans text-lg font-black text-amber-950 mb-3 flex items-center gap-1.5">
              <span>👤</span> Registrar Cliente Frecuente
            </h3>

            <div className="space-y-3.5 mb-5">
              <div>
                <label className="text-xs font-bold text-amber-900">Nombre Completo:</label>
                <input
                  type="text"
                  placeholder="Ej: Lic. Gómez, Priscila Cruz..."
                  value={nuevoClienteNombre}
                  onChange={(e) => setNuevoClienteNombre(e.target.value)}
                  className="mt-1 w-full text-xs border border-amber-900/20 rounded-xl px-3 py-2 outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-amber-900">Teléfono (opcional):</label>
                <input
                  type="email"
                  placeholder="Ej: 5512345678"
                  value={nuevoClienteTel}
                  onChange={(e) => setNuevoClienteTel(e.target.value)}
                  className="mt-1 w-full text-xs border border-amber-900/20 rounded-xl px-3 py-2 outline-none focus:border-orange-500"
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setShowClienteModal(false)}
                className="rounded-xl px-4 py-2 border text-xs font-bold text-zinc-500 bg-zinc-50 hover:bg-zinc-100"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={registrarNuevoCliente}
                className="rounded-xl px-5 py-2 text-xs font-bold text-[#FFFDF9] bg-orange-600 hover:bg-orange-500"
              >
                Registrar Tarjeta de Cliente
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DETALLADO PARA VER LA CUENTA ACUMULADA DE LA MESA */}
      {showDesgloseMesa && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-taq-brown/85 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-[20px] border-4 border-taq-brown bg-taq-white p-6 shadow-retro-lg text-taq-brown">
            <div className="flex items-center gap-3 border-b-4 border-taq-brown pb-3 mb-4">
              <span className="text-2xl">💰</span>
              <div>
                <h3 className="display-font text-lg leading-none">CONSUMO DETALLADO</h3>
                <p className="bold-label text-[9px] text-taq-orange mt-1 uppercase tracking-widest">{mesaSeleccionada} • CUENTA VIVA</p>
              </div>
            </div>

            <div className="space-y-4 max-h-60 overflow-y-auto pr-1 mb-4">
              {ordenes.filter(o => o.mesa === mesaSeleccionada && o.estado !== 'pagada').length === 0 ? (
                <p className="text-xs italic text-stone-500 text-center py-4">No hay comandas activas para esta mesa.</p>
              ) : (
                ordenes.filter(o => o.mesa === mesaSeleccionada && o.estado !== 'pagada').map((ord) => (
                  <div key={ord.id} className="border-b-2 border-dashed border-stone-200 pb-3 last:border-0">
                    <div className="flex justify-between items-center bg-stone-100 p-1.5 rounded mb-2 border border-stone-300">
                      <span className="bold-label text-[9px] text-stone-600">FOLIO: {ord.folio} ({ord.estado.toUpperCase()})</span>
                      <span className="bold-label text-[9px] text-taq-orange">MESERO: {ord.mesero}</span>
                    </div>
                    <div className="space-y-1.5 pl-2">
                      {ord.platillos.map(item => (
                        <div key={item.id} className="flex justify-between text-xs font-bold text-stone-800">
                          <span>• {item.cantidad}x {item.platillo.nombre}</span>
                          <span className="font-mono text-stone-600">${item.platillo.precio * item.cantidad} MXN</span>
                        </div>
                      ))}
                      {ord.notasGenerales && (
                        <p className="text-[10px] italic text-stone-500 pl-2">Nota: {ord.notasGenerales}</p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="border-t-4 border-taq-brown pt-3 flex items-center justify-between font-black text-xs uppercase tracking-wider mb-5">
              <span>TOTAL ACUMULADO:</span>
              <span className="text-base text-taq-orange font-mono">${sumaCuentaAcumulada} MXN</span>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowDesgloseMesa(false)}
                className="w-full bg-taq-brown hover:bg-stone-850 text-white py-3 border-2 border-taq-brown shadow-retro hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all duration-75 bold-label text-[10px] uppercase cursor-pointer"
              >
                Cerrar Detalle
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
