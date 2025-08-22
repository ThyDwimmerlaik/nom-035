import React, { JSX, useEffect, useMemo, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Container,
  Divider,
  FormControl,
  GridLegacy as Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
  Button,
  Tooltip,
  LinearProgress,
  TextField,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import AnalyticsIcon from "@mui/icons-material/Analytics";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import DownloadIcon from "@mui/icons-material/Download";
import RefreshIcon from "@mui/icons-material/Refresh";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import InsightsIcon from "@mui/icons-material/Insights";
import GroupsIcon from "@mui/icons-material/Groups";
import WorkHistoryIcon from "@mui/icons-material/WorkHistory";
import SecurityIcon from "@mui/icons-material/Security";
import {
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip as RTooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  LineChart,
  Line,
} from "recharts";

/**
 * NOM-035 Dashboard – Instrucciones de datos
 * ---------------------------------------------------------
 * Este componente intenta cargar los datos desde "/nom035-data.json" (por ejemplo, en la carpeta public/).
 * El formato esperado del JSON es el siguiente (ejemplo abreviado):
 *
 * {
 *   "employees": [
 *     { "id": "e1", "name": "Ana López", "role": "Evaluadora", "orgUnit": "Académica", "weeklyCapacity": 40, "secureReports": 1 },
 *     { "id": "e2", "name": "Luis Pérez", "role": "Coordinador", "orgUnit": "Académica", "weeklyCapacity": 38, "secureReports": 0 },
 *     { "id": "e3", "name": "María Díaz", "role": "Analista", "orgUnit": "TI", "weeklyCapacity": 40, "secureReports": 2 }
 *   ],
 *   "tasks": [
 *     { "id": "t1", "title": "Evaluar plan de mejora", "pattern": "direct", "assigneeId": "e1", "orgUnit": "Académica", "effortHours": 8, "createdAt": "2025-08-01", "deadline": "2025-08-22", "status": "in_progress", "priority": "high" },
 *     { "id": "t2", "title": "Auditar cargas", "pattern": "deferred", "assigneeId": null, "orgUnit": "TI", "effortHours": 5, "createdAt": "2025-08-10", "deadline": "2025-09-01", "status": "backlog", "priority": "medium" },
 *     { "id": "t3", "title": "Soporte de plataforma", "pattern": "offer", "assigneeId": null, "orgUnit": "TI", "effortHours": 6, "createdAt": "2025-08-05", "deadline": "2025-08-25", "status": "offered", "priority": "low", "offersAccepted": 0 }
 *   ]
 * }
 *
 * Para probar rápidamente, si no existe el archivo JSON, se usará un conjunto de datos de ejemplo incorporado
 * y podrás DESCARGARLO como archivo con el botón "Descargar JSON de ejemplo".
 */

// Tipos de datos
interface Employee {
  id: string;
  name: string;
  role: string;
  orgUnit: string;
  weeklyCapacity: number;
  secureReports?: number;
}

interface Task {
  id: string;
  title: string;
  pattern: "direct" | "deferred" | "offer";
  assigneeId: string | null;
  orgUnit: string;
  effortHours: number;
  createdAt: string;
  deadline: string;
  status: "backlog" | "offered" | "in_progress" | "done";
  priority: "high" | "medium" | "low";
  offersAccepted?: number;
}

interface EmployeeRow {
  id: string;
  name: string;
  role: string;
  orgUnit: string;
  weeklyCapacity: number;
  assignedTasks: number;
  assignedHours: number;
  utilization: number;
  risk: number;
  secureReports: number;
}

// Datos de ejemplo (fallback) si no se encuentra nom035-data.json
const sampleData = {
  employees: [
    { id: "e1", name: "Ana López", role: "Evaluadora", orgUnit: "Académica", weeklyCapacity: 40, secureReports: 1 },
    { id: "e2", name: "Luis Pérez", role: "Coordinador", orgUnit: "Académica", weeklyCapacity: 38, secureReports: 0 },
    { id: "e3", name: "María Díaz", role: "Analista", orgUnit: "TI", weeklyCapacity: 40, secureReports: 2 },
    { id: "e4", name: "Diego Flores", role: "Analista", orgUnit: "TI", weeklyCapacity: 36, secureReports: 0 },
    { id: "e5", name: "Sofía Ramírez", role: "Psicóloga Organizacional", orgUnit: "RH", weeklyCapacity: 35, secureReports: 3 },
  ],
  tasks: [
    { id: "t1", title: "Evaluar plan de mejora - Nanotecnología", pattern: "direct", assigneeId: "e1", orgUnit: "Académica", effortHours: 8, createdAt: "2025-08-01", deadline: "2025-08-22", status: "in_progress", priority: "high" },
    { id: "t2", title: "Revisión de cargas Académicas", pattern: "direct", assigneeId: "e2", orgUnit: "Académica", effortHours: 10, createdAt: "2025-08-02", deadline: "2025-08-28", status: "in_progress", priority: "medium" },
    { id: "t3", title: "Evaluación de clima laboral Q3", pattern: "deferred", assigneeId: null, orgUnit: "RH", effortHours: 6, createdAt: "2025-08-05", deadline: "2025-09-15", status: "backlog", priority: "high" },
    { id: "t4", title: "Soporte de plataforma de workflow", pattern: "offer", assigneeId: null, orgUnit: "TI", effortHours: 6, createdAt: "2025-08-05", deadline: "2025-08-25", status: "offered", priority: "low", offersAccepted: 0 },
    { id: "t5", title: "Automatizar reporte NOM-035", pattern: "direct", assigneeId: "e3", orgUnit: "TI", effortHours: 12, createdAt: "2025-08-06", deadline: "2025-08-21", status: "in_progress", priority: "high" },
    { id: "t6", title: "Backlog auditoría de accesos", pattern: "deferred", assigneeId: null, orgUnit: "TI", effortHours: 5, createdAt: "2025-08-10", deadline: "2025-09-01", status: "backlog", priority: "medium" },
    { id: "t7", title: "Oferta: mejora de documentación", pattern: "offer", assigneeId: null, orgUnit: "TI", effortHours: 4, createdAt: "2025-08-11", deadline: "2025-08-29", status: "offered", priority: "low", offersAccepted: 1 },
    { id: "t8", title: "Entrevistas de atención temprana", pattern: "direct", assigneeId: "e5", orgUnit: "RH", effortHours: 14, createdAt: "2025-08-03", deadline: "2025-08-26", status: "in_progress", priority: "high" },
    { id: "t9", title: "Evaluar asignación diferida (NT)", pattern: "deferred", assigneeId: null, orgUnit: "Académica", effortHours: 7, createdAt: "2025-08-12", deadline: "2025-09-05", status: "backlog", priority: "medium" },
    { id: "t10", title: "Capacitación canal seguro", pattern: "direct", assigneeId: "e2", orgUnit: "Académica", effortHours: 6, createdAt: "2025-08-08", deadline: "2025-08-24", status: "in_progress", priority: "medium" },
  ],
};

// Utilidades
const parseDate = (s: string) => new Date(s + "T00:00:00");
const daysUntil = (d: Date) => Math.ceil((d.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

function riskScoreForEmployee(emp: Employee, tasksForEmp: Task[]): number {
  // Factores de riesgo (ajustables):
  // 1) Utilización > 85% del tiempo semanal
  // 2) Tareas próximas a vencer (< 5 días)
  // 3) Prioridad alta
  // 4) Reportes en canal seguro (señal temprana)
  const capacity = emp.weeklyCapacity || 40;
  const assignedHours = tasksForEmp.reduce((sum, t) => sum + (t.effortHours || 0), 0);
  const utilization = assignedHours / capacity; // 0..n

  let score = 0;
  if (utilization > 1) score += 50; // sobreasignado
  else if (utilization > 0.85) score += 30; // alto
  else if (utilization > 0.6) score += 15; // medio

  const deadlinesNear = tasksForEmp.filter((t) => {
    if (!t.deadline) return false;
    const dd = parseDate(t.deadline);
    return daysUntil(dd) <= 5 && (t.status === "in_progress" || t.status === "backlog");
  }).length;
  score += deadlinesNear * 8;

  const highPriority = tasksForEmp.filter((t) => t.priority === "high").length;
  score += highPriority * 6;

  score += (emp.secureReports || 0) * 4; // señales del canal

  return Math.min(100, Math.round(score));
}

function riskChip(score: number) {
  let color: "error" | "warning" | "success" | "primary" | "secondary" | "info" | undefined = undefined;
  let label = "Bajo";
  if (score >= 70) {
    color = "error";
    label = "Alto";
  } else if (score >= 40) {
    color = "warning";
    label = "Medio";
  } else {
    color = "success";
    label = "Bajo";
  }
  return <Chip size="small" color={color} label={`${label} (${score})`} icon={<WarningAmberIcon />} />;
}

function kpiCard(title: string, value: number, icon: React.ReactNode): JSX.Element {
  return (
    <Card sx={{ height: "100%" }}>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="overline" color="text.secondary">
              {title}
            </Typography>
            <Typography variant="h5" fontWeight={700} mt={0.5}>
              {value}
            </Typography>
          </Box>
          <Box sx={{ opacity: 0.6 }}>{icon}</Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

function App() {
  const [raw, setRaw] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [orgFilter, setOrgFilter] = useState("all");
  const [patternFilter, setPatternFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [nameQuery, setNameQuery] = useState("");

  // Carga desde /nom035-data.json con fallback
  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/nom035-data.json", { cache: "no-store" });
      if (!res.ok) throw new Error("no json");
      const json = await res.json();
      setRaw(json);
    } catch (e) {
      setRaw(sampleData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const employees = raw?.employees || [];
  const tasks = raw?.tasks || [];

  const orgUnits: string[] = useMemo(
    () => ["all", ...Array.from(new Set(employees.map((e: Employee) => e.orgUnit))) as string[]],
    [employees]
  );

  const filteredTasks = useMemo(() => {
    return tasks.filter((t: Task) => {
      if (orgFilter !== "all" && t.orgUnit !== orgFilter) return false;
      if (patternFilter !== "all" && t.pattern !== patternFilter) return false;
      if (statusFilter !== "all" && t.status !== statusFilter) return false;
      return true;
    });
  }, [tasks, orgFilter, patternFilter, statusFilter]);

  const tasksByAssignee = useMemo(() => {
    const map = new Map();
    employees.forEach((e: Employee) => map.set(e.id, []));
    filteredTasks.forEach((t: Task) => {
      if (t.assigneeId && map.has(t.assigneeId)) {
        map.get(t.assigneeId).push(t);
      }
    });
    return map;
  }, [filteredTasks, employees]);

  const employeeRows = useMemo(() => {

    return employees
      .filter((e: Employee) => (orgFilter === "all" ? true : e.orgUnit === orgFilter))
      .filter((e: Employee) => (nameQuery ? e.name.toLowerCase().includes(nameQuery.toLowerCase()) : true))
      .map((e: Employee): EmployeeRow => {
        const tlist: Task[] = tasksByAssignee.get(e.id) || [];
        const assignedHours: number = tlist.reduce((s: number, t: Task) => s + (t.effortHours || 0), 0);
        const utilization: number = e.weeklyCapacity ? Math.round((assignedHours / e.weeklyCapacity) * 100) : 0;
        const score: number = riskScoreForEmployee(e, tlist);
        return {
          id: e.id,
          name: e.name,
          role: e.role,
          orgUnit: e.orgUnit,
          weeklyCapacity: e.weeklyCapacity,
          assignedTasks: tlist.length,
          assignedHours,
          utilization,
          risk: score,
          secureReports: e.secureReports || 0,
        };
      })
      .sort((a: EmployeeRow, b: EmployeeRow) => b.risk - a.risk);
  }, [employees, tasksByAssignee, orgFilter, nameQuery]);

  // KPIs
  const kpis = useMemo(() => {
    const total = filteredTasks.length;
    const unassigned = filteredTasks.filter((t: Task) => !t.assigneeId).length;
    const offered = filteredTasks.filter((t: Task) => t.pattern === "offer").length;
    const offeredUnclaimed = filteredTasks.filter((t: Task) => t.pattern === "offer" && !t.assigneeId).length;
    const deferred = filteredTasks.filter((t: Task) => t.pattern === "deferred").length;
    const direct = filteredTasks.filter((t: Task) => t.pattern === "direct").length;
    const overdue = filteredTasks.filter((t: Task) => t.deadline && daysUntil(parseDate(t.deadline)) < 0).length;

    return { total, unassigned, offered, offeredUnclaimed, deferred, direct, overdue };
  }, [filteredTasks]);

  // Datos para gráficas
  const workloadByEmployee = useMemo(() => {
    return employeeRows.map((r: EmployeeRow) => ({ name: r.name, Horas: r.assignedHours, Capacidad: r.weeklyCapacity }));
  }, [employeeRows]);

  const tasksByPattern = useMemo(() => {
    const g = { direct: 0, deferred: 0, offer: 0 };
    filteredTasks.forEach((t:Task) => (g[t.pattern] = (g[t.pattern] || 0) + 1));
    return [
      { name: "Asignación directa", value: g.direct || 0, key: "direct" },
      { name: "Asignación diferida", value: g.deferred || 0, key: "deferred" },
      { name: "Oferta de trabajo", value: g.offer || 0, key: "offer" },
    ];
  }, [filteredTasks]);

  const tasksByOrgUnit = useMemo(() => {
    const map = new Map();
    filteredTasks.forEach((t: Task) => {
      map.set(t.orgUnit, (map.get(t.orgUnit) || 0) + 1);
    });
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [filteredTasks]);

  const riskByOrgUnit = useMemo(() => {
    // Promedio de score por unidad
    const map = new Map();
    employeeRows.forEach((r: EmployeeRow) => {
      const curr = map.get(r.orgUnit) || { total: 0, count: 0 };
      curr.total += r.risk; curr.count += 1; map.set(r.orgUnit, curr);
    });
    return Array.from(map.entries()).map(([name, v]) => ({ name, Riesgo: Math.round(v.total / v.count) }));
  }, [employeeRows]);

  const deadlinesTrend = useMemo(() => {
    // Días restantes (negativos = vencidas) por semana
    const buckets = new Map();
    filteredTasks.forEach((t: Task) => {
      if (!t.deadline) return;
      const dd = parseDate(t.deadline);
      const key = `${dd.getFullYear()}-W${Math.ceil((dd.getDate() + ((dd.getDay() + 6) % 7)) / 7)}`;
      buckets.set(key, (buckets.get(key) || 0) + 1);
    });
    return Array.from(buckets.entries()).map(([name, value]) => ({ name, Tareas: value }));
  }, [filteredTasks]);

  const columns = [
    { field: "name", headerName: "Empleado", flex: 1, minWidth: 160 },
    { field: "role", headerName: "Puesto", flex: 1, minWidth: 140 },
    { field: "orgUnit", headerName: "Área", width: 140 },
    { field: "weeklyCapacity", headerName: "Capacidad (h/sem)", width: 150 },
    { field: "assignedTasks", headerName: "# Tareas", width: 110 },
    { field: "assignedHours", headerName: "Horas asignadas", width: 150 },
    {
      field: "utilization",
      headerName: "Utilización",
      width: 130,
      renderCell: (params: any) => (
        <Stack direction="row" spacing={1} alignItems="center" sx={{ width: "100%" }}>
          <LinearProgress variant="determinate" value={Math.min(100, params.value)} sx={{ flex: 1, height: 8, borderRadius: 5 }} />
          <Typography variant="caption" sx={{ width: 46, textAlign: "right" }}>{params.value}%</Typography>
        </Stack>
      ),
      sortComparator: (a: any, b: any) => a - b,
    },
    {
      field: "risk",
      headerName: "Riesgo psicosocial",
      width: 190,
      renderCell: (params: any) => riskChip(params.value),
      sortComparator: (a: any, b: any) => a - b,
    },
    { field: "secureReports", headerName: "Reportes canal seguro", width: 200 },
  ];

  const downloadSampleJson = () => {
    const blob = new Blob([JSON.stringify(sampleData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "nom035-data.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Stack direction="row" alignItems="center" spacing={1} mb={2}>
        <AnalyticsIcon />
        <Typography variant="h4" fontWeight={800}>Dashboard NOM-035</Typography>
        <Chip icon={<SecurityIcon />} label="Monitoreo – Atención temprana – Seguimiento – Control" />
        <Box sx={{ flex: 1 }} />
        <Tooltip title="Recargar datos">
          <Button startIcon={<RefreshIcon />} onClick={loadData}>Recargar</Button>
        </Tooltip>
        <Tooltip title="Descarga un JSON de ejemplo para colocarlo en /public/nom035-data.json">
          <Button startIcon={<DownloadIcon />} variant="contained" onClick={downloadSampleJson}>Descargar JSON de ejemplo</Button>
        </Tooltip>
      </Stack>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ xs: "stretch", md: "center" }}>
            <FormControl sx={{ minWidth: 220 }}>
              <InputLabel id="org">Área</InputLabel>
              <Select labelId="org" value={orgFilter} label="Área" onChange={(e) => setOrgFilter(e.target.value)}>
                {orgUnits.map((u) => (
                  <MenuItem key={u} value={u}>{u === "all" ? "Todas" : u}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 240 }}>
              <InputLabel id="pattern">Patrón de asignación</InputLabel>
              <Select labelId="pattern" value={patternFilter} label="Patrón de asignación" onChange={(e) => setPatternFilter(e.target.value)}>
                <MenuItem value="all">Todos</MenuItem>
                <MenuItem value="direct">Asignación directa</MenuItem>
                <MenuItem value="deferred">Asignación diferida</MenuItem>
                <MenuItem value="offer">Oferta de trabajo</MenuItem>
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 220 }}>
              <InputLabel id="status">Estado</InputLabel>
              <Select labelId="status" value={statusFilter} label="Estado" onChange={(e) => setStatusFilter(e.target.value)}>
                <MenuItem value="all">Todos</MenuItem>
                <MenuItem value="backlog">Backlog</MenuItem>
                <MenuItem value="offered">Ofrecido</MenuItem>
                <MenuItem value="in_progress">En progreso</MenuItem>
                <MenuItem value="done">Terminado</MenuItem>
              </Select>
            </FormControl>
            <TextField label="Buscar empleado" value={nameQuery} onChange={(e) => setNameQuery(e.target.value)} sx={{ minWidth: 240 }} />
            <Chip icon={<FilterAltIcon />} label={`${filteredTasks.length} tareas visibles`} />
          </Stack>
        </CardContent>
      </Card>

      {/* KPIs */}
      <Grid container spacing={2}>
        <Grid item xs={12} md={3}>{kpiCard("Tareas totales", kpis.total, <InsightsIcon fontSize="large" />)}</Grid>
        <Grid item xs={12} md={3}>{kpiCard("Sin asignar", kpis.unassigned, <WorkHistoryIcon fontSize="large" />)}</Grid>
        <Grid item xs={12} md={3}>{kpiCard("Ofertas sin tomar", kpis.offeredUnclaimed, <GroupsIcon fontSize="large" />)}</Grid>
        <Grid item xs={12} md={3}>{kpiCard("Vencidas", kpis.overdue, <WarningAmberIcon fontSize="large" />)}</Grid>
      </Grid>

      <Grid container spacing={2} sx={{ mt: 1 }}>
        <Grid item xs={12} md={6}>
          <Card sx={{ height: 360 }}>
            <CardHeader title="Carga de trabajo por empleado (horas)" subheader="Comparación vs capacidad semanal" />
            <CardContent sx={{ height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={workloadByEmployee}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" interval={0} angle={-15} textAnchor="end" height={60} />
                  <YAxis />
                  <RTooltip />
                  <Legend />
                  <Bar dataKey="Horas" />
                  <Bar dataKey="Capacidad" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={{ height: 360 }}>
            <CardHeader title="Distribución por patrón de asignación" subheader="Directa vs Diferida vs Oferta" />
            <CardContent sx={{ height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={tasksByPattern} dataKey="value" nameKey="name" label outerRadius={110} />
                  <RTooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ height: 360 }}>
            <CardHeader title="Tareas por área" subheader="Detección de posibles cuellos de botella por unidad" />
            <CardContent sx={{ height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={tasksByOrgUnit}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <RTooltip />
                  <Legend />
                  <Bar dataKey="value" name="# Tareas" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={{ height: 360 }}>
            <CardHeader title="Riesgo psicosocial promedio por área" subheader="Índice 0–100 (más alto = mayor atención)" />
            <CardContent sx={{ height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={riskByOrgUnit}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 100]} />
                  <RTooltip />
                  <Legend />
                  <Line type="monotone" dataKey="Riesgo" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardHeader title="Empleados – carga, utilización y riesgo" subheader="Usa el buscador y filtros para focalizar la atención temprana y redistribuir el trabajo" />
            <CardContent>
              <div style={{ width: "100%", height: 520 }}>
                <DataGrid
                  rows={employeeRows}
                  columns={columns}
                  disableRowSelectionOnClick
                  initialState={{
                    sorting: { sortModel: [{ field: "risk", sort: "desc" }] },
                    pagination: { paginationModel: { pageSize: 10 } },
                  }}
                  pageSizeOptions={[5, 10, 25]}
                />
              </div>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box mt={4}>
        <Typography variant="subtitle2" color="text.secondary">
          * Este tablero apoya NOM-035 al visibilizar: (a) sobrecarga y subcarga por persona, (b) tareas no asignadas y ofertas sin tomar (riesgo de retraso), (c) tareas cercanas a vencer y priorización, (d) señales del canal seguro para intervención temprana. Ajusta el cálculo de riesgo en riskScoreForEmployee() según tus políticas.
        </Typography>
      </Box>
    </Container>
  );
}

export default App;
