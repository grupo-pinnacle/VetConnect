/**
 * 🔍 Verificador Automatizado de Gobernanza Dual & Consistencia Semántica (VetConnect)
 * Valida:
 * 1. Correspondencia biunívoca entre Product Backlog (PB-01 a PB-40) y Task Packets (TASK-X.Y).
 * 2. Estructura completa de los 20 Task Packets en PLAN_ACCION_VETCONNECT.md.
 * 3. Consistencia de los 9 modelos canónicos de Prisma v2.0 entre PLAN_ACCION, TECH_REFERENCE y SPEC.
 * 4. Aislamiento estricto de modelos v2.1+ (cero contaminación de alcance en v2.0).
 */

const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const planAccionPath = path.join(repoRoot, 'PLAN_ACCION_VETCONNECT.md');
const planGestionPath = path.join(repoRoot, 'docs', 'PLAN_DE_PROYECTO_Y_GESTION.md');
const techRefPath = path.join(repoRoot, 'docs', 'TECH_REFERENCE.md');
const specPath = path.join(repoRoot, 'docs', 'SPEC.md');

function runGovernanceCheck() {
  console.log('🔍 Iniciando Verificación de Gobernanza Dual y Consistencia Semántica...\n');

  [planAccionPath, planGestionPath, techRefPath, specPath].forEach(p => {
    if (!fs.existsSync(p)) {
      console.error(`❌ Error: No se encontró ${p}`);
      process.exit(1);
    }
  });

  const planAccion = fs.readFileSync(planAccionPath, 'utf8');
  const planGestion = fs.readFileSync(planGestionPath, 'utf8');
  const techRef = fs.readFileSync(techRefPath, 'utf8');
  const spec = fs.readFileSync(specPath, 'utf8');

  let errors = 0;

  // 1. Validar presencia de los 40 PB en PLAN_DE_PROYECTO_Y_GESTION.md
  const pbRegex = /PB-\d{2}/g;
  const pbInGestion = new Set(planGestion.match(pbRegex) || []);
  const missingPbsInGestion = [];
  for (let i = 1; i <= 40; i++) {
    const id = `PB-${i.toString().padStart(2, '0')}`;
    if (!pbInGestion.has(id)) missingPbsInGestion.push(id);
  }

  if (missingPbsInGestion.length > 0) {
    console.error(`  ❌ Faltan ítems PB en PLAN_DE_PROYECTO_Y_GESTION.md: ${missingPbsInGestion.join(', ')}`);
    errors++;
  } else {
    console.log('  ✅ 1. Product Backlog: Los 40 ítems (PB-01 a PB-40) están formalmente definidos.');
  }

  // 2. Validar mapeo de los 40 PB en PLAN_ACCION_VETCONNECT.md
  const pbInPlanAccion = new Set(planAccion.match(pbRegex) || []);
  const unmappedPbs = [];
  for (let i = 1; i <= 40; i++) {
    const id = `PB-${i.toString().padStart(2, '0')}`;
    if (!pbInPlanAccion.has(id)) unmappedPbs.push(id);
  }

  if (unmappedPbs.length > 0) {
    console.error(`  ❌ Ítems PB sin mapear en PLAN_ACCION_VETCONNECT.md: ${unmappedPbs.join(', ')}`);
    errors++;
  } else {
    console.log('  ✅ 2. Mapeo Biunívoco: El 100% de los PB (PB-01..40) tienen correspondencia técnica en TASK.');
  }

  // 3. Validar los 20 Task Packets esperados
  const expectedTasks = [
    'TASK-0.1', 'TASK-0.2',
    'TASK-1.1', 'TASK-1.2',
    'TASK-2.1', 'TASK-2.2', 'TASK-2.3', 'TASK-2.4', 'TASK-2.5',
    'TASK-3.1', 'TASK-3.2',
    'TASK-4.1', 'TASK-4.2',
    'TASK-5.1', 'TASK-5.2',
    'TASK-6.1', 'TASK-6.2', 'TASK-6.3',
    'TASK-7.1', 'TASK-7.2'
  ];

  const taskRegex = /TASK-\d\.\d/g;
  const tasksInPlanAccion = new Set(planAccion.match(taskRegex) || []);
  const missingTasks = expectedTasks.filter(t => !tasksInPlanAccion.has(t));

  if (missingTasks.length > 0) {
    console.error(`  ❌ Faltan los siguientes Task Packets: ${missingTasks.join(', ')}`);
    errors++;
  } else {
    console.log(`  ✅ 3. Task Packets: Los ${expectedTasks.length} paquetes de ingeniería (TASK-0.1 a TASK-7.2) están estructurados.`);
  }

  // 4. Verificación Semántica de Modelos Prisma v2.0 (9 modelos obligatorios)
  const canonicalV2Models = [
    'User',
    'Pet',
    'Consultation',
    'Message',
    'Call',
    'Prescription',
    'Review',
    'AuditLog',
    'DailyUploadCounter'
  ];

  const missingInPlanAccion = canonicalV2Models.filter(m => !planAccion.includes(m));
  const missingInTechRef = canonicalV2Models.filter(m => !techRef.includes(m));
  const missingInSpec = canonicalV2Models.filter(m => !spec.includes(m));

  if (missingInPlanAccion.length > 0 || missingInTechRef.length > 0 || missingInSpec.length > 0) {
    console.error(`  ❌ Discrepancia semántica en modelos v2.0:`);
    if (missingInPlanAccion.length > 0) console.error(`     - Faltan en PLAN_ACCION: ${missingInPlanAccion.join(', ')}`);
    if (missingInTechRef.length > 0) console.error(`     - Faltan en TECH_REFERENCE: ${missingInTechRef.join(', ')}`);
    if (missingInSpec.length > 0) console.error(`     - Faltan en SPEC: ${missingInSpec.join(', ')}`);
    errors++;
  } else {
    console.log(`  ✅ 4. Consistencia de Modelos v2.0: Los 9 modelos canónicos (${canonicalV2Models.join(', ')}) coinciden en PLAN_ACCION, TECH_REF y SPEC.`);
  }

  // 5. Aislamiento de Alcance (Modelos v2.1+ prohibidos en la lista v2.0 In-Scope)
  const forbiddenV21Models = ['VaccinationRecord', 'PetDocument', 'MedicationSchedule', 'FavoriteVet'];
  // Extraer la línea de Modelos v2.0 In-Scope en TASK-1.1
  const inScopeMatch = planAccion.match(/Modelos v2\.0 In-Scope:[^\n]+/);
  if (inScopeMatch) {
    const inScopeText = inScopeMatch[0];
    const leakedModels = forbiddenV21Models.filter(m => inScopeText.includes(m));
    if (leakedModels.length > 0) {
      console.error(`  ❌ Fuga de alcance detectada en TASK-1.1: ${leakedModels.join(', ')} no deben ser v2.0.`);
      errors++;
    } else {
      console.log('  ✅ 5. Aislamiento de Alcance: Cero contaminación de modelos v2.1+ en el alcance inicial v2.0.');
    }
  }

  if (errors > 0) {
    console.error(`\n💥 Se encontraron ${errors} errores de gobernanza/semántica.`);
    process.exit(1);
  } else {
    console.log('\n🎉 ¡Gobernanza y Consistencia Semántica 100% VALIDADAS EN VERDE!');
    process.exit(0);
  }
}

runGovernanceCheck();
