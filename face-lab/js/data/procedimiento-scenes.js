export const procedimientoScenes = [
  {
    file: "01_apertura_procedimiento.png",
    title: "Informe técnico & auditoría epistemológica",
    layout: "grid-s1",
    items: [
      { id: "s0-left", cardFile: "card-01-1.png", label: "Plano general π y recta paramétrica r", focusSteps: [0, 1, 2, 3, 4] },
      { id: "s0-right", cardFile: "card-01-2.png", label: "Condición de intersección y verificación r ∩ π = {I}", focusSteps: [5, 6] }
    ]
  },
  {
    file: "02_protocolo_procedimiento.png",
    title: "Un protocolo en cinco fases",
    layout: "grid-s2",
    items: [
      { id: "s1-p1", cardFile: "card-02-1.png", label: "Fase 1: Resolver con patrones formales", focusSteps: [0, 1] },
      { id: "s1-p2", cardFile: "card-02-2.png", label: "Fase 2: Contrastar con modelos IA", focusSteps: [2] },
      { id: "s1-p3", cardFile: "card-02-3.png", label: "Fase 3: Verificar consistencia", focusSteps: [3] },
      { id: "s1-p4", cardFile: "card-02-4.png", label: "Fase 4: Tensionar con prompts adversarios", focusSteps: [4] },
      { id: "s1-p5", cardFile: "card-02-5.png", label: "Fase 5: Reflexionar sobre el rol profesional", focusSteps: [5, 6] }
    ]
  },
  {
    file: "03_interseccion_procedimiento.png",
    title: "Intersección entre recta y plano",
    layout: "grid-s3",
    items: [
      { id: "s2-planteo", cardFile: "card-03-1.png", label: "Planteo paramétrico y plano cartesiano", focusSteps: [0, 1, 2] },
      { id: "s2-calculo", cardFile: "card-03-2.png", label: "Sustitución y despeje de λ = 10/3", focusSteps: [3, 4] },
      { id: "s2-punto", cardFile: "card-03-3.png", label: "Punto de intersección I y verificación doble", focusSteps: [5, 6, 7] }
    ]
  },
  {
    file: "04_angulo_procedimiento.png",
    title: "Ángulo entre recta y plano",
    layout: "grid-s4",
    items: [
      { id: "s3-vectores", cardFile: "card-04-1.png", label: "Vectores asociados d y n", focusSteps: [0, 1, 2] },
      { id: "s3-angulo-normal", cardFile: "card-04-2.png", label: "Ángulo con la normal β = 83,62°", focusSteps: [3, 4] },
      { id: "s3-deduccion", cardFile: "card-04-3.png", label: "Deducción ángulo recta-plano α = 6,38°", focusSteps: [5, 6] }
    ]
  },
  {
    file: "05_parametro_m_procedimiento.png",
    title: "El parámetro m no siempre existe",
    layout: "grid-s5",
    items: [
      { id: "s4-caso-a", cardFile: "card-05-1.png", label: "Caso 3.a: Recta paralela al plano (m = 2/3)", focusSteps: [0, 1, 2] },
      { id: "s4-caso-b", cardFile: "card-05-2.png", label: "Caso 3.b: Recta perpendicular al plano (Incompatible 6 ≠ -2)", focusSteps: [3, 4, 5, 6] }
    ]
  },
  {
    file: "06_planos_proyectantes_procedimiento.png",
    title: "Planos proyectantes",
    layout: "grid-s6",
    items: [
      { id: "s5-forma-simetrica", cardFile: "card-06-1.png", label: "Forma simétrica y punto base P(2, -1, 5)", className: "col-span-full", focusSteps: [0, 1] },
      { id: "s5-plano-xy", cardFile: "card-06-2.png", label: "Proyección plano coordenado πxy", focusSteps: [2] },
      { id: "s5-plano-xz", cardFile: "card-06-3.png", label: "Proyección plano coordenado πxz con control de signo +18", focusSteps: [3, 5, 6] },
      { id: "s5-plano-yz", cardFile: "card-06-4.png", label: "Proyección plano coordenado πyz", focusSteps: [4] }
    ]
  },
  {
    file: "07_auditoria_cruzada_procedimiento.png",
    title: "Auditoría cruzada de desempeño",
    layout: "grid-s7",
    items: [
      { id: "s6-matriz", cardFile: "card-07-1.png", label: "Matriz comparativa: Resolución patrón vs Grupo vs Modelos IA", focusSteps: [0, 1, 2, 3, 4, 5] }
    ]
  },
  {
    file: "08_pruebas_adversarias_procedimiento.png",
    title: "Cuatro pruebas para forzar el error",
    layout: "grid-s8",
    items: [
      { id: "s7-prueba-1", cardFile: "card-08-1.png", label: "Prueba 1: Incompatibilidad m", focusSteps: [0, 1] },
      { id: "s7-prueba-2", cardFile: "card-08-2.png", label: "Prueba 2: División por cero 0λ = 10", focusSteps: [2] },
      { id: "s7-prueba-3", cardFile: "card-08-3.png", label: "Prueba 3: Fórmula errónea de coseno", focusSteps: [3] },
      { id: "s7-prueba-4", cardFile: "card-08-4.png", label: "Prueba 4: Componente nula dy = 0", focusSteps: [4, 5] }
    ]
  },
  {
    file: "09_evidencia_fabricada_procedimiento.png",
    title: "Cuando la auditoría fabrica evidencia",
    layout: "grid-s9",
    items: [
      { id: "s8-hallazgo", cardFile: "card-09-1.png", label: "Hallazgo: Fabricación de citas y sycophancy en IA", focusSteps: [0, 1, 2, 3] },
      { id: "s8-regla", cardFile: "card-09-2.png", label: "Regla de oro: Trazabilidad contra la confianza del tono", focusSteps: [4, 5] }
    ]
  },
  {
    file: "10_conclusiones_procedimiento.png",
    title: "Tres conclusiones para el futuro ingeniero",
    layout: "grid-s10",
    items: [
      { id: "s9-control", cardFile: "card-10-1.png", label: "Conclusión 1: Control geométrico directo cartesiano", focusSteps: [0, 1] },
      { id: "s9-limites", cardFile: "card-10-2.png", label: "Conclusión 2: Reconocer los límites de la IA", focusSteps: [2] },
      { id: "s9-rol", cardFile: "card-10-3.png", label: "Conclusión 3: El rol analítico del futuro ingeniero", focusSteps: [3, 4, 5] }
    ]
  }
];
