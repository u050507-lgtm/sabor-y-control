/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Header from './components/Header';
import MeseroView from './components/MeseroView';
import CocineroView from './components/CocineroView';
import AdminView from './components/AdminView';

function MainAppContent() {
  const { usuarioActivo } = useApp();

  return (
    <div className="min-h-screen bg-taq-white text-taq-brown flex flex-col justify-between border-[12px] border-taq-brown">
      <div>
        {/* Cabecera compartida */}
        <Header />

        {/* Renderizado condicional según el Rol del Personal */}
        <main className="pb-12 px-4 md:px-8">
          {usuarioActivo.rol === 'mesero' && <MeseroView />}
          {usuarioActivo.role === undefined && usuarioActivo.rol === 'cocinero' && <CocineroView />}
          {usuarioActivo.rol === 'cocinero' && <CocineroView />}
          {usuarioActivo.rol === 'administrador' && <AdminView />}
        </main>
      </div>
      {/* Pie de Página de Sabor y Control - Operación Profesional */}
      <footer className="border-t-[8px] border-taq-brown bg-taq-brown text-taq-white py-8 px-4 md:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b-2 border-taq-white/10 pb-6 mb-6">
            
            {/* Logo de la Taquería */}
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 flex items-center justify-center rounded bg-taq-orange border border-taq-white shadow-retro text-lg font-bold">
                🌮
              </div>
              <div>
                <h4 className="bold-label text-xs tracking-wider text-taq-white uppercase">Sabor y Control - Sistema de Operaciones</h4>
                <p className="bold-label text-[9px] text-taq-orange">Terminal de Control de Taquería Local</p>
              </div>
            </div>

            {/* Sincronización en tiempo real interactiva */}
            <div className="flex items-center gap-2 bg-stone-900/40 border border-taq-white/10 rounded-lg px-3.5 py-1.5">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-taq-green opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-taq-green"></span>
              </span>
              <span className="font-mono text-[9px] font-black uppercase text-taq-white tracking-wider">
                Sincronización en Tiempo Real Activa
              </span>
            </div>

            {/* Identidad del Restaurante */}
            <div className="flex items-center gap-4 text-[10px] bold-label text-taq-white/60">
              <span className="bg-taq-orange text-white px-2 py-0.5 rounded border border-taq-white font-black text-[9px]">PRODUCCIÓN</span>
              <span>REST-ID: LOCALHOST-SERVER</span>
            </div>

          </div>

          <div className="text-center font-sans text-[10px] font-bold text-taq-white/50 tracking-wider">
            SABOR Y CONTROL © {new Date().getFullYear()} • SISTEMA DE GESTIÓN DE RESTAURANTE EN TIEMPO REAL • TODOS LOS DERECHOS RESERVADOS
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}

