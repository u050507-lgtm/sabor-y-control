/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Bell, Flame, Moon, Sun, User, Volume2, VolumeX, HelpCircle, AlertCircle } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

export default function Header() {
  const { alertas, eliminarAlerta, marcarAlertasLeidas, usuarioActivo, setPersonal, personal, setUsuarioActivo, reproducirSonidoAlert } = useApp();
  const [showBellMenu, setShowBellMenu] = useState(false);
  const [soundsEnabled, setSoundsEnabled] = useState(true);
  const [showHelpModal, setShowHelpModal] = useState(false);

  const noLeidas = alertas.filter(a => !a.leido);

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = personal.find(p => p.id === e.target.value);
    if (selected) {
      setUsuarioActivo(selected);
      // reproducir un chidito tono al cambiar de rol
      if (soundsEnabled) {
        reproducirSonidoAlert(selected.rol === 'cocinero' ? 'campana' : selected.rol === 'administrador' ? 'caja' : 'comanda');
      }
    }
  };

  const ringSoundTest = () => {
    if (soundsEnabled) {
      reproducirSonidoAlert('campana');
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b-[8px] border-taq-brown bg-taq-brown py-4 px-4 md:px-8 text-taq-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
          
          {/* Logotipo de la Taquería */}
          <div className="flex items-center gap-3">
            <div className="relative flex h-14 w-14 items-center justify-center rounded-xl bg-taq-orange border-2 border-taq-white shadow-retro text-3xl">
              🌮
              <span className="absolute -top-1 -right-1 text-base">🔥</span>
            </div>
            <div>
              <h1 className="display-font text-2xl md:text-3xl text-taq-white flex items-center gap-2 leading-none">
                SABOR Y CONTROL
                <span className="hidden md:inline bold-label text-[10px] bg-taq-orange text-white py-0.5 px-2 rounded border border-taq-white">Pro</span>
              </h1>
              <p className="bold-label text-[11px] tracking-[0.2em] text-taq-orange/90 mt-1">GESTIÓN DE TAQUERÍA TRADICIONAL</p>
            </div>
          </div>

          {/* Selector de Rol Activo e Indicadores */}
          <div className="flex items-center flex-wrap gap-2 sm:gap-4">
            
            {/* Control Instrucciones */}
            <button
              onClick={() => setShowHelpModal(true)}
              className="flex h-10 items-center justify-center gap-1.5 rounded-lg border-2 border-taq-brown bg-taq-white px-3 text-xs font-bold text-taq-brown shadow-retro hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all"
              title="¿Cómo funciona la sincronización multitab?"
            >
              <HelpCircle className="h-4 w-4 text-taq-brown" />
              <span className="bold-label text-[10px]">Guía Multi-pestaña</span>
            </button>

            {/* Test de Sonido */}
            <button
              onClick={() => {
                setSoundsEnabled(!soundsEnabled);
                if (!soundsEnabled) setTimeout(() => reproducirSonidoAlert('campana'), 100);
              }}
              className={`flex h-10 w-10 items-center justify-center rounded-lg transition border-2 border-taq-brown shadow-retro hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none ${
                soundsEnabled 
                  ? 'bg-taq-orange text-white' 
                  : 'bg-stone-300 text-stone-600'
              }`}
              title={soundsEnabled ? 'Sonidos activados' : 'Sonidos desactivados'}
            >
              {soundsEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
            </button>

            {/* Selector de Rol */}
            <div className="flex items-center gap-2 rounded-lg border-2 border-taq-brown bg-taq-white p-1 pl-2 text-taq-brown shadow-retro">
              <span className="text-xl animate-bounce duration-1000" role="img" aria-label="avatar">
                {usuarioActivo.avatar || '🤵'}
              </span>
              <div className="flex flex-col">
                <span className="bold-label text-[9px] text-taq-orange leading-none">
                  Rol Actual:
                </span>
                <select
                  value={usuarioActivo.id}
                  onChange={handleRoleChange}
                  className="bg-transparent text-xs font-black text-taq-brown focus:outline-none cursor-pointer pr-1 uppercase"
                >
                  {personal.map(p => (
                    <option key={p.id} value={p.id} className="text-taq-brown font-bold bg-white">
                      {p.nombre} ({p.rol.toUpperCase()})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Campana de Alertas / Notificaciones */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowBellMenu(!showBellMenu);
                  if (!showBellMenu) marcarAlertasLeidas();
                }}
                className={`relative flex h-10 w-10 items-center justify-center rounded-lg border-2 border-taq-brown transition shadow-retro hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none ${
                  noLeidas.length > 0 
                    ? 'bg-[#EE5A24] text-white animate-pulse' 
                    : 'bg-taq-white text-taq-brown'
                }`}
              >
                <Bell className="h-5 w-5" />
                {noLeidas.length > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] bold-label text-white ring-2 ring-taq-brown">
                    {noLeidas.length}
                  </span>
                )}
              </button>

              {/* Menú desplegable de Alertas */}
              <AnimatePresence>
                {showBellMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 15 }}
                    className="absolute right-0 mt-3 w-80 max-h-96 overflow-y-auto rounded-xl border-4 border-taq-brown bg-taq-white p-4 shadow-retro-lg z-50 text-taq-brown"
                  >
                    <div className="mb-3 flex items-center justify-between border-b-2 border-taq-brown pb-2">
                      <h3 className="bold-label text-xs tracking-wider">CAMPANILLA DE COMANDAS</h3>
                      <button
                        onClick={() => {
                          marcarAlertasLeidas();
                          setShowBellMenu(false);
                        }}
                        className="bold-label text-[10px] text-taq-orange hover:underline"
                      >
                        Cerrar
                      </button>
                    </div>

                    <div className="flex flex-col gap-2">
                      {alertas.length === 0 ? (
                        <p className="py-4 text-center text-xs font-bold text-zinc-500">Sin alertas por ahora.</p>
                      ) : (
                        alertas.map(alert => (
                          <div
                            key={alert.id}
                            className={`relative rounded border-2 border-taq-brown p-2.5 text-xs ${
                              alert.tipo === 'lista' 
                                ? 'bg-green-100 text-green-950 font-bold' 
                                : alert.tipo === 'nueva_orden'
                                ? 'bg-orange-100 text-orange-950 font-bold'
                                : alert.tipo === 'pago'
                                ? 'bg-yellow-100 text-yellow-950 font-bold'
                                : 'bg-stone-100 text-taq-brown'
                            }`}
                          >
                            <button
                              onClick={() => eliminarAlerta(alert.id)}
                              className="absolute right-1 top-1 text-taq-brown font-black hover:text-red-600"
                            >
                              ✕
                            </button>
                            <div className="font-bold pr-4">{alert.mensaje}</div>
                            <div className="mt-1 font-mono text-[9px] text-zinc-500">
                              {new Date(alert.createdAt).toLocaleTimeString()}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>

        </div>
      </header>

      {/* Modal de Ayuda para Sincronización Multi-Pestaña */}
      <AnimatePresence>
        {showHelpModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-taq-brown/85 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg rounded-xl border-4 border-taq-brown bg-taq-white p-6 md:p-8 shadow-retro-lg text-taq-brown"
            >
              <div className="flex items-center gap-4 border-b-4 border-taq-brown pb-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-taq-orange border-2 border-taq-brown shadow-retro text-2xl">
                  🌮
                </div>
                <div>
                  <h3 className="display-font text-2xl leading-none">Guía de Simulación</h3>
                  <p className="bold-label text-xs text-taq-orange mt-1">¡Sincronización en Tiempo Real al instante!</p>
                </div>
              </div>

              <div className="my-5 space-y-3 px-1 text-xs text-taq-brown leading-relaxed font-bold">
                <p>
                  Para simular el flujo real de operaciones de la taquería al instante, te recomendamos abrir <strong>dos ventanas o pestañas de este navegador</strong> con esta misma aplicación lado a lado:
                </p>
                
                <div className="rounded border-2 border-taq-brown bg-orange-100 p-3">
                  <h4 className="bold-label text-xs text-[#D9480F] mb-1 flex items-center gap-1">
                    <span>1. Ventana del Mesero (Pestaña A)</span>
                  </h4>
                  <p className="font-sans text-[11px] text-taq-brown">Configura el rol activo como <strong>Lupita</strong> o <strong>Beto</strong>. Levanta una comanda en una mesa y haz clic en <strong>Enviar a Cocina</strong>.</p>
                </div>

                <div className="rounded border-2 border-taq-brown bg-amber-50 p-3">
                  <h4 className="bold-label text-xs text-taq-brown mb-1 flex items-center gap-1">
                    <span>2. Ventana del Taquero (Pestaña B)</span>
                  </h4>
                  <p className="font-sans text-[11px] text-taq-brown">Configura el rol activo como <strong>Charly</strong>. Verás de inmediato que la comanda cae con un sonido de impresora <code>Trrr-trrr</code> sin necesidad de recargar la página.</p>
                </div>

                <div className="rounded border-2 border-taq-brown bg-green-100 p-3">
                  <h4 className="bold-label text-xs text-taq-green mb-1 flex items-center gap-1">
                    <span>3. El flujo se completa:</span>
                  </h4>
                  <p className="font-sans text-[11px] text-[#2F5D3E]">Al picar <strong>¡A la Barra!</strong> en la cocina, escucharás el timbre de campana de taco listo <code>¡Ting!</code> en ambas pestañas. Y el mesero sabrá que ya puede servir los tacos calientes.</p>
                </div>
              </div>

              <div className="flex justify-end pt-3 border-t-2 border-taq-brown">
                <button
                  onClick={() => setShowHelpModal(false)}
                  className="w-full sm:w-auto bg-taq-orange text-white px-6 py-3 border-2 border-taq-brown shadow-retro hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all bold-label text-xs"
                >
                  ¡Entendido! Vamos a chambear
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
