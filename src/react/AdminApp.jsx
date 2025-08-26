import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function AdminApp() {
  const [items, setItems] = useState([]);

  const cargar = async () => {
    const { data, error } = await supabase
      .from("pagos")
      .select("id, rifa_id, comprador, referencia, telefono, cedula, banco_emisor, monto_bs, estado, created_at")
      .eq("estado", "pendiente")
      .order("created_at", { ascending: false });
    if (!error) setItems(data || []);
  };

  useEffect(() => {
    cargar();
  }, []);

  const aprobar = async (pago_id) => {
    await fetch(`/api/verificar-pago?pago_id=${pago_id}`, { method: "POST" });
    await cargar();
  };

  const rechazar = async (pago_id) => {
    await fetch(`/api/rechazar-pago?pago_id=${pago_id}`, { method: "POST" });
    await cargar();
  };

  return (
    <>
      {items.length === 0 ? (
        <div>No hay pagos pendientes.</div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Comprador</th>
              <th>Ref</th>
              <th>Monto (Bs)</th>
              <th>Fecha</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {items.map((p) => (
              <tr key={p.id}>
                <td>{p.comprador || "—"}</td>
                <td>{p.referencia || "—"}</td>
                <td>{Number(p.monto_bs).toFixed(2)}</td>
                <td>{new Date(p.created_at).toLocaleString()}</td>
                <td style={{ display:"flex", gap:8 }}>
                  <button className="btn" onClick={() => aprobar(p.id)}>Aprobar</button>
                  <button className="btn danger" onClick={() => rechazar(p.id)}>Rechazar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
