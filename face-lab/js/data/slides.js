export const slides = [
  {
    index: "01",
    phase: "Apertura",
    title: "Informe técnico & auditoría epistemológica",
    subtitle: "Trabajo Práctico N° 3 · Recta y plano en R³",
    deck: "Errores humanos, desempeño de LLMs y una defensa oral con criterio matemático.",
    script: "Bienvenidos. Voy a empezar fijando el criterio que guía todo el trabajo. La recta y el plano pueden cortarse en un punto, pero ese punto solo es válido si pertenece a las dos representaciones. Por eso, en la lámina parto del plano dos equis menos ye más zeta menos seis igual a cero y de la recta paramétrica. También marco el punto base P cero, que pertenece a la recta cuando lambda vale cero, pero no pertenece al plano. Ese ejemplo muestra por qué no alcanza con llegar a un resultado: hay que comprobarlo en ambos lugares. Con esa idea voy a resolver los ejercicios y después voy a auditar las respuestas.",
    html: `<div class="quote-card"><p>r ∩ π = I</p><span>El punto verificable como unidad de verdad</span></div><div class="result-strip"><strong>Aprobación con Distinción</strong><span>Álgebra y Geometría Analítica · Agosto 2026</span></div>`
  },
  {
    index: "02",
    phase: "Fase 0",
    title: "Un protocolo en cinco fases",
    subtitle: "Resumen ejecutivo",
    deck: "La investigación combina cálculo, contraste y juicio crítico: resolver, contrastar, verificar, tensionar y reflexionar.",
    script: "Con ese criterio como punto de partida, organizo la auditoría en cinco fases. Primero resuelvo con patrones formales y cálculo matemático riguroso. Después confronto mi resolución con la del grupo y con los modelos de inteligencia artificial. En la tercera fase verifico los puntos y los signos, sustituyendo en las ecuaciones para controlar la pertenencia. Luego tensiono las respuestas con consignas que contienen premisas falsas, para ver si el razonamiento se sostiene. Y finalmente reflexiono sobre qué significa todo esto para el trabajo de un futuro ingeniero. Las flechas de la lámina muestran que cada fase depende de la anterior.",
    html: `<div class="content-grid three"><article class="data-card navy"><h3>01 · Resolver</h3><p>Patrones matemáticos y planteos formales.</p></article><article class="data-card"><h3>02 · Contrastar</h3><p>Grupo de estudiantes frente a modelos.</p></article><article class="data-card orange"><h3>03 · Verificar</h3><p>Puntos, signos y consistencia geométrica.</p></article><article class="data-card yellow"><h3>04 · Tensionar</h3><p>Prompts adversarios para forzar el error.</p></article><article class="data-card red"><h3>05 · Reflexionar</h3><p>Qué aprende el futuro ingeniero.</p></article></div><div class="result-strip"><strong>Hallazgo</strong><span>La verificación humana sigue siendo el filtro decisivo.</span></div>`
  },
  {
    index: "03",
    phase: "Fase 1",
    title: "Intersección entre recta y plano",
    subtitle: "Del planteo paramétrico al punto verificable",
    deck: "Sustituimos la recta en el plano, despejamos λ y devolvemos el punto a ambas representaciones.",
    script: "Ahora aplico el primer procedimiento completo. Primero observo que el vector director de la recta es tres, uno, menos dos y que el normal del plano es dos, menos uno, uno. Su producto escalar da tres, distinto de cero, así que la recta corta al plano. Después sustituyo las tres coordenadas paramétricas en la ecuación del plano. Al distribuir y agrupar, queda tres lambda menos diez igual a cero, de donde lambda vale diez tercios. Con ese parámetro calculo las coordenadas y obtengo el punto nueve, dieciséis tercios, menos veinte tercios. Finalmente lo reemplazo en el plano: dieciocho menos doce menos seis da cero. Ahí queda verificada la intersección.",
    html: `<div class="content-grid"><article class="data-card navy"><h3>Planteo</h3><p>π: 2x − y + z − 6 = 0<br />r: x = −1 + 3λ · y = 2 + λ · z = −2λ</p><div class="equation">3λ − 10 = 0<small>λ = 10/3</small></div></article><article class="data-card orange"><h3>Resultado</h3><div class="equation">I = (9, 16/3, −20/3)</div><p>Las tres coordenadas devuelven el mismo parámetro.</p></article></div><div class="result-strip"><strong>✓ Verificado</strong><span>2(9) − 16/3 − 20/3 − 6 = 0</span></div>`
  },
  {
    index: "04",
    phase: "Fase 1",
    title: "Ángulo entre recta y plano",
    subtitle: "La clave es distinguir normal y plano",
    deck: "El producto escalar mide el ángulo con la normal. El ángulo real con el plano es su complementario.",
    script: "Con la intersección resuelta, paso al ángulo entre una recta y un plano. En esta lámina uso el vector director uno, dos, dos y la normal uno, menos dos, dos. Ambos tienen norma tres y su producto escalar vale uno. Entonces el coseno del ángulo beta, que es el ángulo con la normal, vale un noveno. Esto es importante: beta no es todavía el ángulo de la recta con el plano; mide la inclinación respecto de la normal y vale aproximadamente ochenta y tres coma sesenta y dos grados. Como alfa y beta son complementarios, el seno de alfa también es un noveno. Por eso el ángulo que busco es aproximadamente seis coma treinta y ocho grados.",
    html: `<div class="content-grid"><article class="data-card"><h3>Vectores</h3><div class="equation">n = (1, −2, 2)<br />d = (1, 2, 2)</div><p>La normal y la dirección no deben confundirse.</p></article><article class="data-card orange"><h3>Deducción</h3><div class="equation">sin α = |n · d| / (‖n‖‖d‖) = 1/9</div><p>α = 6° 22′ 46″</p></article></div><div class="result-strip"><strong>6,38°</strong><span>Ángulo recta–plano</span></div>`
  },
  {
    index: "05",
    phase: "Fase 1",
    title: "El parámetro m no siempre existe",
    subtitle: "Dos condiciones, dos conclusiones",
    deck: "El paralelismo exige proporcionalidad completa. Una sola razón incompatible alcanza para vaciar el conjunto solución.",
    script: "El tercer ejercicio tiene dos casos y conviene leerlos geométricamente. En el primero busco una recta paralela al plano, así que su director tiene que ser perpendicular a la normal. Con el producto escalar obtengo tres m más seis menos ocho igual a cero, y por lo tanto m vale dos tercios. En el segundo caso busco una recta perpendicular al plano, de modo que el director debe ser paralelo a la normal. Si escribo el sistema con una constante k, la segunda componente obliga a k igual a seis, pero la tercera exigiría que cuatro fuera igual a menos doce. Como aparece una contradicción, el sistema es incompatible y no existe ningún valor real de m. No fuerzo una solución donde no la hay.",
    html: `<div class="content-grid"><article class="data-card"><h3>Caso A · d ⟂ n</h3><div class="equation">3m + 6 − 8 = 0<small>m = 2/3 · solución única</small></div></article><article class="data-card red"><h3>Caso B · d ∥ n</h3><div class="equation">m/3 = 6/1 = 4/(−2)</div><p><strong>6 ≠ −2</strong> · ∄ m ∈ ℝ</p></article></div><div class="result-strip"><strong>∄ m</strong><span>El sistema es incompatible</span></div>`
  },
  {
    index: "06",
    phase: "Fases 1 + 3",
    title: "Planos proyectantes",
    subtitle: "Verificar antes de cerrar la ecuación",
    deck: "Tres planos cartesianos. Un único error de signo detectado a tiempo mediante la sustitución del punto base.",
    script: "Después de analizar el parámetro, paso a las proyecciones de la recta sobre los planos coordenados. Parto de su forma simétrica, con el punto dos, menos uno, cinco y el director cuatro, menos tres, uno. Para el plano xy igualo las componentes x e y y obtengo tres x más cuatro y menos dos igual a cero. Para el plano xz igualo x con z; ahí aparece el signo que tengo que cuidar: x menos cuatro z más dieciocho igual a cero. Finalmente, la proyección sobre yz da y más tres z menos catorce igual a cero. El más dieciocho se confirma sustituyendo el punto: dos menos veinte más dieciocho da cero. La verificación evita cerrar una ecuación con un signo incorrecto.",
    html: `<div class="content-grid three"><article class="data-card"><h3>Plano xy</h3><div class="equation">3x + 4y − 2 = 0</div><p>Paralelo a Z.</p></article><article class="data-card orange"><h3>Plano xz</h3><div class="equation">x − 4z + 18 = 0</div><p>Corregido: −18 → +18.</p></article><article class="data-card"><h3>Plano yz</h3><div class="equation">y + 3z − 14 = 0</div><p>Paralelo a X.</p></article></div><div class="result-strip"><strong>P(2, −1, 5)</strong><span>El filtro es sustituir antes de aceptar.</span></div>`
  },
  {
    index: "07",
    phase: "Fases 2 + 3",
    title: "Auditoría cruzada de desempeño",
    subtitle: "Resultado, proceso y capacidad de verificación",
    deck: "Una matriz de comparación hace visible la diferencia entre acertar y poder justificar el acierto.",
    script: "Una vez revisados los cuatro ejercicios, comparo no solo la respuesta final, sino también el procedimiento. En la intersección, la resolución de referencia da lambda igual a diez tercios; el grupo se desvía en la segunda cuenta, mientras que el modelo calcula con precisión, aunque sin verificar. En el ángulo, el grupo plantea bien pero confunde el ángulo beta con el del plano, y el modelo usa directamente el coseno. En el parámetro, el grupo conserva el rigor y detecta la contradicción cuatro igual a menos doce; el modelo intenta complacer y fuerza un valor de m. Finalmente, en las proyecciones, el grupo deja la forma simétrica sin pasar a la cartesiana y el modelo omite o cambia signos. La tabla muestra por qué acertar no alcanza: también hay que poder justificar.",
    html: `<div class="table-wrap"><table class="compare-table"><thead><tr><th>Ejercicio</th><th>Resolución patrón</th><th>Grupo</th><th>Modelos IA</th></tr></thead><tbody><tr><td>1. Intersección</td><td>I = (9, 16/3, −20/3)</td><td><span class="status good">Correcto</span></td><td><span class="status good">Preciso</span></td></tr><tr><td>2. Ángulo</td><td>sin α = 1/9</td><td><span class="status good">Correcto</span></td><td><span class="status partial">Parcial</span></td></tr><tr><td>3. Parámetro</td><td>m = 2/3 · ∄ m</td><td><span class="status good">Correcto</span></td><td><span class="status warn">Sesgo</span></td></tr><tr><td>4. Proyectantes</td><td>3 planos cartesianos</td><td><span class="status warn">Signo</span></td><td><span class="status good">Preciso</span></td></tr></tbody></table></div>`
  },
  {
    index: "08",
    phase: "Fase 4",
    title: "Cuatro pruebas para forzar el error",
    subtitle: "Prompts adversarios",
    deck: "La resistencia aparece cuando el modelo no obedece una premisa matemática falsa.",
    script: "La comparación todavía no alcanza, así que someto las respuestas a cuatro pruebas adversarias. Primero pido hallar m para que la recta sea paralela al plano, aunque el sistema sea incompatible: la respuesta correcta es que no existe m. Después fuerzo el despeje de lambda en cero lambda menos diez igual a cero; ahí no se puede dividir por cero, porque la ecuación no tiene solución real. La tercera prueba pide usar coseno para el ángulo recta-plano, cuando en realidad hay que tomar el complementario y usar seno. Y la cuarta plantea una forma simétrica con una componente directora nula: en ese caso separo la ecuación y igual a y cero, en lugar de escribir una división por cero. La prueba consiste en sostener la matemática aunque la consigna empuje al error.",
    html: `<div class="content-grid"><article class="data-card red"><h3>01 · Incompatibilidad</h3><p>Forzar un valor de m cuando 6 ≠ −2.</p></article><article class="data-card orange"><h3>02 · División por cero</h3><p>Insistir con 0λ = 10 y observar si declara conjunto vacío.</p></article><article class="data-card yellow"><h3>03 · Fórmula errónea</h3><p>Confundir coseno con el ángulo real del plano.</p></article><article class="data-card"><h3>04 · Componente nula</h3><p>Dividir por dᵧ = 0 en vez de aislar y = −1.</p></article></div>`
  },
  {
    index: "09",
    phase: "Fase 4",
    title: "Cuando la auditoría fabrica evidencia",
    subtitle: "Fenómeno crítico de IA",
    deck: "Una respuesta segura puede seguir siendo falsa si no contrasta el material fuente.",
    script: "Estas pruebas me llevan a un problema más serio que un simple error de cálculo. En una de las respuestas, la IA atribuye a otras herramientas desarrollos, divisiones por cero y errores algebraicos que nunca habían producido. El mecanismo es claro: intenta confirmar la hipótesis de quien pregunta y construye una explicación que parece razonable. Pero que esté bien escrito no demuestra que sea cierto. Por eso, cuando audito, vuelvo a los registros y a las conversaciones originales, desconfío de los pasos intermedios que no están verificados y valido cada cuenta por separado. La regla de esta lámina es sencilla: la seguridad del tono nunca reemplaza la trazabilidad de las fuentes y del cálculo.",
    html: `<div class="content-grid"><article class="data-card red"><h3>Fabricación</h3><p>Se atribuyeron divisiones por cero y despejes ficticios a otras IAs.</p></article><article class="data-card navy"><h3>Diagnóstico</h3><p><strong>Sycophancy</strong>: adulación algorítmica para confirmar el sesgo de la pregunta.</p></article></div><div class="quote-card" style="margin-top:14px"><p>La confianza del tono no reemplaza la trazabilidad.</p><span>Regla de auditoría</span></div>`
  },
  {
    index: "10",
    phase: "Fase 5",
    title: "Tres conclusiones para el futuro ingeniero",
    subtitle: "Reflexión metacognitiva",
    deck: "La herramienta acelera el cálculo; el estudiante sostiene el criterio.",
    script: "Con todo el recorrido hecho, puedo resumirlo en tres conclusiones. La primera es un control geométrico directo: sustituir los puntos en la ecuación cartesiana sigue siendo la manera más segura de comprobar pertenencia. La segunda es reconocer los límites de la inteligencia artificial: puede calcular rápido, pero también puede omitir condiciones, seguir una consigna falsa o fabricar evidencia. Y la tercera tiene que ver con mi propio rol. La herramienta acelera el cálculo, pero no reemplaza la interpretación ni el criterio profesional. Como futuro ingeniero, no quiero limitarme a hacer cuentas; quiero entender el resultado, verificarlo y poder explicar por qué es válido.",
    html: `<div class="content-grid three"><article class="data-card"><h3>01 · Verificar</h3><p>Sustituir puntos en ecuaciones cartesianas.</p></article><article class="data-card orange"><h3>02 · Reconocer</h3><p>Detectar conjuntos vacíos, sesgos y evidencia inventada.</p></article><article class="data-card navy"><h3>03 · Auditar</h3><p>Fortalecer la competencia analítica del futuro ingeniero.</p></article></div><div class="result-strip"><strong>Verificar mejor</strong><span>La competencia central no es calcular más rápido.</span></div>`
  }
];
