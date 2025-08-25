import { useState, useEffect } from "react";
import SelectorBoletos from "./SelectorBoletos";
import "../styles/rifas.css";
                                                        
export default function ListaRifas() {
  const [rifas, setRifas] = useState([]);
  const [rifaSeleccionada, setRifaSeleccionada] = useState(null);

  useEffect(() => {
    // Datos de prueba para diseño
    setRifas([
      {
        id: 1,
        titulo: "Rifa Moto 0km",
        descripcion: "Participa por una moto totalmente nueva",
        imagen_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Motorcycle.jpg/640px-Motorcycle.jpg",
        precio: 5
      },
      {
        id: 2,
        titulo: "Rifa TV 55''",
        descripcion: "Gana un Smart TV de última generación",
        imagen_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/Flat_screen_TV.jpg/640px-Flat_screen_TV.jpg",
        precio: 2
      }
    ]);
  }, []);

  if (rifaSeleccionada) {
    return (
      <div>
        <button className="btn-volver" onClick={() => setRifaSeleccionada(null)}>
          ⬅ Volver a Rifas
        </button>
        <SelectorBoletos rifaId={rifaSeleccionada.id} titulo={rifaSeleccionada.titulo} />
      </div>
    );
  }

  return (
    <div className="contenedor">
      <h1 className="titulo">Rifas Disponibles</h1>
      <div className="lista-rifas">
        {rifas.map((rifa) => (
          <div key={rifa.id} className="rifa-card">
            <img src={rifa.imagen_url} alt={rifa.titulo} className="rifa-img" />
            <h2>{rifa.titulo}</h2>
            <p>{rifa.descripcion}</p>
            <p className="precio">${rifa.precio} USD</p>
            <button onClick={() => setRifaSeleccionada(rifa)}>Ver Boletos</button>
          </div>
        ))}
      </div>
    </div>
  );
}
