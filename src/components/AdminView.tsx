/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Orden, Platillo, Transaccion } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell 
} from 'recharts';
import { 
  TrendingUp, DollarSign, CreditCard, ChevronRight, CheckCircle, Package, Users, Award, LineChart, ToggleLeft, ToggleRight, PlusCircle, Printer, Wallet
} from 'lucide-react';

export default function AdminView() {
  const { 
    ordenes, 
    platillos, 
    clientes, 
    personal, 
    transacciones, 
    registrarCobro, 
    actualizarPlatillo, 
    agregarPlatillo 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'caja' | 'menu' | 'reportes' | 'clientes' | 'personal'>('caja');
  
  // Estados para Cobro de Caja
  const [ordenSeleccionada, setOrdenSeleccionada] = useState<Orden | null>(null);
  const [metodoPago, setMetodoPago] = useState<Transaccion['metodoPago']>('efectivo');
  const [montoRecibido, setMontoRecibido] = useState<string>('');
  const [ultimoTicketImpreso, setUltimoTicketImpreso] = useState<Transaccion | null>(null);

  // Estados para gestión de menú
  const [showAddDishForm, setShowAddDishForm] = useState(false);
  const [newDish, setNewDish] = useState({
    nombre: '',
    precio: 0,
    categoria: 'tacos' as Platillo['categoria'],
    descripcion: '',
    disponible: true
  });

  // --- FILTROS DE CAJA ---
  // Órdenes que ya se entregaron pero no se han pagado (LISTAS PARA COBRAR)
  const ordenesPorCobrar = ordenes.filter(o => o.estado === 'entregada');
  // Órdenes ya pagadas
  const ordenesSaldadas = ordenes.filter(o => o.estado === 'pagada');

  // --- REPORTES Y METRICAS (Alejandro) ---
  // 1. Calcular caja e ingresos globales
  const ingresosTotales = transacciones.reduce((sum, tx) => sum + tx.total, 0);
  const ingresosEfectivo = transacciones.filter(tx => tx.metodoPago === 'efectivo').reduce((sum, tx) => sum + tx.total, 0);
  const ingresosTarjeta = transacciones.filter(tx => tx.metodoPago === 'tarjeta').reduce((sum, tx) => sum + tx.total, 0);
  const ingresosTransferencia = transacciones.filter(tx => tx.metodoPago === 'transferencia').reduce((sum, tx) => sum + tx.total, 0);

  // 2. Gráfico: Ventas por Mesero
  const ventasPorMeseroMap: { [key: string]: number } = {};
  transacciones.forEach(tx => {
    ventasPorMeseroMap[tx.mesero] = (ventasPorMeseroMap[tx.mesero] || 0) + tx.total;
  });
  const dataVentasMesero = Object.entries(ventasPorMeseroMap).map(([name, value]) => ({
    name,
    ventas: value,
  }));

  // 3. Gráfico: Platillos más populares
  const popularidadPlatillosMap: { [key: string]: number } = {};
  ordenes
    .filter(o => o.estado === 'pagada')
    .forEach(o => {
      o.platillos.forEach(item => {
        popularidadPlatillosMap[item.platillo.nombre] = (popularidadPlatillosMap[item.platillo.nombre] || 0) + item.cantidad;
      });
    });

  const dataPopularidadPlatillos = Object.entries(popularidadPlatillosMap)
    .map(([name, cantidad]) => ({ name, cantidad }))
    .sort((a, b) => b.cantidad - a.cantidad)
    .slice(0, 5); // top 5

  const COLORS = ['#ea580c', '#b45309', '#f97316', '#78350f', '#f59e0b'];

  // --- ACCIONES ADMIN ---
  const handleToggleMenuDispo = (platillo: Platillo) => {
    actualizarPlatillo({
      ...platillo,
      disponible: !platillo.disponible
    });
  };

  const handleCrearPlatillo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDish.nombre || newDish.precio <= 0) return;
    agregarPlatillo(newDish);
    setNewDish({
      nombre: '',
      precio: 0,
      categoria: 'tacos',
      descripcion: '',
      disponible: true
    });
    setShowAddDishForm(false);
  };

  const procesarCobroCaja = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ordenSeleccionada) return;

    const montoNum = parseFloat(montoRecibido) || 0;
    if (metodoPago === 'efectivo' && montoNum < ordenSeleccionada.total) {
      alert("⚠️ El monto recibido es menor al total de la orden.");
      return;
    }

    try {
      const tx = registrarCobro(
        ordenSeleccionada.id,
        metodoPago,
        metodoPago === 'efectivo' ? montoNum : ordenSeleccionada.total
      );
      setUltimoTicketImpreso(tx);
      setOrdenSeleccionada(null);
      setMontoRecibido('');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6 text-taq-brown">
      
      {/* MENÚ DE SECCIONES (TABS) */}
      <div className="flex overflow-x-auto gap-2 border-b-4 border-taq-brown pb-3">
        <button
          onClick={() => setActiveTab('caja')}
          className={`flex items-center gap-2 py-2.5 px-4 rounded border-2 text-xs font-black uppercase tracking-wider transition duration-75 ${
            activeTab === 'caja' 
              ? 'bg-taq-orange text-white border-taq-brown shadow-retro' 
              : 'bg-white text-taq-brown border-taq-brown hover:bg-stone-100 shadow-retro'
          }`}
        >
          <DollarSign className="h-4 w-4" /> Caja y Cobros
        </button>
        <button
          onClick={() => {
            setActiveTab('menu');
            setShowAddDishForm(false);
          }}
          className={`flex items-center gap-2 py-2.5 px-4 rounded border-2 text-xs font-black uppercase tracking-wider transition duration-75 ${
            activeTab === 'menu' 
              ? 'bg-taq-orange text-white border-taq-brown shadow-retro' 
              : 'bg-white text-taq-brown border-taq-brown hover:bg-stone-100 shadow-retro'
          }`}
        >
          <Package className="h-4 w-4" /> Gestionar Menú
        </button>
        <button
          onClick={() => setActiveTab('reportes')}
          className={`flex items-center gap-2 py-2.5 px-4 rounded border-2 text-xs font-black uppercase tracking-wider transition duration-75 ${
            activeTab === 'reportes' 
              ? 'bg-taq-orange text-white border-taq-brown shadow-retro' 
              : 'bg-white text-taq-brown border-taq-brown hover:bg-stone-100 shadow-retro'
          }`}
        >
          <LineChart className="h-4 w-4" /> Reportes (D3/Recharts)
        </button>
        <button
          onClick={() => setActiveTab('clientes')}
          className={`flex items-center gap-2 py-2.5 px-4 rounded border-2 text-xs font-black uppercase tracking-wider transition duration-75 ${
            activeTab === 'clientes' 
              ? 'bg-taq-orange text-white border-taq-brown shadow-retro' 
              : 'bg-white text-taq-brown border-taq-brown hover:bg-stone-100 shadow-retro'
          }`}
        >
          <Award className="h-4 w-4" /> Tarjeta de Clientes
        </button>
        <button
          onClick={() => setActiveTab('personal')}
          className={`flex items-center gap-2 py-2.5 px-4 rounded border-2 text-xs font-black uppercase tracking-wider transition duration-75 ${
            activeTab === 'personal' 
              ? 'bg-taq-orange text-white border-taq-brown shadow-retro' 
              : 'bg-white text-taq-brown border-taq-brown hover:bg-stone-100 shadow-retro'
          }`}
        >
          <Users className="h-4 w-4" /> Plantilla de Personal
        </button>
      </div>

      {/* --- PESTAÑA 1: CAJA Y COBROS (EL KANBAN EN COBRA) --- */}
      {activeTab === 'caja' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Listado de Mesas por cobrar (8 slots) */}
          <div className="lg:col-span-8 space-y-4">
            <div className="rounded border-4 border-taq-brown bg-taq-white p-4 shadow-retro-lg">
              <h3 className="display-font text-xl text-taq-brown flex items-center gap-1 border-b-2 border-taq-brown pb-2 mb-3">
                🧮 UNIDADES CERRADAS POR COBRAR ({ordenesPorCobrar.length})
              </h3>

              {ordenesPorCobrar.length === 0 ? (
                <div className="py-12 text-center text-xs bold-label text-stone-500">
                  Ninguna mesa por cobrar en este momento.<br/>
                  (El mesero debe marcar un pedido de la cocina como "entregada" para enviarlo a Caja).
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {ordenesPorCobrar.map(o => (
                    <div 
                      key={o.id}
                      onClick={() => {
                        setOrdenSeleccionada(o);
                        setMontoRecibido(o.total.toString());
                      }}
                      className={`rounded border-2 p-3.5 flex flex-col justify-between cursor-pointer transition-all duration-75 shadow-retro ${
                        ordenSeleccionada?.id === o.id 
                          ? 'border-taq-brown bg-[#FFF6D9]' 
                          : 'border-taq-brown bg-white'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between border-b pb-1 mb-2 bold-label text-xs text-taq-brown">
                          <span>{o.folio}</span>
                          <span className="rounded bg-taq-brown text-white py-0.5 px-2 border border-taq-brown">
                            {o.mesa}
                          </span>
                        </div>

                        <div className="flex justify-between text-xs mb-2 bold-label text-taq-brown">
                          <span>Mesero: {o.mesero}</span>
                          {o.clienteNombre && (
                            <span className="text-taq-orange">👤 {o.clienteNombre}</span>
                          )}
                        </div>

                        <div className="text-[11px] font-bold text-stone-700 bg-stone-50 border-t border-b border-stone-200 p-2 space-y-1">
                          {o.platillos.map(item => (
                            <div key={item.id} className="flex justify-between">
                              <span>• {item.cantidad}x {item.platillo.nombre}</span>
                              <span className="bold-label text-[10px] text-stone-500">${item.platillo.precio * item.cantidad}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="mt-3 pt-2 border-t-2 border-dashed border-taq-brown flex justify-between items-center">
                        <span className="bold-label text-[11px] text-taq-brown">TOTAL A COBRAR</span>
                        <span className="bold-label text-sm text-taq-orange">${o.total} MXN</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Historial de transacciones de caja de hoy */}
            <div className="rounded border-4 border-taq-brown bg-taq-white p-4 shadow-retro-lg">
              <h3 className="display-font text-xl text-taq-brown flex items-center gap-1 border-b-2 border-taq-brown pb-2 mb-3">
                💰 REGISTROS DE COBRO RECIENTES ({transacciones.length})
              </h3>

              {transacciones.length === 0 ? (
                <p className="py-6 text-center text-xs bold-label text-stone-500">No se ha cobrado nada hoy.</p>
              ) : (
                <div className="rounded border-2 border-taq-brown overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#FFF6D9] font-black text-taq-brown border-b-2 border-taq-brown uppercase">
                      <tr>
                        <th className="p-2 bold-label">Hora</th>
                        <th className="p-2 bold-label">Folio</th>
                        <th className="p-2 bold-label">Ubicación</th>
                        <th className="p-2 bold-label">Mesero</th>
                        <th className="p-2 bold-label">Método</th>
                        <th className="p-3 text-right bold-label">Recaudado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-taq-brown font-semibold text-stone-800">
                      {transacciones.map(tx => (
                        <tr key={tx.id} className="hover:bg-amber-100/10">
                          <td className="p-2 font-mono text-[10px]">
                            {new Date(tx.createdAt).toLocaleTimeString('es-MX')}
                          </td>
                          <td className="p-2 bold-label text-[11px]">{tx.folioOrden}</td>
                          <td className="p-2 bold-label font-black text-[11px]">{tx.mesa}</td>
                          <td className="p-2 text-stone-600 font-bold">{tx.mesero}</td>
                          <td className="p-2">
                            <span className="uppercase py-0.5 px-1.5 rounded text-[8px] font-black bg-taq-brown text-white border border-taq-brown">
                              {tx.metodoPago}
                            </span>
                          </td>
                          <td className="p-3 text-right bold-label text-taq-orange font-black">${tx.total}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Módulo Terminal de Cobro (4 slots) */}
          <div className="lg:col-span-4 space-y-4">
            
            {ordenSeleccionada ? (
              <form 
                onSubmit={procesarCobroCaja}
                className="rounded border-4 border-taq-brown bg-taq-white p-4 shadow-retro-lg flex flex-col justify-between"
              >
                <div>
                  <div className="text-center border-b-2 border-dashed border-taq-brown pb-3 mb-4">
                    <span className="text-3xl block">🧾</span>
                    <h4 className="display-font text-xl text-taq-brown mt-1">TERMINAL</h4>
                    <span className="inline-block rounded bg-taq-orange text-white bold-label text-[10px] py-1 px-2 border border-taq-brown shadow-retro mt-1">
                      {ordenSeleccionada.folio} • {ordenSeleccionada.mesa}
                    </span>
                  </div>

                  <div className="space-y-4">
                    {/* Método de pago */}
                    <div>
                      <label className="bold-label text-[10px] text-taq-orange block">
                        Método de Liquidación:
                      </label>
                      <div className="grid grid-cols-3 gap-1.5 mt-1.5">
                        {['efectivo', 'tarjeta', 'transferencia'].map(met => (
                          <button
                            type="button"
                            key={met}
                            onClick={() => {
                              setMetodoPago(met as Transaccion['metodoPago']);
                              setMontoRecibido(ordenSeleccionada.total.toString());
                            }}
                            className={`py-2 px-1 text-[10px] bold-label uppercase rounded border-2 transition duration-75 shadow-retro ${
                              metodoPago === met 
                                ? 'bg-taq-orange text-white border-taq-brown hover:bg-orange-500' 
                                : 'bg-white border-taq-brown text-taq-brown hover:bg-stone-50'
                            }`}
                          >
                            {met === 'efectivo' ? '💵 Efectivo' : met === 'tarjeta' ? '💳 Tarjeta' : '📲 CoDi'}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Totales */}
                    <div className="rounded border-2 border-taq-brown bg-white p-3 space-y-2">
                      <div className="flex justify-between text-xs bold-label text-taq-brown">
                        <span>Total de Cuenta:</span>
                        <span className="text-taq-orange">${ordenSeleccionada.total} MXN</span>
                      </div>

                      {metodoPago === 'efectivo' && (
                        <>
                          <div className="flex flex-col gap-1.5 pt-1.5 border-t-2 border-dashed border-taq-brown">
                            <label className="bold-label text-[10px] text-taq-orange">
                              Monto de dinero Recibido:
                            </label>
                            <div className="relative">
                              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 bold-label text-stone-500">$</span>
                              <input
                                type="number"
                                placeholder="0.00"
                                required
                                value={montoRecibido}
                                onChange={(e) => setMontoRecibido(e.target.value)}
                                className="w-full text-xs bold-label text-taq-brown rounded border-2 border-taq-brown pl-6 pr-3 py-2 outline-none bg-white font-black"
                              />
                            </div>
                          </div>

                          <div className="flex justify-between text-xs bold-label pt-2 border-t-2 border-dashed border-taq-brown text-taq-green">
                            <span>CAMBIO:</span>
                            <span>
                              ${Math.max(0, (parseFloat(montoRecibido) || 0) - ordenSeleccionada.total)} MXN
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-5">
                  <button
                    type="submit"
                    className="w-full py-3.5 px-4 bg-taq-green hover:bg-emerald-700 text-white font-sans bold-label text-xs uppercase border-2 border-taq-brown shadow-retro hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all duration-75"
                  >
                    <Wallet className="h-4.5 w-4.5" /> LIQUIDAR CUENTA 💵
                  </button>
                </div>
              </form>
            ) : (
              <div className="rounded border-4 border-taq-brown bg-taq-white p-6 text-center shadow-retro py-12 flex flex-col items-center">
                <DollarSign className="h-10 w-10 text-stone-400 stroke-2 animate-bounce mb-2" />
                <h4 className="display-font text-xl text-taq-brown">Caja vacía</h4>
                <p className="bold-label text-[10px] text-taq-orange mt-1">Selecciona una mesa por liquidar para cobrar.</p>
              </div>
            )}

            {/* Imprimir último ticket simulado */}
            {ultimoTicketImpreso && (
              <div className="rounded border-4 border-taq-brown bg-white p-4 font-mono text-xs text-taq-brown shadow-retro">
                <div className="text-center border-b-2 border-dashed border-taq-brown pb-1.5 mb-2.5">
                  <span className="bold-label text-xs">TICKET DE COMPRA</span>
                </div>
                <div className="space-y-1 text-[10px] font-bold">
                  <p>FOLIO: {ultimoTicketImpreso.folioOrden}</p>
                  <p>MESA: {ultimoTicketImpreso.mesa}</p>
                  <p>MESERO: {ultimoTicketImpreso.mesero.toUpperCase()}</p>
                  <p>FECHA: {new Date(ultimoTicketImpreso.createdAt).toLocaleTimeString('es-MX')}</p>
                  <div className="border-t-2 border-b-2 border-dashed border-taq-brown py-1.5 my-1.5 leading-snug">
                    <p>TOTAL: ${ultimoTicketImpreso.total} MXN</p>
                    <p>MÉTODO: {ultimoTicketImpreso.metodoPago.toUpperCase()}</p>
                    <p>RECIBIDO: ${ultimoTicketImpreso.montoRecibido} MXN</p>
                    <p className="text-taq-green font-black">CAMBIO: ${ultimoTicketImpreso.cambio} MXN</p>
                  </div>
                  <p className="text-center bold-label text-[10px] text-taq-orange pt-1">🗣️ ¡Gracias por su preferencia, provecho!</p>
                </div>
              </div>
            )}

          </div>

        </div>
      )}

      {/* --- PESTAÑA 2: GESTIÓN DE MENÚ (PLATILLOS) --- */}
      {activeTab === 'menu' && (
        <div className="space-y-4">
          <div className="rounded border-4 border-taq-brown bg-taq-white p-5 shadow-retro-lg">
            <div className="flex flex-wrap items-center justify-between border-b-2 border-taq-brown pb-3 mb-4 gap-3">
              <div>
                <h3 className="display-font text-2xl text-taq-brown">CATÁLOGO DE ALIMENTOS</h3>
                <p className="bold-label text-[10px] text-taq-orange">Configura disponibilidad del menú para meseros.</p>
              </div>

              <button
                type="button"
                onClick={() => setShowAddDishForm(!showAddDishForm)}
                className="py-2.5 px-3.5 rounded border-2 border-taq-brown text-xs font-black text-white bg-taq-orange hover:bg-orange-500 transition duration-75 shadow-retro flex items-center gap-1.5 hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none"
              >
                <PlusCircle className="h-4.5 w-4.5" /> Agregar Platillo de Menú
              </button>
            </div>

            {/* Formulario Agregar Platillo */}
            {showAddDishForm && (
              <form 
                onSubmit={handleCrearPlatillo}
                className="rounded border-2 border-taq-brown bg-[#FFF6D9] p-4 mb-5 grid grid-cols-1 md:grid-cols-4 gap-4"
              >
                <div className="md:col-span-2">
                  <label className="bold-label text-xs text-taq-brown">Nombre del platillo:</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Taco de Tripa Súper Doradita..."
                    value={newDish.nombre}
                    onChange={(e) => setNewDish({ ...newDish, nombre: e.target.value })}
                    className="mt-1 w-full text-xs bold-label rounded border-2 border-taq-brown py-2 px-3 bg-white"
                  />
                </div>

                <div>
                  <label className="bold-label text-xs text-taq-brown">Precio unitario ($):</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="25"
                    value={newDish.precio || ''}
                    onChange={(e) => setNewDish({ ...newDish, precio: parseInt(e.target.value) || 0 })}
                    className="mt-1 w-full text-xs bold-label rounded border-2 border-taq-brown py-2 px-3 bg-white font-black"
                  />
                </div>

                <div>
                  <label className="bold-label text-xs text-taq-brown">Categoría:</label>
                  <select
                    value={newDish.categoria}
                    onChange={(e) => setNewDish({ ...newDish, categoria: e.target.value as Platillo['categoria'] })}
                    className="mt-1 w-full text-xs bold-label rounded border-2 border-taq-brown py-2 px-3 bg-white uppercase"
                  >
                    <option value="tacos">Tacos</option>
                    <option value="gringas-volcanes">Gringas y Volcanes</option>
                    <option value="especiales">Especiales</option>
                    <option value="bebidas">Bebidas</option>
                    <option value="postres">Postres</option>
                  </select>
                </div>

                <div className="md:col-span-3">
                  <label className="bold-label text-xs text-taq-brown">Descripción:</label>
                  <input
                    type="text"
                    placeholder="Ingredientes detallados para la comanda..."
                    value={newDish.descripcion}
                    onChange={(e) => setNewDish({ ...newDish, descripcion: e.target.value })}
                    className="mt-1 w-full text-xs bold-label rounded border-2 border-taq-brown py-2 px-3 bg-white"
                  />
                </div>

                <div className="flex items-end gap-2">
                  <button
                    type="submit"
                    className="w-full py-2 bg-taq-green text-white bold-label text-xs uppercase rounded border-2 border-taq-brown shadow-retro hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all duration-75"
                  >
                    Guardar Receta
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddDishForm(false)}
                    className="px-3 bg-white border-2 border-taq-brown bold-label text-xs rounded hover:bg-stone-50 py-2 text-stone-700 shadow-retro"
                  >
                    ✕
                  </button>
                </div>
              </form>
            )}

            {/* Tabla Listado de Platillos */}
            <div className="border hover:shadow-none shadow-retro border-taq-brown rounded-lg overflow-hidden">
              <table className="w-full text-left text-xs text-taq-brown">
                <thead className="bg-[#FFF6D9] font-black text-taq-brown border-b-2 border-taq-brown uppercase">
                  <tr>
                    <th className="p-3 bold-label">Categoría</th>
                    <th className="p-3 bold-label">Nombre Platillo</th>
                    <th className="p-3 bold-label">Ingredientes / Sabor</th>
                    <th className="p-3 text-right bold-label">Precio</th>
                    <th className="p-3 text-center bold-label">Disponible</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-taq-brown font-semibold text-stone-800">
                  {platillos.map(p => (
                    <tr key={p.id} className="hover:bg-amber-100/10">
                      <td className="p-3">
                        <span className="uppercase text-[9px] bold-label bg-[#FFE6D9] text-taq-orange px-2 py-0.5 rounded border border-taq-brown">
                          {p.categoria}
                        </span>
                      </td>
                      <td className="p-3 bold-label text-xs text-taq-brown">{p.nombre}</td>
                      <td className="p-3 text-stone-600 max-w-sm font-medium">{p.descripcion}</td>
                      <td className="p-3 text-right bold-label text-taq-orange">${p.precio}</td>
                      <td className="p-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleMenuDispo(p)}
                          className="mx-auto flex h-7 items-center justify-center rounded transition"
                          title={p.disponible ? 'Desactivar receta' : 'Activar receta'}
                        >
                          {p.disponible ? (
                            <span className="flex items-center gap-1 bg-[#D9F2E6] text-taq-green px-2 py-0.5 rounded text-[10px] bold-label border border-taq-brown">
                              🟢 Disponible
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 bg-[#FFE6D9] text-taq-orange px-2 py-0.5 rounded text-[10px] bold-label border border-taq-brown">
                              🔴 Agotado
                            </span>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        </div>
      )}

      {/* --- PESTAÑA 3: REPORTES Y DETALLES (MÉTRICAS D3/RECHARTS) --- */}
      {activeTab === 'reportes' && (
        <div className="space-y-6">
          
          {/* Tarjetas Informativas Generales (Ventas Caja) */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            
            <div className="rounded border-4 border-taq-brown bg-taq-white p-4 shadow-retro flex items-center justify-between">
              <div>
                <span className="bold-label text-[10px] text-taq-orange block">Total Recaudado (Caja):</span>
                <p className="bold-label text-xl text-taq-brown mt-1">${ingresosTotales} MXN</p>
              </div>
              <TrendingUp className="h-8 w-8 text-taq-orange" />
            </div>

            <div className="rounded border-4 border-taq-brown bg-taq-white p-4 shadow-retro flex items-center justify-between">
              <div>
                <span className="bold-label text-[10px] text-taq-orange block">Saldos en Efectivo:</span>
                <p className="bold-label text-lg text-taq-brown mt-1">${ingresosEfectivo} MXN</p>
              </div>
              <span className="text-2xl">💵</span>
            </div>

            <div className="rounded border-4 border-taq-brown bg-taq-white p-4 shadow-retro flex items-center justify-between">
              <div>
                <span className="bold-label text-[10px] text-taq-orange block">Saldos en Tarjeta:</span>
                <p className="bold-label text-lg text-taq-brown mt-1">${ingresosTarjeta} MXN</p>
              </div>
              <span className="text-2xl">💳</span>
            </div>

            <div className="rounded border-4 border-taq-brown bg-taq-white p-4 shadow-retro flex items-center justify-between">
              <div>
                <span className="bold-label text-[10px] text-taq-orange block">CoDi / Transferencia:</span>
                <p className="bold-label text-lg text-taq-brown mt-1">${ingresosTransferencia} MXN</p>
              </div>
              <span className="text-2xl">📲</span>
            </div>

          </div>

          {/* Gráficos Recharts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Gráfico 1: Ventas por Mesero */}
            <div className="rounded border-4 border-taq-brown bg-taq-white p-5 shadow-retro-lg">
              <h4 className="display-font text-lg text-taq-brown border-b-2 border-taq-brown pb-2 mb-4">
                📊 SERVICIO (VENTAS POR MESERO)
              </h4>
              <div className="h-64 w-full">
                {dataVentasMesero.length === 0 ? (
                  <p className="py-24 text-center text-xs bold-label text-stone-500">Sin datos de cobros todavía.</p>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dataVentasMesero}>
                      <XAxis dataKey="name" stroke="#5c3613" fontSize={11} fontWeight="black" />
                      <YAxis stroke="#5c3613" fontSize={11} />
                      <Tooltip formatter={(value) => [`$${value} MXN`, 'Total Vendido']} />
                      <Bar dataKey="ventas" fill="#d9480f" radius={[4, 4, 0, 0]}>
                        {dataVentasMesero.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Gráfico 2: Tacos Clave más Vendidos (PieChart) */}
            <div className="rounded border-4 border-taq-brown bg-taq-white p-5 shadow-retro-lg">
              <h4 className="display-font text-lg text-taq-brown border-b-2 border-taq-brown pb-2 mb-4">
                🍕 TOP 5 PRODUCTOS MÁS POPULARES
              </h4>
              <div className="h-64 w-full">
                {dataPopularidadPlatillos.length === 0 ? (
                  <p className="py-24 text-center text-xs bold-label text-stone-500">Registra cobros para graficar.</p>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={dataPopularidadPlatillos}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, cantidad }) => `${name}: ${cantidad}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="cantidad"
                      >
                        {dataPopularidadPlatillos.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* --- PESTAÑA 4: TARJETA DE CLIENTES FRECUENTES --- */}
      {activeTab === 'clientes' && (
        <div className="rounded border-4 border-taq-brown bg-taq-white p-5 shadow-retro-lg">
          <h3 className="display-font text-2xl text-taq-brown border-b-2 border-taq-brown pb-2 mb-4">
            ⭐ FIDELIZACIÓN (PROGRAMA DE PUNTOS)
          </h3>

          <div className="border border-taq-brown rounded overflow-hidden text-xs">
            <table className="w-full text-left text-taq-brown">
              <thead className="bg-[#FFF6D9] font-black border-b-2 border-taq-brown uppercase">
                <tr>
                  <th className="p-3 bold-label">Cliente</th>
                  <th className="p-3 bold-label">Teléfono</th>
                  <th className="p-3 text-center bold-label">Visitas</th>
                  <th className="p-3 text-right bold-label">Puntos Acumulados</th>
                  <th className="p-3 text-right bold-label">Promoción</th>
                  <th className="p-3 text-center bold-label">Última Visita</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-taq-brown font-semibold text-stone-800">
                {clientes.map(cli => (
                  <tr key={cli.id} className="hover:bg-amber-100/10">
                    <td className="p-3 bold-label text-xs text-taq-brown">{cli.nombre}</td>
                    <td className="p-3 font-mono text-stone-600">{cli.telefono || 'Sin registrar'}</td>
                    <td className="p-3 text-center font-bold">{cli.visitas} visitas</td>
                    <td className="p-3 text-right bold-label text-taq-orange font-black">{cli.puntos} pts</td>
                    <td className="p-3 text-right text-[10px]">
                      {cli.puntos >= 100 ? (
                        <span className="bg-[#D9F2E6] text-taq-green font-black py-1 px-2 rounded border border-taq-green uppercase text-[9px]">
                          🎁 Tacos Gratis Listos!
                        </span>
                      ) : (
                        <span className="text-stone-400">Le faltan {100 - cli.puntos} pts</span>
                      )}
                    </td>
                    <td className="p-3 text-center text-stone-500 font-bold">{cli.ultimaVisita}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- PESTAÑA 5: PLANTILLA DE PERSONAL --- */}
      {activeTab === 'personal' && (
        <div className="rounded border-4 border-taq-brown bg-taq-white p-5 shadow-retro-lg">
          <h3 className="display-font text-2xl text-taq-brown border-b-2 border-taq-brown pb-2 mb-4">
            👔 EQUIPO DE TRABAJO (KANBAN STAFF)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {personal.map(pers => (
              <div 
                key={pers.id}
                className="rounded border-4 border-taq-brown bg-white p-4 text-center shadow-retro text-taq-brown"
              >
                <div className="mx-auto h-16 w-16 bg-taq-white rounded border-2 border-taq-brown flex items-center justify-center text-3xl shadow-retro">
                  {pers.avatar || '🤵'}
                </div>
                <h4 className="display-font text-lg text-taq-brown mt-3">{pers.nombre}</h4>
                <span className="mt-1 inline-block uppercase text-[9px] bold-label bg-[#FFE6D9] text-taq-orange px-2.5 py-1 rounded border border-taq-brown">
                  {pers.rol}
                </span>

                <div className="mt-4 flex items-center justify-center gap-1.5 text-xs bold-label text-taq-green">
                  <span className="h-2.5 w-2.5 rounded-full bg-taq-green animate-pulse" />
                  <span>En Turno Activo</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
