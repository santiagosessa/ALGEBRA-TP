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
      { cardIndex: 1, top: "8%", left: "4%", width: "92%", height: "30%" }, // 0: Bienvenidos
      { cardIndex: 1, top: "8%", left: "4%", width: "92%", height: "30%" }, // 1: Criterio general
      { cardIndex: 1, top: "8%", left: "4%", width: "92%", height: "30%" }, // 2: Criterio r ∩ π = {I}
      { cardIndex: 0, top: "10%", left: "4%", width: "92%", height: "54%" }, // 3: Plano π y recta paramétrica
      { cardIndex: 0, top: "68%", left: "4%", width: "92%", height: "13%" }, // 4: Punto de paso base P0
      { cardIndex: 0, top: "80%", left: "4%", width: "92%", height: "15%" }, // 5: Comprobación 2(-1) - ... != 0
      { cardIndex: 1, top: "41%", left: "3%", width: "94%", height: "54%" }  // 6: Pasos 1 a 5 de resolución
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
      { cardIndex: -1, top: "0%", left: "0%", width: "100%", height: "100%" }, // 0: Criterio / 5 fases
      { cardIndex: 0, top: "4%", left: "4%", width: "92%", height: "92%" },   // 1: Fase 1 Resolver
      { cardIndex: 1, top: "4%", left: "4%", width: "92%", height: "92%" },   // 2: Fase 2 Contrastar
      { cardIndex: 2, top: "4%", left: "4%", width: "92%", height: "92%" },   // 3: Fase 3 Verificar
      { cardIndex: 3, top: "4%", left: "4%", width: "92%", height: "92%" },   // 4: Fase 4 Tensionar
      { cardIndex: 4, top: "4%", left: "4%", width: "92%", height: "92%" },   // 5: Fase 5 Reflexionar
      { cardIndex: -1, top: "0%", left: "0%", width: "100%", height: "100%" }  // 6: Todas las fases conectadas
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
      { cardIndex: 0, top: "10%", left: "4%", width: "92%", height: "48%" }, // 0: Planteo algebraico
      { cardIndex: 0, top: "60%", left: "4%", width: "92%", height: "19%" }, // 1: Vectores director d y normal n
      { cardIndex: 0, top: "78%", left: "4%", width: "92%", height: "16%" }, // 2: d · n = 3 != 0 (Secantes)
      { cardIndex: 1, top: "10%", left: "4%", width: "92%", height: "24%" }, // 3: Sustitución en π
      { cardIndex: 1, top: "45%", left: "4%", width: "92%", height: "50%" }, // 4: 3λ - 10 = 0 -> λ = 10/3
      { cardIndex: 2, top: "10%", left: "4%", width: "92%", height: "52%" }, // 5: Coordenadas I = (9, 16/3, -20/3)
      { cardIndex: 2, top: "66%", left: "4%", width: "92%", height: "28%" }, // 6: 2(9) - ... = 0 en el plano
      { cardIndex: 2, top: "40%", left: "4%", width: "92%", height: "54%" }  // 7: Verificación completa
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
      { cardIndex: 0, top: "10%", left: "4%", width: "92%", height: "52%" }, // 0: Ángulo recta-plano
      { cardIndex: 0, top: "10%", left: "4%", width: "92%", height: "54%" }, // 1: Vectores director y normal
      { cardIndex: 0, top: "48%", left: "4%", width: "92%", height: "44%" }, // 2: Normas 3 y producto escalar 1
      { cardIndex: 1, top: "12%", left: "4%", width: "92%", height: "30%" }, // 3: cos β = 1/9
      { cardIndex: 1, top: "40%", left: "4%", width: "92%", height: "54%" }, // 4: β ≈ 83,62° respecto a la normal
      { cardIndex: 2, top: "12%", left: "4%", width: "92%", height: "30%" }, // 5: sin α = 1/9 por complementariedad
      { cardIndex: 2, top: "66%", left: "4%", width: "92%", height: "26%" }  // 6: α ≈ 6,38° ángulo final
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
      { cardIndex: -1, top: "0%", left: "0%", width: "100%", height: "100%" }, // 0: Dos casos geométricos
      { cardIndex: 0, top: "12%", left: "4%", width: "92%", height: "35%" },  // 1: Paralela -> d ⟂ n
      { cardIndex: 0, top: "42%", left: "4%", width: "92%", height: "50%" },  // 2: 3m + 6 - 8 = 0 -> m = 2/3
      { cardIndex: 1, top: "12%", left: "4%", width: "92%", height: "26%" },  // 3: Perpendicular -> d || n
      { cardIndex: 1, top: "34%", left: "4%", width: "92%", height: "30%" },  // 4: 6 = 1k -> k=6, 4 = -12 contradicción
      { cardIndex: 1, top: "64%", left: "4%", width: "92%", height: "28%" },  // 5: 6 != -2 -> Incompatible
      { cardIndex: 1, top: "64%", left: "4%", width: "92%", height: "28%" }   // 6: No fuerzo solución donde no la hay
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
      { cardIndex: 0, top: "6%", left: "2%", width: "96%", height: "88%" },  // 0: Planos proyectantes
      { cardIndex: 0, top: "6%", left: "2%", width: "96%", height: "88%" },  // 1: P(2, -1, 5) y d(4, -3, 1)
      { cardIndex: 1, top: "6%", left: "4%", width: "92%", height: "88%" },  // 2: Plano πxy: 3x + 4y - 2 = 0
      { cardIndex: 2, top: "6%", left: "4%", width: "92%", height: "88%" },  // 3: Plano πxz: x - 4z + 18 = 0
      { cardIndex: 3, top: "6%", left: "4%", width: "92%", height: "88%" },  // 4: Plano πyz: y + 3z - 14 = 0
      { cardIndex: 2, top: "58%", left: "4%", width: "92%", height: "36%" },  // 5: Verificación +18: 2 - 20 + 18 = 0
      { cardIndex: 2, top: "58%", left: "4%", width: "92%", height: "36%" }   // 6: Filtro de signo
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
      { cardIndex: 0, top: "4%", left: "2%", width: "96%", height: "92%" },  // 0: Matriz completa
      { cardIndex: 0, top: "23%", left: "2%", width: "96%", height: "18%" }, // 1: Fila 1 Intersección
      { cardIndex: 0, top: "41%", left: "2%", width: "96%", height: "18%" }, // 2: Fila 2 Ángulo
      { cardIndex: 0, top: "59%", left: "2%", width: "96%", height: "18%" }, // 3: Fila 3 Parámetro m
      { cardIndex: 0, top: "77%", left: "2%", width: "96%", height: "18%" }, // 4: Fila 4 Planos Proyectantes
      { cardIndex: 0, top: "4%", left: "2%", width: "96%", height: "92%" }   // 5: Conclusión y justificación
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
      { cardIndex: -1, top: "0%", left: "0%", width: "100%", height: "100%" }, // 0: Cuatro pruebas adversarias
      { cardIndex: 0, top: "4%", left: "4%", width: "92%", height: "92%" },   // 1: Prueba 1 Incompatibilidad
      { cardIndex: 1, top: "4%", left: "4%", width: "92%", height: "92%" },   // 2: Prueba 2 División por cero
      { cardIndex: 2, top: "4%", left: "4%", width: "92%", height: "92%" },   // 3: Prueba 3 Fórmula errónea
      { cardIndex: 3, top: "4%", left: "4%", width: "92%", height: "92%" },   // 4: Prueba 4 Componente nula
      { cardIndex: -1, top: "0%", left: "0%", width: "100%", height: "100%" }  // 5: Sostener la matemática
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
      { cardIndex: 0, top: "6%", left: "4%", width: "92%", height: "42%" },  // 0: Fabricación
      { cardIndex: 0, top: "6%", left: "4%", width: "92%", height: "42%" },  // 1: Citas y errores inventados
      { cardIndex: 0, top: "50%", left: "4%", width: "92%", height: "44%" }, // 2: Mecanismo de Sycophancy
      { cardIndex: 1, top: "8%", left: "4%", width: "92%", height: "30%" },  // 3: Regla de oro
      { cardIndex: 1, top: "42%", left: "4%", width: "92%", height: "52%" }, // 4: Protocolo de control
      { cardIndex: 1, top: "8%", left: "4%", width: "92%", height: "86%" }   // 5: Trazabilidad de fuentes
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
      { cardIndex: -1, top: "0%", left: "0%", width: "100%", height: "100%" }, // 0: Tres conclusiones
      { cardIndex: 0, top: "4%", left: "4%", width: "92%", height: "92%" },   // 1: Control geométrico directo
      { cardIndex: 1, top: "4%", left: "4%", width: "92%", height: "92%" },   // 2: Reconocer límites IA
      { cardIndex: 2, top: "4%", left: "4%", width: "92%", height: "92%" },   // 3: Rol del futuro ingeniero
      { cardIndex: 2, top: "4%", left: "4%", width: "92%", height: "92%" },   // 4: Entender y verificar
      { cardIndex: -1, top: "0%", left: "0%", width: "100%", height: "100%" }  // 5: Cierre final
    ]
  }
];
