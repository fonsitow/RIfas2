import { useEffect, useState } from "react";

export default function BoletosAsignados({ cantidad }) {
  const [boletos, setBoletos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const asignarBoletos = async () => {
      try {
        const res = await fetch("/api/reservar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cantidad, comprador: "cliente_stripe" })
        });

        const data = await res.json();
        setBoletos(data.boletos || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    asignarBoletos();
  }, [cantidad]);

  if (loading) return <p>Asignando tus boletos...</p>;

  if (!boletos.length) return <p>No se pudieron asignar boletos.</p>;

  return (
    <div style={{ textAlign: "center" }}>
      <h2>¡Tus boletos han sido asignados!</h2>
      <p>Números de tus boletos:</p>
      <div style={{
        display: "flex",
        justifyContent: "center",
        flexWrap: "wrap",
        gap: "0.5rem"
      }}>
        {boletos.map(b => (
          <div key={b.id} style={{
            padding: "0.5rem 1rem",
            background: "green",
            color: "white",
            borderRadius: "6px"
          }}>
            {b.numero.toString().padStart(3, "0")}
          </div>
        ))}
      </div>
    </div>
  );
}
