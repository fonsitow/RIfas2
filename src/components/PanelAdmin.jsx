import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(import.meta.env.PUBLIC_SUPABASE_URL, import.meta.env.PUBLIC_SUPABASE_KEY);

export default function PanelAdmin() {
  const [pagos, setPagos] = useState([]);

  const cargarPagos = async () => {
    const { data } = await supabase
      .from("pagos")
      .select("*")
      .eq("estado", "pendiente");
    setPagos(data);
  };

  useEffect(() => {
    cargarPagos();
  }, []);

  const aprobarPago = async (id) => {
    await supabase
      .from("pagos")
      .update({ estado: "aprobado" })
      .eq("id", id);

    await supabase
      .from("tickets")
      .update({ estado: "vendido" })
      .eq("pago_id", id)
      .eq("estado", "apartado");

    cargarPagos();
  };

  const rechazarPago = async (id) => {
    await supabase
      .from("pagos")
      .update({ estado: "rechazado" })
      .eq("id", id);

    await supabase
      .from("tickets")
      .update({ estado: "libre", pago_id: null, comprador: null })
      .eq("pago_id", id);

    cargarPagos();
  };

  return (
    <div className="container py-4">
      <h2>Panel de verificación de pagos</h2>
      <table className="table table-bordered mt-3">
        <thead>
          <tr>
            <th>Comprador</th>
            <th>Monto</th>
            <th>Fecha</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {pagos.map(p => (
            <tr key={p.id}>
              <td>{p.comprador || "Sin nombre"}</td>
              <td>Bs. {p.monto}</td>
              <td>{new Date(p.creado_en).toLocaleString()}</td>
              <td>
                <button className="btn btn-success btn-sm me-2" onClick={() => aprobarPago(p.id)}>Aprobar</button>
                <button className="btn btn-danger btn-sm" onClick={() => rechazarPago(p.id)}>Rechazar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
