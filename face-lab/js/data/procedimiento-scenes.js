export const procedimientoScenes = [
  {
    file: "01_apertura_procedimiento.png",
    title: "Informe técnico & auditoría epistemológica",
    layout: "grid-s1",
    items: [
      { id: "s0-left", cardFile: "card-01-1.png", label: "Plano general π y recta paramétrica r" },
      { id: "s0-right", cardFile: "card-01-2.png", label: "Condición de intersección y verificación r ∩ π = {I}" }
    ],
    sentenceHighlights: [
      { cardIndex: 1, top: "14%", left: "5%", width: "90%", height: "26%" }, // 0: Bienvenidos
      { cardIndex: 1, top: "14%", left: "5%", width: "90%", height: "26%" }, // 1: Criterio
      { cardIndex: 1, top: "14%", left: "5%", width: "90%", height: "26%" }, // 2: Criterio punto
      { cardIndex: 0, top: "14%", left: "5%", width: "90%", height: "42%" }, // 3: Plano pi y recta r
      { cardIndex: 0, top: "58%", left: "5%", width: "90%", height: "20%" }, // 4: Punto P0
      { cardIndex: 0, top: "75%", left: "5%", width: "90%", height: "20%" }, // 5: 2(-1) - ... != 0
      { cardIndex: 1, top: "44%", left: "5%", width: "90%", height: "52%" }  // 6: Pasos 1 a 5
    ]
  },
  {
    file: "02_protocolo_procedimiento.png",
    title: "Un protocolo en cinco fases",
    layout: "grid-s2",
    items: [
      { id: "s1-p1", cardFile: "card-02-1.png", label: "Fase 1: Resolver con patrones formales" },
      { id: "s1-p2", cardFile: "card-02-2.png", label: "Fase 2: Contrastar con modelos IA" },
      { id: "s1-p3", cardFile: "card-02-3.png", label: "Fase 3: Verificar consistencia" },
      { id: "s1-p4", cardFile: "card-02-4.png", label: "Fase 4: Tensionar con prompts adversarios" },
      { id: "s1-p5", cardFile: "card-02-5.png", label: "Fase 5: Reflexionar sobre el rol profesional" }
    ],
    sentenceHighlights: [
      { cardIndex: 0, top: "6%", left: "4%", width: "92%", height: "88%" }, // 0: Criterio / 5 fases
      { cardIndex: 0, top: "6%", left: "4%", width: "92%", height: "88%" }, // 1: Fase 1 Resolver
      { cardIndex: 1, top: "6%", left: "4%", width: "92%", height: "88%" }, // 2: Fase 2 Contrastar
      { cardIndex: 2, top: "6%", left: "4%", width: "92%", height: "88%" }, // 3: Fase 3 Verificar
      { cardIndex: 3, top: "6%", left: "4%", width: "92%", height: "88%" }, // 4: Fase 4 Tensionar
      { cardIndex: 4, top: "6%", left: "4%", width: "92%", height: "88%" }, // 5: Fase 5 Reflexionar
      { cardIndex: -1, top: "0%", left: "0%", width: "100%", height: "100%" } // 6: Todas las fases
    ]
  },
  {
    file: "03_interseccion_procedimiento.png",
    title: "Intersección entre recta y plano",
    layout: "grid-s3",
    items: [
      { id: "s2-planteo", cardFile: "card-03-1.png", label: "Planteo paramétrico y plano cartesiano" },
      { id: "s2-calculo", cardFile: "card-03-2.png", label: "Sustitución y despeje de λ = 10/3" },
      { id: "s2-punto", cardFile: "card-03-3.png", label: "Punto de intersección I y verificación doble" }
    ],
    sentenceHighlights: [
      { cardIndex: 0, top: "12%", left: "5%", width: "90%", height: "46%" }, // 0: Planteo algebraico
      { cardIndex: 0, top: "60%", left: "5%", width: "90%", height: "20%" }, // 1: Vectores director y normal
      { cardIndex: 0, top: "78%", left: "5%", width: "90%", height: "18%" }, // 2: d . n = 3 != 0
      { cardIndex: 1, top: "12%", left: "5%", width: "90%", height: "30%" }, // 3: Sustitución 2(-1+3λ)...
      { cardIndex: 1, top: "45%", left: "5%", width: "90%", height: "50%" }, // 4: 3λ - 10 = 0 -> λ = 10/3
      { cardIndex: 2, top: "12%", left: "5%", width: "90%", height: "48%" }, // 5: Punto I = (9, 16/3, -20/3)
      { cardIndex: 2, top: "62%", left: "5%", width: "90%", height: "32%" }  // 6: 2(9) - ... = 0 verificada
    ]
  },
  {
    file: "04_angulo_procedimiento.png",
    title: "Ángulo entre recta y plano",
    layout: "grid-s4",
    items: [
      { id: "s3-vectores", cardFile: "card-04-1.png", label: "Vectores asociados d y n" },
      { id: "s3-angulo-normal", cardFile: "card-04-2.png", label: "Ángulo con la normal β = 83,62°" },
      { id: "s3-deduccion", cardFile: "card-04-3.png", label: "Deducción ángulo recta-plano α = 6,38°" }
    ],
    sentenceHighlights: [
      { cardIndex: 0, top: "12%", left: "5%", width: "90%", height: "45%" }, // 0: Ángulo recta plano
      { cardIndex: 0, top: "12%", left: "5%", width: "90%", height: "45%" }, // 1: Vectores n y d
      { cardIndex: 0, top: "58%", left: "5%", width: "90%", height: "38%" }, // 2: Norma 3 y producto 1
      { cardIndex: 1, top: "12%", left: "5%", width: "90%", height: "45%" }, // 3: cos β = 1/9
      { cardIndex: 1, top: "58%", left: "5%", width: "90%", height: "38%" }, // 4: β ≈ 83,62° con la normal
      { cardIndex: 2, top: "12%", left: "5%", width: "90%", height: "45%" }, // 5: sin α = 1/9
      { cardIndex: 2, top: "58%", left: "5%", width: "90%", height: "38%" }  // 6: α ≈ 6,38°
    ]
  },
  {
    file: "05_parametro_m_procedimiento.png",
    title: "El parámetro m no siempre existe",
    layout: "grid-s5",
    items: [
      { id: "s4-caso-a", cardFile: "card-05-1.png", label: "Caso 3.a: Recta paralela al plano (m = 2/3)" },
      { id: "s4-caso-b", cardFile: "card-05-2.png", label: "Caso 3.b: Recta perpendicular al plano (Incompatible 6 ≠ -2)" }
    ],
    sentenceHighlights: [
      { cardIndex: -1, top: "0%", left: "0%", width: "100%", height: "100%" }, // 0: Dos casos
      { cardIndex: 0, top: "12%", left: "5%", width: "90%", height: "40%" },  // 1: Paralela -> d . n = 0
      { cardIndex: 0, top: "45%", left: "5%", width: "90%", height: "50%" },  // 2: 3m + 6 - 8 = 0 -> m = 2/3
      { cardIndex: 1, top: "12%", left: "5%", width: "90%", height: "30%" },  // 3: Perpendicular -> d = k . n
      { cardIndex: 1, top: "42%", left: "5%", width: "90%", height: "26%" },  // 4: 6 = 1k -> 4 = -12 contradicción
      { cardIndex: 1, top: "68%", left: "5%", width: "90%", height: "28%" }   // 5: 6 != -2 -> Incompatible no existe m
    ]
  },
  {
    file: "06_planos_proyectantes_procedimiento.png",
    title: "Planos proyectantes",
    layout: "grid-s6",
    items: [
      { id: "s5-forma-simetrica", cardFile: "card-06-1.png", label: "Forma simétrica y punto base P(2, -1, 5)", className: "col-span-full" },
      { id: "s5-plano-xy", cardFile: "card-06-2.png", label: "Proyección plano coordenado πxy" },
      { id: "s5-plano-xz", cardFile: "card-06-3.png", label: "Proyección plano coordenado πxz con control de signo +18" },
      { id: "s5-plano-yz", cardFile: "card-06-4.png", label: "Proyección plano coordenado πyz" }
    ],
    sentenceHighlights: [
      { cardIndex: 0, top: "8%", left: "4%", width: "92%", height: "84%" },  // 0: Planos proyectantes
      { cardIndex: 0, top: "8%", left: "4%", width: "92%", height: "84%" },  // 1: P(2, -1, 5) y d(4, -3, 1)
      { cardIndex: 1, top: "8%", left: "4%", width: "92%", height: "84%" },  // 2: Plano xy: 3x + 4y - 2 = 0
      { cardIndex: 2, top: "8%", left: "4%", width: "92%", height: "84%" },  // 3: Plano xz: x - 4z + 18 = 0
      { cardIndex: 3, top: "8%", left: "4%", width: "92%", height: "84%" },  // 4: Plano yz: y + 3z - 14 = 0
      { cardIndex: 2, top: "52%", left: "4%", width: "92%", height: "42%" }  // 5: Verificación +18: 2 - 20 + 18 = 0
    ]
  },
  {
    file: "07_auditoria_cruzada_procedimiento.png",
    title: "Auditoría cruzada de desempeño",
    layout: "grid-s7",
    items: [
      { id: "s6-matriz", cardFile: "card-07-1.png", label: "Matriz comparativa: Resolución patrón vs Grupo vs Modelos IA" }
    ],
    sentenceHighlights: [
      { cardIndex: 0, top: "6%", left: "4%", width: "92%", height: "88%" },  // 0: Comparación general
      { cardIndex: 0, top: "20%", left: "4%", width: "92%", height: "18%" }, // 1: Fila 1 Intersección
      { cardIndex: 0, top: "38%", left: "4%", width: "92%", height: "18%" }, // 2: Fila 2 Ángulo
      { cardIndex: 0, top: "56%", left: "4%", width: "92%", height: "18%" }, // 3: Fila 3 Parámetro
      { cardIndex: 0, top: "74%", left: "4%", width: "92%", height: "18%" }, // 4: Fila 4 Proyectantes
      { cardIndex: 0, top: "6%", left: "4%", width: "92%", height: "88%" }   // 5: Conclusión de matriz
    ]
  },
  {
    file: "08_pruebas_adversarias_procedimiento.png",
    title: "Cuatro pruebas para forzar el error",
    layout: "grid-s8",
    items: [
      { id: "s7-prueba-1", cardFile: "card-08-1.png", label: "Prueba 1: Incompatibilidad m" },
      { id: "s7-prueba-2", cardFile: "card-08-2.png", label: "Prueba 2: División por cero 0λ = 10" },
      { id: "s7-prueba-3", cardFile: "card-08-3.png", label: "Prueba 3: Fórmula errónea de coseno" },
      { id: "s7-prueba-4", cardFile: "card-08-4.png", label: "Prueba 4: Componente nula dy = 0" }
    ],
    sentenceHighlights: [
      { cardIndex: -1, top: "0%", left: "0%", width: "100%", height: "100%" }, // 0: 4 pruebas
      { cardIndex: 0, top: "6%", left: "4%", width: "92%", height: "88%" },   // 1: Prueba 1 Incompatibilidad
      { cardIndex: 1, top: "6%", left: "4%", width: "92%", height: "88%" },   // 2: Prueba 2 División por cero
      { cardIndex: 2, top: "6%", left: "4%", width: "92%", height: "88%" },   // 3: Prueba 3 Fórmula errónea
      { cardIndex: 3, top: "6%", left: "4%", width: "92%", height: "88%" },   // 4: Prueba 4 Componente nula
      { cardIndex: -1, top: "0%", left: "0%", width: "100%", height: "100%" }  // 5: Todas las pruebas
    ]
  },
  {
    file: "09_evidencia_fabricada_procedimiento.png",
    title: "Cuando la auditoría fabrica evidencia",
    layout: "grid-s9",
    items: [
      { id: "s8-hallazgo", cardFile: "card-09-1.png", label: "Hallazgo: Fabricación de citas y sycophancy en IA" },
      { id: "s8-regla", cardFile: "card-09-2.png", label: "Regla de oro: Trazabilidad contra la confianza del tono" }
    ],
    sentenceHighlights: [
      { cardIndex: 0, top: "6%", left: "4%", width: "92%", height: "88%" },  // 0: Fabricación
      { cardIndex: 0, top: "6%", left: "4%", width: "92%", height: "88%" },  // 1: Citas inventadas
      { cardIndex: 0, top: "50%", left: "4%", width: "92%", height: "45%" }, // 2: Sycophancy
      { cardIndex: 1, top: "6%", left: "4%", width: "92%", height: "45%" },  // 3: Trazabilidad
      { cardIndex: 1, top: "50%", left: "4%", width: "92%", height: "45%" }, // 4: Regla de auditoría
      { cardIndex: 1, top: "6%", left: "4%", width: "92%", height: "88%" }   // 5: Cierre lámina 9
    ]
  },
  {
    file: "10_conclusiones_procedimiento.png",
    title: "Tres conclusiones para el futuro ingeniero",
    layout: "grid-s10",
    items: [
      { id: "s9-control", cardFile: "card-10-1.png", label: "Conclusión 1: Control geométrico directo cartesiano" },
      { id: "s9-limites", cardFile: "card-10-2.png", label: "Conclusión 2: Reconocer los límites de la IA" },
      { id: "s9-rol", cardFile: "card-10-3.png", label: "Conclusión 3: El rol analítico del futuro ingeniero" }
    ],
    sentenceHighlights: [
      { cardIndex: -1, top: "0%", left: "0%", width: "100%", height: "100%" }, // 0: 3 conclusiones
      { cardIndex: 0, top: "6%", left: "4%", width: "92%", height: "88%" },   // 1: Control geométrico directo
      { cardIndex: 1, top: "6%", left: "4%", width: "92%", height: "88%" },   // 2: Reconocer límites IA
      { cardIndex: 2, top: "6%", left: "4%", width: "92%", height: "88%" },   // 3: Rol analítico
      { cardIndex: 2, top: "45%", left: "4%", width: "92%", height: "50%" },  // 4: Entender y verificar
      { cardIndex: -1, top: "0%", left: "0%", width: "100%", height: "100%" }  // 5: Cierre final
    ]
  }
];
