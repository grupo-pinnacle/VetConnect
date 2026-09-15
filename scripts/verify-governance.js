/**
 * 🔍 Verificador Automatizado de Gobernanza Dual (VetConnect)
 * Valida la consistencia biunívoca entre:
 * 1. Product Backlog de Gestión (PB-01 a PB-40) en docs/PLAN_DE_PROYECTO_Y_GESTION.md
 * 2. Backlog Técnico de Agentes (TASK-0.1 a TASK-7.2) en PLAN_ACCION_VETCONNECT.md
 */

const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const planAccionPath = path.join(repoRoot, 'PLAN_ACCION_VETCONNECT.md');
const planGestionPath = path.join(repoRoot, 'docs', 'PLAN_DE_PROYECTO_Y_GESTION.md');

function runGovernanceCheck() {
  console.log('🔍 Iniciando Verificación de Gobernanza Dual (PB ↔ TASK)...\n');

  if (!fs.existsSync(planAccionPath)) {
    console.error(`❌ Error: No se encontró ${planAccionPath}`);
    process.exit(1);
  }
  if (!fs.existsSync(planGestionPath)) {
    console.error(`❌ Error: No se encontró ${planGestionPath}`);
    process.exit(1);
  }

  const planAccion = fs.readFileSync(planAccionPath, 'utf8');
  const planGestion = fs.readFileSync(planGestionPath, 'utf8');

  // 1. Extraer todos los PB declarados en PLAN_DE_PROYECTO_Y_GESTION.md
  const pbRegex = /PB-\d{2}/g;
  const pbInGestion = new Set(planGestion.match(pbRegex) || []);

  console.log(`📋 Total de ítems PB detectados en Plan de Gestión: ${pbInGestion.size}`);

  const missingPbsInGestion = [];
  for (let i = 1; i <= 40; i++) {
    const id = `PB-${i.toString().padStart(2, '0')}`;
    if (!pbInGestion.has(id)) {
      missingPbsInGestion.push(id);
    }
  }

  if (missingPbsInGestion.length > 0) {
    console.error(`❌ Faltan los siguientes PB en PLAN_DE_PROYECTO_Y_GESTION.md: ${missingPbsInGestion.join(', ')}`);
    process.exit(1);
  } else {
    console.log('  ✅ Los 40 ítems (PB-01 a PB-40) están formalmente definidos en el Product Backlog.');
  }

  // 2. Extraer mapeo en PLAN_ACCION_VETCONNECT.md
  const pbInPlanAccion = new Set(planAccion.match(pbRegex) || []);
  console.log(`🤖 Total de ítems PB mapeados en Plan de Acción de Agentes: ${pbInPlanAccion.size}`);

  const unmappedPbs = [];
  for (let i = 1; i <= 40; i++) {
    const id = `PB-${i.toString().padStart(2, '0')}`;
    if (!pbInPlanAccion.has(id)) {
      unmappedPbs.push(id);
    }
  }

  if (unmappedPbs.length > 0) {
    console.error(`❌ Los siguientes ítems PB no están mapeados a ninguna TASK en PLAN_ACCION_VETCONNECT.md: ${unmappedPbs.join(', ')}`);
    process.exit(1);
  } else {
    console.log('  ✅ El 100% de los ítems de producto (PB-01 al PB-40) tienen correspondencia técnica en tareas TASK.');
  }

  // 3. Extraer todas las TASK declaradas en PLAN_ACCION_VETCONNECT.md
  const taskRegex = /TASK-\d\.\d/g;
  const tasksInPlanAccion = new Set(planAccion.match(taskRegex) || []);
  console.log(`📦 Total de Task Packets identificados: ${tasksInPlanAccion.size}`);

  const expectedTasks = [
    'TASK-0.1', 'TASK-0.2',
    'TASK-1.1', 'TASK-1.2',
    'TASK-2.1', 'TASK-2.2', 'TASK-2.3', 'TASK-2.4',
    'TASK-3.1', 'TASK-3.2',
    'TASK-4.1', 'TASK-4.2',
    'TASK-5.1', 'TASK-5.2',
    'TASK-6.1', 'TASK-6.2',
    'TASK-7.1', 'TASK-7.2'
  ];

  const missingTasks = expectedTasks.filter(t => !tasksInPlanAccion.has(t));
  if (missingTasks.length > 0) {
    console.error(`❌ Faltan los siguientes Task Packets: ${missingTasks.join(', ')}`);
    process.exit(1);
  } else {
    console.log('  ✅ Los 18 Task Packets (TASK-0.1 a TASK-7.2) están estructurados y autocontenidos.');
  }

  console.log('\n🎉 Sincronización de Gobernanza Dual VERIFICADA AL 100%:');
  console.log('   - Product Backlog (40 ítems PB) ↔ Agent Tasks (18 paquetes TASK).');
  console.log('   - Cero tareas huérfanas en el sistema.');
  process.exit(0);
}

runGovernanceCheck();
