import { useState } from "react";
import RifaCard from "./RifaCard.jsx";

export default async function ComprarRifa() {
  const rifas = [
    { id: 1, nombre: "Rifa del iPhone", descripcion: "iPhone 15 Pro Max", precio: 5, moneda: "USD" },
    { id: 2, nombre: "Rifa de TV", descripcion: "Smart TV 55\"", precio: 3, moneda: "USD" },
    { id: 3, nombre: "Rifa de Laptop", descripcion: "MacBook Air", precio: 10, moneda: "USD" }
  ];

  const [selectedRifa, setSelectedRifa] = useState(null);
  const [cantidad, setCantidad] = useState(1);
  const [metodoPago, setMetodoPago] = useState("crypto");
  const [mensajePago, setMensajePago] = useState("");

  const iniciarPago = async () => {
    if (!selectedRifa) {
      alert("Selecciona primero una rifa.");
      return;
    }

    setMensajePago("Generando pago...");
    const endpoint = metodoPago === "crypto" ? "/api/crypto-checkout" : "/api/bolivares-checkout";
    const precio = metodoPago === "crypto" ? cantidad * selectedRifa.precio : cantidad * selectedRifa.precio * 2000000; // ejemplo Bs

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cantidad, precio, rifaId: selectedRifa.id }),
      });
      const data = await res.json();

      if (metodoPago === "crypto") {
        setMensajePago(`Paga ${data.monto} ${data.moneda} a la wallet: ${data.wallet}\nQR: ${data.qr}`);
      } else {
        setMensajePago(`Deposita Bs. ${data.monto} a la cuenta: ${data.cuenta}.\nReferencia: ${data.referencia}`);
      }
    } catch (err) {
      setMensajePago("Error al generar pago.");
      console.error(err);
    }
  };
 
  return (
    <div style={{ textAlign: "center", fontFamily: "Arial, sans-serif", padding: "2rem" }}>
      <h1>Selecciona la rifa que quieres comprar</h1>
      <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap" }}>
        {rifas.map(rifa => (
          <RifaCard
            key={rifa.id}
            rifa={rifa}
            onSelect={setSelectedRifa}
            selected={selectedRifa}
          />
        ))}
      </div>

      <div style={{ marginTop: "1rem" }}>
        <label>Cantidad de boletos:</label>
        <input
          type="number"
          min="1"
          max="999"
          value={cantidad}
          onChange={(e) => setCantidad(parseInt(e.target.value))}
          style={{ padding: "0.3rem", width: "60px", marginLeft: "0.5rem" }}
        />
      </div>

      <div style={{ margin: "1rem" }}>
        <label>Método de pago:</label>
        <select
          value={metodoPago}
          onChange={(e) => setMetodoPago(e.target.value)}
          style={{ padding: "0.3rem", marginLeft: "0.5rem" }}
        >
          <option value="crypto">Crypto (USD)</option>
          <option value="bolivares">Bolívares</option>
        </select>
      </div>

      <button
        onClick={iniciarPago}
        style={{ padding: "0.5rem 1rem", cursor: "pointer", background: "#0070f3", color: "#fff", border: "none", borderRadius: "5px" }}
      >
        Generar Pago
      </button>

      {mensajePago && (
        <div style={{ marginTop: "2rem", whiteSpace: "pre-line", fontWeight: "bold" }}>
          {mensajePago}
        </div>
      )}
    </div>
  );
}

