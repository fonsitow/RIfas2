import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabaseClient";

const PAGO = {
  banco: import.meta.env.PUBLIC_PAGO_BANCO || "Banco",
  cedula: import.meta.env.PUBLIC_PAGO_CEDULA || "V-00.000.000",
  telefono: import.meta.env.PUBLIC_PAGO_TELEFONO || "04xx-xxxxxxx",
};

export default function ModalPago({ rifa, onClose }) {
  const [cantidad, setCantidad] = useState(1);
  const [monto, setMonto] = useState(Number(rifa.precio_bs));
  const [estado, setEstado] = useState("seleccion"); // seleccion | reservando | esperando | verificado | rechazado | expirado
  const [boletos, setBoletos] = useState([]);
  const [pagoId, setPagoId] = useState(null);
  const [timer, setTimer] = useState(600); // 10 min
  const [form, setForm] = useState({ comprador: "", referencia: "", telefono: "", cedula: "", banco_emisor: "" });

  useEffect(() => setMonto(cantidad * Number(rifa.precio_bs)), [cantidad, rifa.precio_bs]);

  useEffect(() => {
    if (estado !== "esperando") return;
    if (timer <= 0) { expirar(); return; }
    const t = setTimeout(() => setTimer((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [timer, estado]);

  const timeLabel = useMemo(() => {
    const m = Math.floor(timer / 60).toString().padStart(2, "0");
    const s = (timer % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  }, [timer]);

  const reservar = async () => {
    try {
      setEstado("reservando");
      // 1) buscar libres
      const { data: libres, error: e1 } = await supabase
        .from("tickets")
        .select("id, numero")
        .eq("rifa_id", rifa.id)
        .eq("estado", "libre")
        .order("numero", { ascending: true })
        .limit(cantidad);
      if (e1) throw e1;
      if (!libres || libres.length < cantidad) {
        alert("No hay suficientes números disponibles");
        setEstado("seleccion");
        return;
      }

      // 2) crear pago pendiente
      const nuevoPagoId = crypto.randomUUID();
      const monto_bs = cantidad * Number(rifa.precio_bs);
      const { error: ePago } = await supabase.from("pagos").insert({
        id: nuevoPagoId,
        rifa_id: rifa.id,
        comprador: null,
        referencia: null,
        telefono: null,
        cedula: null,
        banco_emisor: null,
        monto_bs,
        estado: "pendiente",
      });
      if (ePago) throw ePago;

      // 3) marcar tickets "apartado"
      const { error: e2 } = await supabase
        .from("tickets")
        .update({ estado: "apartado", pago_id: nuevoPagoId })
        .in("id", libres.map((x) => x.id));
      if (e2) throw e2;

      setPagoId(nuevoPagoId);
      setBoletos(libres.map((x) => x.numero));
      setEstado("esperando");
      setTimer(600);
    } catch (err) {
      console.error(err);
      alert("No se pudo reservar. Intenta de nuevo.");
      setEstado("seleccion");
    }
  };

  const reportarPago = async (e) => {
    e.preventDefault();
    try {
      if (!pagoId) return;
      const { error } = await supabase
        .from("pagos")
        .update({
          comprador: form.comprador,
          referencia: form.referencia,
          telefono: form.telefono,
          cedula: form.cedula,
          banco_emisor: form.banco_emisor,
        })
        .eq("id", pagoId);
      if (error) throw error;
      alert("Pago reportado. Quedará en verificación.");
    } catch (err) {
      console.error(err);
      alert("Error al reportar el pago.");
    }
  };

  const expirar = async () => {
    try {
      if (pagoId) {
        await fetch(`/api/rechazar-pago?pago_id=${pagoId}`, { method: "POST" });
      }
    } finally {
      setEstado("expirado");
      setTimeout(onClose, 1500);
    }
  };

  const cerrar = async () => {
    if (estado === "esperando" && pagoId) {
      await fetch(`/api/rechazar-pago?pago_id=${pagoId}`, { method: "POST" });
    }
    onClose();
  };

  return (
    <div style={{
      position:"fixed", inset:0, background:"rgba(0,0,0,.45)", display:"grid", placeItems:"center", zIndex:50
    }}>
      <div style={{ background:"#fff", width:"min(520px, 92vw)", borderRadius:16, boxShadow:"0 20px 50px rgba(0,0,0,.15)", overflow:"hidden" }}>
        <div style={{ padding:16, borderBottom:"1px solid #eef0f6", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <strong>Comprar: {rifa.nombre}</strong>
          <button onClick={cerrar} style={{ border:"none", background:"transparent", fontSize:20, cursor:"pointer" }}>✕</button>
        </div>

        <div style={{ padding:16, display:"grid", gap:12 }}>
          {estado === "seleccion" && (
            <>
              <div style={{ color:"#6b7280" }}>{rifa.descripcion}</div>
              <label>Cantidad (1–999)</label>
              <input type="number" min={1} max={999} value={cantidad}
                onChange={(e)=>setCantidad(Math.max(1, Math.min(999, parseInt(e.target.value||"1"))))}
                style={{ padding:10, borderRadius:10, border:"1px solid #e5e7eb" }}
              />
              <div><strong>Monto:</strong> Bs {monto.toFixed(2)}</div>
              <button className="btn" onClick={reservar}>Apartar números</button>
            </>
          )}

          {estado === "reservando" && (
            <div style={{ textAlign:"center", padding:"24px 0" }}>
              Reservando números…
            </div>
          )}

          {estado === "esperando" && (
            <>
              <div style={{ background:"#f2f8ff", border:"1px solid #ddeeff", padding:12, borderRadius:12 }}>
                <div style={{ fontWeight:700, marginBottom:6 }}>Pago Móvil (destino)</div>
                <div><strong>Banco:</strong> {PAGO.banco}</div>
                <div><strong>Cédula:</strong> {PAGO.cedula}</div>
                <div><strong>Teléfono:</strong> {PAGO.telefono}</div>
              </div>

              <div style={{ display:"flex", gap:12, alignItems:"center" }}>
                <div style={{ fontSize:13, color:"#6b7280" }}>Tiempo restante</div>
                <div style={{ fontWeight:700, fontSize:18 }}>{timeLabel}</div>
              </div>

              <div><strong>Tu reserva:</strong> {boletos.join(", ")}</div>
              <div><strong>Monto a pagar:</strong> Bs {monto.toFixed(2)}</div>

              <form onSubmit={reportarPago} style={{ display:"grid", gap:10 }}>
                <input required placeholder="Nombre y apellido" value={form.comprador} onChange={e=>setForm({...form, comprador:e.target.value})}
                  style={{ padding:10, borderRadius:10, border:"1px solid #e5e7eb" }} />
                <input required placeholder="Banco emisor" value={form.banco_emisor} onChange={e=>setForm({...form, banco_emisor:e.target.value})}
                  style={{ padding:10, borderRadius:10, border:"1px solid #e5e7eb" }} />
                <input required placeholder="Referencia" value={form.referencia} onChange={e=>setForm({...form, referencia:e.target.value})}
                  style={{ padding:10, borderRadius:10, border:"1px solid #e5e7eb" }} />
                <input required placeholder="Teléfono" value={form.telefono} onChange={e=>setForm({...form, telefono:e.target.value})}
                  style={{ padding:10, borderRadius:10, border:"1px solid #e5e7eb" }} />
                <input required placeholder="Cédula" value={form.cedula} onChange={e=>setForm({...form, cedula:e.target.value})}
                  style={{ padding:10, borderRadius:10, border:"1px solid #e5e7eb" }} />

                <button className="btn">Reportar pago (quedará pendiente)</button>
              </form>

              <div style={{ fontSize:13, color:"#6b7280" }}>
                Cuando verifiquemos el pago, tus números quedarán vendidos y te aparecerá en el panel de compra.
              </div>
            </>
          )}

          {estado === "verificado" && (
            <div style={{ textAlign:"center", padding:"24px 0" }}>
              ✅ Pago verificado. Números confirmados: {boletos.join(", ")}
            </div>
          )}

          {estado === "rechazado" && (
            <div style={{ textAlign:"center", padding:"24px 0", color:"#b91c1c" }}>
              Pago rechazado. La reserva fue liberada.
            </div>
          )}

          {estado === "expirado" && (
            <div style={{ textAlign:"center", padding:"24px 0", color:"#b45309" }}>
              ⏳ Tiempo agotado. La reserva fue liberada.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
