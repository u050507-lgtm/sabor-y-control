/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Orden } from '../types';
import { Flame, Clock, ChefHat, Bell, CheckCircle, Award, Hourglass, RotateCcw } from 'lucide-react';

export default function CocineroView() {
  const { ordenes, actualizarEstadoOrden, reproducirSonidoAlert } = useApp();
  const [ahora, setAhora] = useState<number>(Date.now());

  // Actualizar temporizadores de comanda cada segundo
  useEffect(() => {
    const interval = setInterval(() => {
      setAhora(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Filtrar comandas activas en la cocina (pendiente y preparando)
  const comandasEnCocina = ordenes.filter(
    o => o.estado === 'pendiente' || o.estado === 'preparando'
  ).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()); // El primero que llega entra primero en cola

  // Filtrar comandas completadas o listas en barra recientes para historial de Charly
  const historialCocina = ordenes.filter(
    o => o.estado === 'lista' || o.estado === 'entregada'
  ).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()) // mostrar el más reciente arriba
  .slice(0, 10); // ultimas 10

  // Estadísticas rápidas para el chef Charly
  const totalTacosDespachados = ordenes
    .filter(o => o.estado === 'lista' || o.estado === 'entregada' || o.estado === 'pagada')
    .reduce((sum, ord) => {
      const tacosOrd = ord.platillos
        .filter(p => p.platillo.categoria === 'tacos' || p.platillo.categoria === 'gringas-volcanes')
        .reduce((s, item) => s + item.cantidad, 0);
      return sum + tacosOrd;
    }, 0);

  const tiemposComanda = ordenes
    .filter(o => o.tiempoPreparacion !== undefined)
    .map(o => o.tiempoPreparacion as number);

  const tiempoPromedioPrep = tiemposComanda.length > 0
    ? Math.round(tiemposComanda.reduce((a, b) => a + b, 0) / tiemposComanda.length)
    : 0;

  // Formatear segundos en formato de lectura amigable min:seg
  const formatTiempo = (seg: number) => {
    const mins = Math.floor(seg / 60);
    const secs = seg % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs} min`;
  };

  // Calcular el tiempo transcurrido desde la creación hasta el momento actual
  const calcularTranscurrido = (createdAtStr: string) => {
    const creado = new Date(createdAtStr).getTime();
    const diffSeg = Math.max(0, Math.floor((ahora - creado) / 1000));
    return diffSeg;
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6 text-taq-brown">
      
      {/* ENCABEZA DE COCINA & INDICADORES CLAVE */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        <div className="md:col-span-2 rounded border-4 border-taq-brown bg-taq-brown p-4 text-taq-white flex items-center gap-4 shadow-retro">
          <div className="h-14 w-14 rounded bg-taq-orange flex items-center justify-center text-3xl shadow-retro border-2 border-taq-white">
            👨‍🍳
          </div>
          <div>
            <h2 className="display-font text-2xl uppercase leading-none text-taq-white">
              PLANCHA DOCK: CHARLY
            </h2>
            <p className="bold-label text-[10px] text-taq-orange mt-1">
              Taquero Jefe de Cocina Activo • Estufa de Comal Encendida
            </p>
          </div>
        </div>

        {/* Métrica Tacos Atendidos */}
        <div className="rounded border-4 border-taq-brown bg-taq-white p-4 flex items-center justify-between shadow-retro text-taq-brown">
          <div>
            <span className="bold-label text-[10px] text-taq-orange block">Tacos Despachados:</span>
            <p className="bold-label text-2xl text-taq-brown mt-1">{totalTacosDespachados} Tacos</p>
          </div>
          <span className="text-3xl animate-pulse">🌮</span>
        </div>

        {/* Métrica Tiempo Prep */}
        <div className="rounded border-4 border-taq-brown bg-taq-white p-4 flex items-center justify-between shadow-retro text-taq-brown">
          <div>
            <span className="bold-label text-[10px] text-taq-orange block">Promedio Cocinado:</span>
            <p className="bold-label text-2xl text-taq-brown mt-1">
              {tiempoPromedioPrep > 0 ? formatTiempo(tiempoPromedioPrep) : 'S/D'}
            </p>
          </div>
          <span className="text-3xl">⏱️</span>
        </div>

      </div>

      {/* DISEÑO EN DOS GRUPOS: COMANDAS EN PROCESO VS HISTORIAL */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* COMANDAS EN LA COCINA (8 Slots) */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <div className="rounded border-4 border-taq-brown bg-taq-white p-4 shadow-retro-lg">
            <h3 className="display-font text-2xl text-taq-brown flex items-center gap-2 border-b-2 border-taq-brown pb-2 mb-4">
              🔥 COLA DE PLANCHA ({comandasEnCocina.length} Órdenes activas)
            </h3>

            {comandasEnCocina.length === 0 ? (
              <div className="py-24 text-center flex flex-col items-center">
                <div className="h-16 w-16 bg-orange-100 border-2 border-taq-brown rounded flex items-center justify-center text-4xl animate-pulse mb-3">
                  💤
                </div>
                <h4 className="display-font text-2xl text-taq-brown">¡Comunal despejado por ahora!</h4>
                <p className="bold-label text-[11px] text-taq-orange mt-1">Esperando a que Lupita o Beto tomen nuevas mesas.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {comandasEnCocina.map(o => {
                  const segTranscurridos = calcularTranscurrido(o.createdAt);
                  const enPreparacion = o.estado === 'preparando';
                  
                  // Colores según tiempo y estado para advertir retrasos
                  const retrasoCritico = segTranscurridos > 300; // más de 5 minutos
                  const colorTarjeta = 
                    enPreparacion 
                    ? retrasoCritico ? 'border-red-600 bg-red-100' : 'border-taq-brown bg-[#FFF6D9]' 
                    : 'border-taq-brown bg-white';

                  return (
                    <div 
                      key={o.id}
                      className={`rounded border-4 p-4 flex flex-col justify-between shadow-retro transition-all duration-300 ${colorTarjeta}`}
                    >
                      <div>
                        {/* Cabecera Comanda */}
                        <div className="flex items-center justify-between border-b-2 border-taq-brown pb-2 mb-3.5">
                          <div>
                            <span className="bold-label text-lg text-taq-brown">{o.folio}</span>
                            <span className="block bold-label text-[9px] text-[#D9480F]">
                              MESERO: {o.mesero}
                            </span>
                          </div>
                          
                          <div className="flex flex-col items-end">
                            <span className="bold-label text-[10px] bg-taq-brown text-white py-1 px-2 border border-taq-brown">
                              {o.mesa}
                            </span>
                            <div className={`flex items-center gap-1 mt-1.5 bold-label text-[11px] ${
                              retrasoCritico ? 'text-red-600 animate-pulse' : 'text-taq-brown'
                            }`}>
                              <Clock className="h-3.5 w-3.5" />
                              <span>{formatTiempo(segTranscurridos)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Listado Principal de Alimentos (¡Tipografía gigante!) */}
                        <div className="space-y-3 mb-4">
                          {o.platillos.map(item => (
                            <div 
                              key={item.id} 
                              className="rounded border-2 border-taq-brown bg-taq-white p-2 text-taq-brown shadow-sm"
                            >
                              <div className="flex items-center justify-between">
                                <span className="bold-label text-xs text-taq-brown flex items-center gap-2 leading-none">
                                  <span className="bold-label text-xs text-white bg-taq-orange border-2 border-taq-brown px-2 py-0.5 rounded shadow-retro">
                                    {item.cantidad}
                                  </span>
                                  {item.platillo.nombre}
                                </span>
                              </div>

                              {/* Notas Críticas */}
                              {item.notas && (
                                <div className="mt-1.5 rounded border border-taq-brown bg-orange-100 px-2 py-1 text-[10px] bold-label text-taq-orange">
                                  ✍️ {item.notas}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>

                        {/* Notas generales de la orden */}
                        {o.notasGenerales && (
                          <div className="rounded border bg-white border-taq-brown p-2 text-[10px] bold-label text-taq-brown mb-4">
                            📌 NOTA: {o.notasGenerales}
                          </div>
                        )}
                      </div>

                      {/* Boton de Acción del Taquero */}
                      <div className="pt-2 border-t-2 border-taq-brown border-dashed">
                        {!enPreparacion ? (
                          <button
                            type="button"
                            onClick={() => actualizarEstadoOrden(o.id, 'preparando')}
                            className="w-full py-3 px-4 rounded flex items-center justify-center gap-2 bg-taq-orange hover:bg-orange-500 text-white bold-label text-xs border-2 border-taq-brown shadow-retro hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all duration-75"
                          >
                            <Flame className="h-4 w-4 text-white" /> TENTAR PLANCHA (EMPEZAR)
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => actualizarEstadoOrden(o.id, 'lista')}
                            className="w-full py-3 px-4 rounded flex items-center justify-center gap-2 bg-taq-green hover:bg-emerald-700 text-white bold-label text-xs border-2 border-taq-brown shadow-retro hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all duration-75"
                          >
                            <Bell className="h-4 w-4 text-white animate-bounce" /> 🛎️ ¡A LA BARRA! (TING)
                          </button>
                        )}
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* HISTORIAL RECIENTE DE DESPACHOS (4 Slots) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <div className="rounded border-4 border-taq-brown bg-taq-white p-4 shadow-retro-lg">
            <h3 className="display-font text-xl text-taq-brown flex items-center gap-1.5 border-b-2 border-taq-brown pb-2 mb-4">
              <span>📋</span> BARRA / REGISTRO RECIENTE
            </h3>

            <div className="space-y-4 max-h-[580px] overflow-y-auto pr-1">
              {historialCocina.length === 0 ? (
                <p className="py-12 text-center text-xs bold-label text-zinc-500">Ningún pedido despachado todavía.</p>
              ) : (
                historialCocina.map(o => (
                  <div 
                    key={o.id}
                    className="rounded border-2 border-taq-brown bg-white p-3 text-xs text-taq-brown shadow-retro"
                  >
                    <div className="flex items-center justify-between font-bold border-b-2 border-dashed border-taq-brown pb-1.5 mb-2">
                      <span className="bold-label text-xs text-taq-brown">{o.folio}</span>
                      <span className="bold-label text-[9px] bg-stone-200 border border-taq-brown text-taq-brown py-0.5 px-2 rounded">
                        {o.estado === 'lista' ? 'En Barra' : 'Servido'}
                      </span>
                    </div>

                    <div className="flex justify-between bold-label text-[11px] mb-1">
                      <span>{o.mesa}</span>
                      <span className="text-taq-orange">Mesero: {o.mesero}</span>
                    </div>

                    {o.tiempoPreparacion !== undefined && (
                      <div className="text-[10px] text-stone-500 bold-label mb-2 flex items-center gap-1">
                        <Clock className="h-3 w-3 text-taq-orange" /> Cocinado en {formatTiempo(o.tiempoPreparacion)}
                      </div>
                    )}

                    {/* Alimentos */}
                    <div className="text-[11px] font-bold text-stone-700 bg-stone-50 border border-taq-brown rounded p-2">
                      {o.platillos.map(item => (
                        <div key={item.id} className="leading-snug">
                          • {item.cantidad}x {item.platillo.nombre}
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
