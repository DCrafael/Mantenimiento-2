import { useMemo, useRef, useState } from "react";
import Button from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Label from "@/components/ui/Label";
import Checkbox from "@/components/ui/Checkbox";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs";

/* =========================
   0) Utilidades y constantes
   ========================= */

const DEFAULT_TASKS = [
  "REVISIÓN DE CARCASA","REVISIÓN DE CABLE DE PODER","REVISIÓN DE SOPORTES","REVISIÓN DE FUSIBLES","REVISIÓN DE SWITCH ON/OFF","REVISIÓN DE INDICADORES LUMINOSOS","REVISIÓN DE PANEL DE CONTROL","REVISIÓN DE PANTALLA, DISPLAY","REVISIÓN DE PULSADORES","REVISIÓN DE ACRÍLICO","REVISIÓN DE STARTE Y BALASTRO","REVISIÓN DE RODACHINAS","REVISIÓN DE FILTROS","REVISIÓN DE BOMBILLOS, LEDS","REVISIÓN DE ACCESO IRIS","REVISIÓN DE LÁMPARA","REVISIÓN DE SENSORES","REVISIÓN DE MOTOR","REVISIÓN DE EMPAQUES","REVISIÓN DE COJINERA","REVISIÓN DE OLIVAS","REVISIÓN DE ARCO METÁLICO","REVISIÓN DE MANGUERAS","REVISIÓN DE CAMPANA","REVISIÓN DE BATERÍAS","REVISIÓN DE TAPA DE BATERÍAS","REVISIÓN DE CONTACTOS ELÉCTRICOS","REVISIÓN DE TURBINA","REVISIÓN DE CONTRA ÁNGULO","REVISIÓN DE FIBRA ÓPTICA","REVISIÓN DE CUCHARAS","REVISIÓN DE PORTA INSERTOS","REVISIÓN DE PRESOSTATO","REVISIÓN DE ADAPTADOR VOLTAJE",
  "REVISIÓN DE VÁLVAS","REVISIÓN DE TRANSDUCTORES","REVISIÓN DE SOCKET","REVISIÓN DE VASO SECRETOR","REVISIÓN DE VALVULAS","REVISIÓN DE MANÓMETRO","REVISIÓN DE RODAMIENTOS","REVISIÓN DE PERA","REVISIÓN DE CÁMARA","REVISIÓN DE BRAZALETE","REVISIÓN DE PARÁMETROS DE FUNCIONAMIENTO","REVISIÓN DE ELEMENTO CALEFACTOR","REVISIÓN DE COLUMNA","REVISIÓN DE CONECTOR","REVISIÓN DE PEDAL","REVISIÓN DE PUNTA","REVISIÓN DE DISIPADOR DE CALOR","REVISIÓN DE TERMOSTATO","REVISIÓN DE SISTEMA DE IMPRESIÓN","REVISIÓN DE PALAS","REVISIÓN DE CABLE DE PACIENTE","REVISIÓN DE TEST","REVISIÓN DE FUGAS","REVISIÓN DE TIRILLAS","REVISIÓN DE ELECTRODOS","REVISIÓN DE RODILLOS","REVISIÓN DE PARTES MÓVILES","REVISIÓN DE PLACA NEUTRA","REVISIÓN DE CANISTER","REVISIÓN DE CAL SOLDADA","REVISIÓN DE FUELLE","REVISIÓN DE BANDAS","TRANSFORMADOR",
  "REVISIÓN DE ESCOBILLAS","REVISIÓN DE TEMPORIZADOR","REVISIÓN DE PLATO Y TUBOS","REVISIÓN DE PUERTA","REVISIÓN DE SELECTOR DE UI","REVISIÓN DE RESORTES","REVISIÓN DE CONDENSADOR","REVISIÓN DE OCULARES","REVISIÓN DE OBJETIVOS","REVISIÓN DE PILAS FRÍAS","REVISIÓN DE ICOPOR","REVISIÓN DE MIRILLA","REVISIÓN DE CALDERÍN","REVISIÓN DE TUBERÍA","REVISIÓN DE PLATAFORMA","REVISIÓN DE DIAL A CERO","REVISIÓN DE CONTRA PESAS","REVISIÓN DE MARIPOSAS","REVISIÓN DE MANIGUETA","REVISIÓN DE TUBO EXHALADOR","REVISIÓN DE JERINGA TRIPLE","REVISIÓN DE TUBO DE RAYOS X","REVISIÓN DE SISTEMA MECÁNICO","REVISIÓN DE SISTEMA ELÉCTRICO","REVISIÓN DE SISTEMA ELECTRÓNICO","REVISIÓN DE SISTEMA ÓPTICO","REVISIÓN DE SISTEMA HIDRÁULICO","REVISIÓN DE SISTEMA NEUMÁTICO","LUBRICACIÓN","LIMPIEZA EXTERNA","LIMPIEZA INTERNA",
];

// CSV simple
function parseCSV(text) {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length);
  if (!lines.length) return [];
  const headers = lines[0].split(",").map((h) => h.trim());
  return lines.slice(1).map((line) => {
    const cols = line.split(",");
    const obj = {};
    headers.forEach((h, i) => (obj[h] = (cols[i] ?? "").trim()));
    return obj;
  });
}
const cleanVal = (v) => {
  const s = String(v || "").trim().toLowerCase();
  if (["no tiene","no aplica","nan","none","sin serie","sin inventario"].includes(s)) return "";
  return String(v || "").trim();
};
function inferArea(row) {
  const svc = (row.servicio || "").toLowerCase();
  const ubi = (row.ubicacion || "").toLowerCase();
  if (svc.includes("odonto") || ubi.includes("odonto")) return "Odontología";
  if (svc.includes("fisiolog") || svc.includes("ciencias básicas") || ubi.includes("lab")) return "Fisiología";
  if (svc.includes("externa") || svc.includes("consult")) return "Clínica Externa";
  return row.servicio || "General";
}
function inferCategoria(equipo) {
  const e = (equipo || "").toLowerCase();
  const rules = [
    [/desfibril/,"Desfibriladores"],[/electroestim/,"Electroestimuladores"],[/monitor/,"Monitores"],
    [/tensiomet/,"Tensiómetros"],[/pulsioxim/,"Pulsioxímetros"],[/aspirador|aspiración/,"Aspiradores de secreciones"],
    [/autoclave/,"Autoclaves"],[/compresor/,"Compresores"],[/fonendoscop/,"Fonendoscopios"],
    [/b[aá]scula|balanza/,"Básculas"],[/negatoscop/,"Negatoscopios"],[/l[áa]mpara|lampara/,"Lámparas"],
    [/regulador.*ox[ií]geno|regulador de o2/,"Reguladores de oxígeno"],
  ];
  for (const [pat, cat] of rules) if (pat.test(e)) return cat;
  return e ? e.charAt(0).toUpperCase() + e.slice(1) : "Equipo";
}

/* =========================
   1) App
   ========================= */
export default function App() {
  // Login
  const [authed, setAuthed] = useState(false);
  const [usuario, setUsuario] = useState("");
  const [contrasena, setContrasena] = useState("");

  // Inventario / UI
  const [master, setMaster] = useState([]);
  const [area, setArea] = useState("");
  const [categoria, setCategoria] = useState("");
  const [search, setSearch] = useState("");
  const [registro, setRegistro] = useState(null);

  const fileRef = useRef(null);

  function doLogin(e) {
    e.preventDefault();
    if (usuario.trim().toLowerCase() === "ips" && contrasena === "autonoma") {
      setAuthed(true);
    } else {
      alert("Credenciales inválidas. Usuario: IPS  •  Contraseña: autonoma");
    }
  }

  function onUploadFile(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = String(e.target?.result || "");
        let rows = [];
        if (file.name.toLowerCase().endsWith(".json")) {
          const obj = JSON.parse(text);
          rows = Array.isArray(obj) ? obj : obj.rows || [];
        } else {
          rows = parseCSV(text);
        }

        const normalized = rows.map((r) => {
          const obj = {
            area: cleanVal(r.area || r.Area),
            categoria: cleanVal(r.categoria || r.Categoria),
            equipo: cleanVal(r.equipo || r.Equipo || r.Equipos),
            inventario: cleanVal(r.inventario || r["Num. inventario"] || r.Inventario),
            serie: cleanVal(r.serie || r.Serie),
            marca: cleanVal(r.marca || r.Marca),
            modelo: cleanVal(r.modelo || r.Modelo),
            ubicacion: cleanVal(r.ubicacion || r.Ubicacion || r.Ubicación),
            servicio: cleanVal(r.servicio || r.Servicio),
            entidad: cleanVal(r.entidad || r.Entidad),
            ciudad: cleanVal(r.ciudad || r.Ciudad),
            direccion: cleanVal(r.direccion || r.Direccion || r.Dirección),
            telefono: cleanVal(r.telefono || r.Teléfono || r.Telefono),
            equipo_original: cleanVal(r.equipo_original || r["equipo_original"]),
          };
          obj.area = obj.area || inferArea(obj);
          obj.categoria = obj.categoria || inferCategoria(obj.equipo || obj.equipo_original);
          if (!obj.inventario && !obj.serie) obj._sinSerie = true;
          return obj;
        });

        setMaster(normalized);
        const areas = Array.from(new Set(normalized.map((r) => r.area))).filter(Boolean);
        const nextArea = areas[0] || "";
        setArea(nextArea);
        const cats = Array.from(new Set(normalized.filter((r) => r.area === nextArea).map((r) => r.categoria))).filter(Boolean);
        setCategoria(cats[0] || "");
        setRegistro(null);
      } catch (err) {
        alert("No pude leer el archivo. Verifica el formato (CSV/JSON).");
        console.error(err);
      }
    };
    reader.readAsText(file);
  }

  const areas = useMemo(() => Array.from(new Set(master.map((r) => r.area))).filter(Boolean), [master]);
  const categorias = useMemo(
    () => Array.from(new Set(master.filter((r) => r.area === area).map((r) => r.categoria))).filter(Boolean),
    [master, area]
  );
  const equipos = useMemo(() => {
    const base = master.filter((r) => r.area === area && r.categoria === categoria);
    let counters = {};
    return base
      .map((r) => {
        const key = r.categoria || "Equipo";
        if (r._sinSerie) {
          counters[key] = (counters[key] || 0) + 1;
          const singular = key.endsWith("s") ? key.slice(0, -1) : key;
          return { ...r, display: `${singular} sin serie ${counters[key]}` };
        }
        const inv = r.inventario || "Sin Inv";
        const ser = r.serie || "Sin Serie";
        const name = r.equipo || r.equipo_original || r.categoria || "Equipo";
        return { ...r, display: `${name} — ${inv} / ${ser}` };
      })
      .filter((r) =>
        search ? `${r.display} ${r.equipo} ${r.inventario} ${r.serie}`.toLowerCase().includes(search.toLowerCase()) : true
      )
      .sort((a, b) => a.display.localeCompare(b.display));
  }, [master, area, categoria, search]);

  function abrirFicha(row) {
    setRegistro({
      ...row,
      reporte: "",
      fecha: "",
      estado: "OK",
      tareas: DEFAULT_TASKS.map((t) => ({ tarea: t, ok: false })),
      observaciones: "",
      repuestos: "",
    });
  }
  function setCampo(name, value) {
    setRegistro((prev) => ({ ...prev, [name]: value }));
  }

  if (!authed) {
    return (
      <div className="min-h-screen bg-white grid place-items-center p-6">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Inicio de sesión — Mantenimiento UAM</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-3" onSubmit={doLogin}>
              <div>
                <Label>Usuario</Label>
                <Input value={usuario} onChange={(e) => setUsuario(e.target.value)} placeholder="IPS" autoFocus />
              </div>
              <div>
                <Label>Contraseña</Label>
                <Input type="password" value={contrasena} onChange={(e) => setContrasena(e.target.value)} placeholder="autonoma" />
              </div>
              <Button className="w-full mt-2" type="submit">Ingresar</Button>
              <p className="text-xs text-gray-500">Demo: usuario <b>IPS</b> · contraseña <b>autonoma</b></p>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-6 text-gray-900">
      <header className="mx-auto max-w-6xl mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Mantenimiento Preventivo — UAM</h1>
          <p className="text-gray-600">Flujo: Área → Categoría → Equipo (ficha prellenada).</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => fileRef.current?.click()}>
            Cargar inventario (CSV/JSON)
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept=".csv,.json"
            className="hidden"
            onChange={(e) => onUploadFile(e.target.files?.[0])}
          />
          <Button variant="ghost" onClick={() => { setAuthed(false); }}>
            Salir
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl">
        {!master.length ? (
          <Card>
            <CardContent className="p-6 text-gray-600">
              Sube tu archivo <strong>inventario_limpio_para_app.csv</strong> para comenzar.
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue={area}>
            {({ value, setValue }) => (
              <>
                <TabsList className="mb-4">
                  {areas.map((a) => (
                    <TabsTrigger
                      key={a}
                      value={a}
                      selected={value === a}
                      onSelect={(v) => {
                        setValue(v);
                        setArea(v);
                        const cats = Array.from(new Set(master.filter((r) => r.area === v).map((r) => r.categoria))).filter(Boolean);
                        setCategoria(cats[0] || "");
                        setRegistro(null);
                      }}
                    >
                      {a}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {areas.map((a) => (
                  <TabsContent key={a} value={a} current={value}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Lateral */}
                      <Card className="md:col-span-1">
                        <CardHeader>
                          <CardTitle>{a}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div>
                            <Label>Categoría</Label>
                            <select
                              className="h-10 w-full rounded-xl border border-gray-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                              value={categoria}
                              onChange={(e) => { setCategoria(e.target.value); setRegistro(null); }}
                            >
                              {categorias.map((c) => (
                                <option key={c} value={c}>{c}</option>
                              ))}
                            </select>
                          </div>

                          <Input placeholder="Buscar equipo / inventario / serie" value={search} onChange={(e) => setSearch(e.target.value)} />

                          <div className="max-h-96 overflow-auto rounded-xl border bg-white">
                            <ul className="divide-y">
                              {equipos
                                .filter((r) => r.area === a && r.categoria === categoria)
                                .map((row, i) => (
                                  <li key={i} className="flex items-center justify-between px-3 py-2 text-sm">
                                    <span className="truncate pr-2">{row.display}</span>
                                    <Button size="sm" variant="outline" onClick={() => abrirFicha(row)}>Atender</Button>
                                  </li>
                                ))}
                            </ul>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Ficha */}
                      <div className="md:col-span-2 space-y-4">
                        {!registro ? (
                          <Card>
                            <CardContent className="p-6 text-gray-600">
                              Selecciona un equipo y pulsa <em>Atender</em> para abrir la ficha.
                            </CardContent>
                          </Card>
                        ) : (
                          <Ficha registro={registro} setCampo={setCampo} />
                        )}
                      </div>
                    </div>
                  </TabsContent>
                ))}
              </>
            )}
          </Tabs>
        )}
      </main>
    </div>
  );
}

/* =========================
   2) Ficha de mantenimiento
   ========================= */
function Ficha({ registro, setCampo }) {
  const ro = "bg-gray-100 pointer-events-none text-gray-700";
  const localRef = useRef(null);

  // Exportar a nueva ventana (serializando valores de inputs)
  function handleExportNewWindow() {
    const node = localRef.current;
    if (!node) {
      alert("Abre la ficha primero.");
      return;
    }

    // 1) Clonar y reflejar valores actuales
    const clone = node.cloneNode(true);
    const srcFields = node.querySelectorAll("input, textarea, select");
    const dstFields = clone.querySelectorAll("input, textarea, select");
    for (let i = 0; i < srcFields.length; i++) {
      const src = srcFields[i], dst = dstFields[i];
      if (!dst) continue;
      const tag = src.tagName.toLowerCase();
      const type = (src.getAttribute("type") || "").toLowerCase();
      if (tag === "input") {
        if (type === "checkbox" || type === "radio") {
          if (src.checked) dst.setAttribute("checked", "checked"); else dst.removeAttribute("checked");
        } else {
          dst.setAttribute("value", src.value ?? "");
        }
      } else if (tag === "textarea") {
        dst.textContent = src.value ?? "";
      } else if (tag === "select") {
        const idx = src.selectedIndex;
        Array.from(dst.options).forEach((opt, j) => {
          if (j === idx) opt.setAttribute("selected", "selected"); else opt.removeAttribute("selected");
        });
      }
    }

    // 2) Abrir ventana antes
    const win = window.open("", "_blank", "width=900,height=650");
    if (!win) {
      alert("El navegador bloqueó el pop-up. Permite ventanas emergentes para continuar.");
      return;
    }

    // 3) Encabezado con logos (solo impresión)
    const headerHTML = `
      <div class="print-header">
        <img src="/UAM.png" alt="UAM" />
        <img src="/J-MEDICAS.png" alt="J-Médicas" />
      </div>
    `;

    // 4) HTML final
    const html = `
      <html>
        <head>
          <title>Ficha de mantenimiento</title>
          <meta charset="utf-8" />
          <style>
            body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, sans-serif; margin: 18px; color: #111; }
            h1,h2,h3,h4 { margin: 0 0 8px; }
            input, textarea { border: 1px solid #ddd; padding: 6px 8px; border-radius: 8px; width: 100%; }
            .print-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
            .print-header img { height: 56px; object-fit: contain; }
            @media screen { .print-header { display: none; } }
            @media print { @page { size: A4; margin: 12mm; } }
          </style>
        </head>
        <body>
          ${headerHTML}
          ${clone.innerHTML}
        </body>
      </html>
    `;

    win.document.open();
    win.document.write(html);
    win.document.close();
    win.onload = () => { win.focus(); win.print(); };
  }

  return (
    <Card>
      {/* Contenido imprimible */}
      <div ref={localRef}>
        <CardHeader>
          <CardTitle>Ficha de mantenimiento — {registro.equipo || registro.equipo_original}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Cabecera editable */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <Label>N° Reporte</Label>
              <Input value={registro.reporte} onChange={(e) => setCampo("reporte", e.target.value)} />
            </div>
            <div>
              <Label>Fecha</Label>
              <Input type="date" value={registro.fecha} onChange={(e) => setCampo("fecha", e.target.value)} />
            </div>
            <div className="md:col-span-2">
              <Label>Estado</Label>
              <select
                className="h-10 w-full rounded-xl border border-gray-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={registro.estado}
                onChange={(e) => setCampo("estado", e.target.value)}
              >
                <option>OK</option>
                <option>No OK</option>
                <option>Pendiente</option>
              </select>
            </div>
          </div>

          {/* Información institución */}
          <div className="rounded-2xl border p-3 bg-white">
            <h4 className="font-semibold text-sm mb-2">Información de la institución</h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div><Label>Entidad</Label><Input className={ro} readOnly value={registro.entidad || ""} /></div>
              <div><Label>Ciudad</Label><Input className={ro} readOnly value={registro.ciudad || ""} /></div>
              <div className="md:col-span-2"><Label>Dirección</Label><Input className={ro} readOnly value={registro.direccion || ""} /></div>
              <div><Label>Teléfono</Label><Input className={ro} readOnly value={registro.telefono || ""} /></div>
              <div><Label>Servicio</Label><Input className={ro} readOnly value={registro.servicio || ""} /></div>
            </div>
          </div>

          {/* Datos del equipo */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div><Label>Equipo</Label><Input className={ro} readOnly value={registro.equipo || registro.equipo_original || ""} /></div>
            <div><Label>Marca</Label><Input className={ro} readOnly value={registro.marca || ""} /></div>
            <div><Label>Modelo</Label><Input className={ro} readOnly value={registro.modelo || ""} /></div>
            <div><Label>N° Serie</Label><Input className={ro} readOnly value={registro.serie || ""} /></div>
            <div><Label>N° Inventario</Label><Input className={ro} readOnly value={registro.inventario || ""} /></div>
            <div><Label>Ubicación</Label><Input className={ro} readOnly value={registro.ubicacion || ""} /></div>
          </div>

          {/* Checklist */}
          <div className="rounded-2xl border p-3">
            <div className="mb-2">
              <h4 className="font-semibold text-sm">Descripción del servicio — Lista de chequeo</h4>
            </div>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {registro.tareas.map((t, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <Checkbox
                    checked={t.ok}
                    onChange={(e) => {
                      const tareas = [...registro.tareas];
                      tareas[idx] = { ...t, ok: e.target.checked };
                      setCampo("tareas", tareas);
                    }}
                  />
                  <span className="text-sm">{t.tarea}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Observaciones / Repuestos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <Label>Observaciones</Label>
              <Textarea placeholder="Hallazgos, recomendaciones, seguimiento..." value={registro.observaciones} onChange={(e) => setCampo("observaciones", e.target.value)} />
            </div>
            <div>
              <Label>Repuestos utilizados</Label>
              <Textarea placeholder="Código, descripción, cantidad" value={registro.repuestos} onChange={(e) => setCampo("repuestos", e.target.value)} />
            </div>
          </div>
        </CardContent>
      </div>

      {/* Botón único */}
      <CardContent className="pt-4">
        <Button variant="outline" onClick={handleExportNewWindow}>
          Guardar PDF (ventana limpia)
        </Button>
      </CardContent>
    </Card>
  );
}







