// Rutas de pictogramas SGA
const SGA_SVG = {
  inflamable: "img/inflamable.jpg",
  corrosivo: "img/corrosivo.jpg",
  toxico: "img/toxico.jpg",
  efectosCronicos: "img/toxico_efectos_cronicos.jpg",
  gas: "img/inflamable.jpg",
  comburente: "img/comburente.jpg",
  explosivo: "img/explosivo.jpg",
  ambiente: "img/ambiente.jpg",
};

// Base de datos de residuos
let listaResiduos = [
  { 
    id: "R1", 
    nombre: "Envases y botes de aerosol usados (cleaners, limpia frenos, lubricante de cadena)", 
    onu: "Clase 2.1", 
    numClase: 2.1, 
    clase: "GASES INFLAMABLES", 
    sga: SGA_SVG.inflamable 
  },
  { 
    id: "R2", 
    nombre: "Gasolina/combustible contaminado o residual", 
    onu: "Clase 3", 
    numClase: 3.0, 
    clase: "LÍQUIDOS INFLAMABLES", 
    sga: SGA_SVG.inflamable 
  },
  { 
    id: "R3", 
    nombre: "Solventes usados / desengrasantes inflamables", 
    onu: "Clase 3", 
    numClase: 3.0, 
    clase: "LÍQUIDOS INFLAMABLES", 
    sga: SGA_SVG.inflamable 
  },
  { 
    id: "R4", 
    nombre: "Estopas y trapos contaminados con aceite, combustible o solventes", 
    onu: "Clase 4.1", 
    numClase: 4.1, 
    clase: "SÓLIDOS INFLAMABLES", 
    sga: SGA_SVG.inflamable 
  },
  { 
    id: "R5", 
    nombre: "Aserrín/material absorbente contaminado con hidrocarburos", 
    onu: "Clase 4.1", 
    numClase: 4.1, 
    clase: "SÓLIDOS INFLAMABLES", 
    sga: SGA_SVG.inflamable 
  },
  { 
    id: "R6", 
    nombre: "Envases plásticos y metálicos contaminados (tarros de aceite, recipientes de insumos)", 
    onu: "Clase 4.1", 
    numClase: 4.1, 
    clase: "SÓLIDOS INFLAMABLES", 
    sga: SGA_SVG.inflamable 
  },
  { 
    id: "R7", 
    nombre: "Baterías usadas de plomo-ácido", 
    onu: "Clase 8", 
    numClase: 8.0, 
    clase: "SUSTANCIAS CORROSIVAS", 
    sga: SGA_SVG.corrosivo 
  },
  { 
    id: "R8", 
    nombre: "Aceite lubricante usado", 
    onu: "Clase 9", 
    numClase: 9.0, 
    clase: "SUSTANCIAS PELIGROSAS VARIAS", 
    sga: SGA_SVG.ambiente 
  },
  { 
    id: "R9", 
    nombre: "Filtros de aceite usados", 
    onu: "Clase 9", 
    numClase: 9.0, 
    clase: "SUSTANCIAS PELIGROSAS VARIAS", 
    sga: SGA_SVG.ambiente 
  },
  { 
    id: "R10", 
    nombre: "Pastillas y bandas de freno usadas", 
    onu: "Clase 9", 
    numClase: 9.0, 
    clase: "SUSTANCIAS PELIGROSAS VARIAS", 
    sga: SGA_SVG.ambiente 
  },
  { 
    id: "R11", 
    nombre: "Repuestos electrónicos / Eléctricos dañados (CDI, ECU, reguladores, conectores, bombillos)", 
    onu: "Clase 9", 
    numClase: 9.0, 
    clase: "SUSTANCIAS PELIGROSAS VARIAS", 
    sga: SGA_SVG.ambiente 
  }
];

let estadoMatriz = {};

function extraerNumeroClase(onuTexto) {
  const match = onuTexto.match(/\d+(\.\d+)?/);
  return match ? parseFloat(match[0]) : 9.9;
}

function ordenarResiduos() {
  listaResiduos.sort((a, b) => a.numClase - b.numClase);
}

function obtenerClaveId(idA, idB) {
  return idA < idB ? `${idA}_${idB}` : `${idB}_${idA}`;
}

function determinarPictogramaSGA(onuTexto) {
  const txt = onuTexto.toLowerCase();
  if (txt.includes("8") || txt.includes("corrosiv")) return SGA_SVG.corrosivo;
  if (txt.includes("3") || txt.includes("4.1") || txt.includes("inflam")) return SGA_SVG.inflamable;
  if (txt.includes("6.2") || txt.includes("salud") || txt.includes("crónico")) return SGA_SVG.efectosCronicos;
  if (txt.includes("6.1") || txt.includes("toxic")) return SGA_SVG.toxico;
  if (txt.includes("2.1") || txt.includes("gas")) return SGA_SVG.gas;
  if (txt.includes("5.1") || txt.includes("combu")) return SGA_SVG.comburente;
  return SGA_SVG.ambiente;
}

function obtenerCompatibilidadDefecto(resA, resB) {
  const c1 = String(resA.numClase);
  const c2 = String(resB.numClase);

  const esPar = (a, b) => (c1 === a && c2 === b) || (c1 === b && c2 === a);
  const unoEs = (a) => c1 === a || c2 === a;

  // 1. REGLA INCOMPATIBLE (X - ROJO)
  const esRojo = 
    unoEs("1") || 
    unoEs("7") || 
    unoEs("5.2") || 
    (unoEs("8") && ["2.1", "3", "4.1", "4.2", "4.3", "5.1"].includes(c1 === "8" ? c2 : c1)) ||
    (unoEs("5.1") && ["2.1", "3", "4.1", "4.2", "4.3"].includes(c1 === "5.1" ? c2 : c1));

  if (esRojo) {
    return { 
      color: "rojo", 
      desc: "Incompatible (X): Se requiere almacenamiento por separado según matriz." 
    };
  }

  // 2. REGLA PRECAUCIÓN (A - AMARILLO)
  // Incluye Clase 8 con Clase 9 (Baterías con residuos varios/electrónicos)
  const esAmarillo = 
    (unoEs("9") && ["3", "4.1", "4.2", "4.3", "8"].includes(c1 === "9" ? c2 : c1)) ||
    (unoEs("6.1") && ["2.1", "3", "4.1"].includes(c1 === "6.1" ? c2 : c1)) ||
    (unoEs("2.1") && ["3", "4.1"].includes(c1 === "2.1" ? c2 : c1));

  if (esAmarillo) {
    return { 
      color: "amarillo", 
      desc: "Precaución (A): Posibles restricciones. Requiere valorar condiciones de almacenamiento y SDS." 
    };
  }

  // 3. REGLA COMPATIBLE (V - VERDE)
  return { 
    color: "verde", 
    desc: "Compatible (V): Pueden almacenarse juntos. Verificar FDS." 
  };
}

function inicializarEstados() {
  const N = listaResiduos.length;
  for (let i = 0; i < N; i++) {
    for (let j = 0; j < N; j++) {
      let key = obtenerClaveId(listaResiduos[i].id, listaResiduos[j].id);
      if (!estadoMatriz[key]) {
        estadoMatriz[key] = obtenerCompatibilidadDefecto(listaResiduos[i], listaResiduos[j]);
      }
    }
  }
}

function renderizarMatriz() {
  ordenarResiduos();
  inicializarEstados();

  const tabla = document.getElementById("matriz-sura");
  const N = listaResiduos.length;
  let html = "";

  // 1. FILA DE ENCABEZADOS: RESIDUOS RESPEL + SGA Y COLUMNAS VERTICALES
  html += "<tr>";
  html += `
    <th class="th-respel">RESIDUOS RESPEL</th>
    <th class="th-sga">SGA</th>`;

  for (let j = N - 1; j >= 0; j--) {
    html += `
      <th class="col-header-top">
        <div class="top-header-content">
          <span class="vertical-text">${j + 1}. ${listaResiduos[j].nombre}</span>
          <img src="${listaResiduos[j].sga}" class="img-picto" alt="SGA">
        </div>
      </th>`;
  }
  html += "</tr>";

  // 2. FILAS DE LA MATRIZ CON COLUMNAS SEPARADAS
  for (let i = 0; i < N; i++) {
    html += "<tr>";

    // Celda del Nombre del Residuo
    html += `
      <td class="td-res-nombre">
        ${i + 1}. ${listaResiduos[i].nombre}
      </td>`;

    // Celda del Pictograma SGA
    html += `
      <td class="td-res-sga">
        <img src="${listaResiduos[i].sga}" class="img-picto" alt="SGA">
      </td>`;

    // Celdas Estáticas Escaladas (Sin evento onclick)
    for (let col = N - 1; col >= 0; col--) {
      if (col < i) {
        html += `<td class="empty-cell"></td>`;
      } else {
        let key = obtenerClaveId(listaResiduos[i].id, listaResiduos[col].id);
        let data = estadoMatriz[key];

        html += `<td id="cell-${i}-${col}" 
              class="cell-state st-${data.color}" 
              title="${listaResiduos[i].nombre} + ${listaResiduos[col].nombre}: ${data.desc}">
          </td>`;
      }
    }

    html += "</tr>";
  }

  tabla.innerHTML = html;
  actualizarSelects();
}

function actualizarSelects() {
  const sel1 = document.getElementById("select-res-1");
  const sel2 = document.getElementById("select-res-2");
  const selRemover = document.getElementById("select-remover");
  
  if(!sel1 || !sel2 || !selRemover) return;

  const val1 = sel1.value;
  const val2 = sel2.value;

  sel1.innerHTML = '<option value="">-- Seleccionar Residuo 1 --</option>';
  sel2.innerHTML = '<option value="">-- Seleccionar Residuo 2 --</option>';
  selRemover.innerHTML = '<option value="">-- Seleccionar a Remover --</option>';

  listaResiduos.forEach((res, index) => {
    const textoOp = `${index + 1}. ${res.nombre}`;
    sel1.add(new Option(textoOp, res.id));
    sel2.add(new Option(textoOp, res.id));
    selRemover.add(new Option(textoOp, res.id));
  });

  sel1.value = val1;
  sel2.value = val2;
}

function evaluarSeleccion() {
  const id1 = document.getElementById("select-res-1").value;
  const id2 = document.getElementById("select-res-2").value;

  const resCard = document.getElementById("evaluator-card");
  const resDisplay = document.getElementById("result-display");
  const resTitle = document.getElementById("result-title");
  const resText = document.getElementById("result-text");
  const pictoContainer = document.getElementById("pictograms-preview");

  document.querySelectorAll(".cell-state").forEach(el => el.classList.remove("selected-cell"));

  if (!id1 || !id2) {
    resDisplay.style.display = "none";
    resCard.style.borderColor = "#bdc3c7";
    return;
  }

  const res1 = listaResiduos.find(r => r.id === id1);
  const res2 = listaResiduos.find(r => r.id === id2);

  const key = obtenerClaveId(id1, id2);
  const data = estadoMatriz[key];

  pictoContainer.innerHTML = `
    <img src="${res1.sga}">
    <img src="${res2.sga}">
  `;

  if (data.color === "verde") {
    resTitle.textContent = "SE PUEDEN ALMACENAR JUNTOS (V)";
    resCard.style.borderColor = "var(--sura-green)";
  } else if (data.color === "amarillo") {
    resTitle.textContent = "PRECAUCIÓN / VALORAR SDS (A)";
    resCard.style.borderColor = "var(--sura-yellow)";
  } else {
    resTitle.textContent = "INCOMPATIBLES / SEPARACIÓN OBLIGATORIA (X)";
    resCard.style.borderColor = "var(--sura-red)";
  }

  resText.textContent = data.desc;
  resDisplay.className = `result-display ${data.color}`;
  resDisplay.style.display = "block";

  const idx1 = listaResiduos.findIndex(r => r.id === id1);
  const idx2 = listaResiduos.findIndex(r => r.id === id2);
  const i = Math.min(idx1, idx2);
  const col = Math.max(idx1, idx2);

  const celda = document.getElementById(`cell-${i}-${col}`);
  if (celda) {
    celda.classList.add("selected-cell");
    celda.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}

function cambiarEstadoClick(idA, idB) {
  let key = obtenerClaveId(idA, idB);
  let actual = estadoMatriz[key];

  if (actual.color === "verde") {
    estadoMatriz[key] = { color: "amarillo", desc: "Precaución (A): Ajustado a revisión SDS y separación física." };
  } else if (actual.color === "amarillo") {
    estadoMatriz[key] = { color: "rojo", desc: "Incompatible (X): Ajustado a separación obligatoria." };
  } else {
    estadoMatriz[key] = { color: "verde", desc: "Compatible (V): Ajustado a almacenamiento conjunto." };
  }

  renderizarMatriz();
  evaluarSeleccion();
}

function agregarNuevoResiduo() {
  const input = document.getElementById("input-nuevo");
  const claseSelect = document.getElementById("select-clase-onu");
  const nombre = input.value.trim().toUpperCase();

  if (nombre !== "") {
    const onuClase = claseSelect.value;
    const numClase = extraerNumeroClase(onuClase);
    const pictoSGA = determinarPictogramaSGA(onuClase);
    const nuevoId = "R" + (Date.now());

    listaResiduos.push({ 
      id: nuevoId,
      nombre: nombre, 
      onu: onuClase, 
      numClase: numClase,
      sga: pictoSGA 
    });

    input.value = "";
    renderizarMatriz();
  }
}

function removerResiduo() {
  const selectRemover = document.getElementById("select-remover");
  const idRemover = selectRemover.value;

  if (idRemover) {
    listaResiduos = listaResiduos.filter(r => r.id !== idRemover);
    renderizarMatriz();

    document.getElementById("select-res-1").value = "";
    document.getElementById("select-res-2").value = "";
    evaluarSeleccion();
  }
}

document.addEventListener("DOMContentLoaded", () => {
  renderizarMatriz();
  document.getElementById("select-res-1").addEventListener("change", evaluarSeleccion);
  document.getElementById("select-res-2").addEventListener("change", evaluarSeleccion);
});