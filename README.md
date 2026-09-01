# Plataforma de Presentaciones Interactivas 3D con Avatar Sincronizado

[![Three.js](https://img.shields.io/badge/Three.js-v0.180.0-black?logo=three.js)](https://threejs.org/)
[![GSAP](https://img.shields.io/badge/GSAP-v3.15.0-green?logo=greensock)](https://greensock.com/gsap/)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D20-339933?logo=node.js)](https://nodejs.org/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

Una plataforma web interactiva y modular diseñada para crear experiencias de presentación de alto impacto. Combina un **presentador virtual 3D con sincronización labial (lipsync) y gestual en tiempo real**, un **visor interactivo 3D para exploración geométrica y espacial**, un **deck dinámico de tarjetas visuales en alta definición sincronizadas por frase**, y un **módulo integrado de consulta documental**.

Esta instancia implementa la defensa oral del Trabajo Práctico de **Álgebra y Geometría Analítica** (UTN FRBA) sobre Rectas y Planos en $\mathbb{R}^3$, pero su arquitectura desacoplada y basada en datos permite adaptarla fácilmente para **cualquier temática académica, técnica o profesional**.

---

## 📑 Tabla de Contenidos

1. [¿Para qué sirve?](#-para-qué-sirve)
2. [Arquitectura y Cómo fue Desarrollada](#-arquitectura-y-cómo-fue-desarrollada)
3. [Estructura del Proyecto](#-estructura-del-proyecto)
4. [Tecnologías Utilizadas](#-tecnologías-utilizadas)
5. [Dificultades Técnicas Superadas](#-dificultades-técnicas-superadas)
6. [Cómo Adaptar la Plataforma para Cualquier Presentación](#-cómo-adaptar-la-plataforma-para-cualquier-presentación)
7. [Instalación y Uso Local](#-instalación-y-uso-local)
8. [Despliegue en Producción](#-despliegue-en-producción)
9. [Atajos de Teclado y Controles](#-atajos-de-teclado-y-controles)
10. [Autor](#-autor)

---

## 🎯 ¿Para qué sirve?

La aplicación transforma una presentación estática tradicional (como PowerPoint o diapositivas planas) en una experiencia inmersiva e interactiva de divulgación:

- **Exposición Narrada por un Avatar 3D**: Un presentador digital tridimensional articulado con *blendshapes* / *morph targets* modula su boca, ojos, cejas e inclinación de cabeza al compás exacto de la locución hablada.
- **Exploración Tridimensional Interactiva en $\mathbb{R}^3$**: Integra un visor matemático con `OrbitControls` que permite orbitar, rotar, hacer zoom e inspeccionar rectas, planos coordenados, vectores normales, ángulos diedros y puntos de intersección en el espacio.
- **Deck Dinámico de Tarjetas de Apoyo (Cards HD)**: A medida que el presentador pronuncia cada oración, el sistema resalta y focaliza automáticamente la tarjeta, fórmula o gráfico correspondiente a esa parte del discurso.
- **Acceso Directo a Cálculos Manuales y PDF**: Modal emergente accesible que permite consultar los cálculos originales escaneados y visualizar el documento fuente completo en PDF sin abandonar la presentación.
- **Control Total de Reproducción**: Botones accesibles de navegación paso a paso (*Anterior*, *Siguiente*), inicio de locución (*Iniciar*), parada (*Detener*), pausa interactiva (*Pausar*) y alternancia del visor 3D (*Gráfico 3D*).

---

## 🏗️ Arquitectura y Cómo fue Desarrollada

La plataforma fue diseñada con una filosofía de **cero dependencias innecesarias**, prescindiendo de frameworks monolíticos (React, Angular o Vue) y transpiladores complejos para maximizar el rendimiento, la velocidad de carga y la longevidad del código.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                   index.html / CSS                                     │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            │
                                    ┌───────▼───────┐
                                    │    app.js     │ (Orquestador Principal)
                                    └───┬───┬───┬───┘
                 ┌──────────────────────┘   │   └──────────────────────┐
                 ▼                          ▼                          ▼
     ┌───────────────────────┐  ┌───────────────────────┐  ┌───────────────────────┐
     │     SpeechSystem      │  │   AvatarController    │  │   ProcedimientoView   │
     │  (Audio + FFT Lipsync)│  │ (Three.js 3D Avatar)  │  │ (Tarjetas & Foco HD)  │
     └───────────┬───────────┘  └───────────┬───────────┘  └───────────┬───────────┘
                 │                          │                          │
                 └──────────────────────────┼──────────────────────────┘
                                            ▼
                                ┌───────────────────────┐
                                │  Cartesian3DExplorer  │
                                │(Visor Geométrico R³)  │
                                └───────────────────────┘
```

### Flujo de Sincronización Multimedia

1. **Lectura Declarativa**: Al iniciar, `app.js` carga las definiciones de `slides.js` y `procedimiento-scenes.js`.
2. **Carga del Modelo 3D**: `AvatarController` instancia Three.js y carga el modelo GLTF/GLB (`facecap.glb`) junto con sus decodificadores DRACO y Meshopt.
3. **Pipeline de Lipsync**: `SpeechSystem` carga los archivos de audio WAV (`voice/slide-XX.wav`) y sus correspondientes metadatos fonéticos generados por Rhubarb Lip Sync (`lipsync/slide-XX.json`).
4. **Bucle de Animación (`requestAnimationFrame`)**:
   - En cada cuadro, `SpeechSystem` calcula el tiempo actual del audio y la cadencia de pausas por puntuación (`PUNCTUATION_CADENCE`).
   - Mapea el visema activo (`A`, `B`, `C`, `D`, `E`, `F`, `G`, `H`, `X`) a los pesos de apertura de mandíbula, redondeo de labios y compresión en los *morph targets* del avatar.
   - Aplica comportamientos orgánicos procedurales: micro-parpadeos (`blink`), respiración y movimientos sutiles de atención hacia la audiencia o hacia las diapositivas (`head yaw/pitch/roll`).
   - Detecta el cambio de oración en el discurso y notifica a `ProcedimientoView` para animar mediante GSAP el foco y la iluminación de las tarjetas visuales.

---

## 📁 Estructura del Proyecto

```
Presentacion ALGEBRA/
├── face-lab/                               # Núcleo de la aplicación web
│   ├── cards/                              # Tarjetas gráficas HD de apoyo por diapositiva
│   │   ├── card-01-1.png ... card-10-3.png
│   ├── css/                                # Hojas de estilo modulares
│   │   ├── main.css                        # Variables de diseño, layout global y controles
│   │   ├── procedimiento.css               # Estilos del visualizador de tarjetas y focos
│   │   └── cartesian-3d.css                # Estilos del visor cartesiano interactivo R³
│   ├── js/                                 # Módulos de lógica ES6 nativos
│   │   ├── app.js                          # Entrada principal y coordinación de ciclo de vida
│   │   ├── audio/
│   │   │   └── speech-system.js            # Motor de audio, análisis y cadencia de fonemas
│   │   ├── avatar/
│   │   │   ├── avatar-controller.js        # Carga GLB, blendshapes y física procedural
│   │   │   └── forest-env.js               # Iluminación ambiental y partículas escénicas
│   │   ├── data/
│   │   │   ├── slides.js                   # Textos, narración y metadatos por diapositiva
│   │   │   └── procedimiento-scenes.js     # Configuración de tarjetas y focos por oración
│   │   └── ui/
│   │       ├── presentation-controller.js  # Gestión de botones de transporte y estado
│   │       ├── procedimiento-view.js       # Renderizado de cards y animaciones GSAP
│   │       └── biblio-modal.js             # Modal de cálculos manuales y visor PDF
│   ├── cartesian-3d-explorer.js            # Visor interactivo 3D de geometría analítica R³
│   ├── lipsync/                            # Datos JSON de alineación fonética (Rhubarb)
│   │   ├── slide-01.json ... slide-12.json
│   ├── models/                             # Modelos tridimensionales optimizados
│   │   └── facecap.glb                     # Avatar con morph targets faciales
│   ├── presentation-assets/                # Previsualizaciones y miniaturas de apoyo
│   ├── voice/                              # Locuciones de audio en formato WAV
│   │   ├── slide-01.wav ... slide-10.wav
│   ├── tools/                              # Utilidades para generación de lipsync
│   │   ├── generate-lipsync.mjs            # Script automatizado con Rhubarb CLI
│   │   └── lipsync-dialogs/                # Transcripciones de diálogo en texto plano
│   ├── index.html                          # Documento HTML5 accesible y semántico
│   ├── server.mjs                          # Servidor HTTP local con cabeceras de seguridad
│   ├── package.json                        # Definición de scripts y dependencias (Three, GSAP)
│   └── tp-trabajo-grupal.pdf               # Documento fuente en PDF
├── tools/                                  # Scripts en Python para generación de gráficos analíticos
│   ├── build_all_presentation_slides.py    # Generador de láminas completas
│   ├── build_cartesian_plots.py            # Generador de gráficos cartesianos 3D y 2D
│   ├── build_geogebra_style_plots.py       # Gráficos estilo software matemático
│   └── build_transparent_procedimientos.py # Extracción de capas transparentes
├── AGENTS.md                               # Convenciones de desarrollo y directrices
├── HOSTINGER.md                            # Guía de despliegue paso a paso
└── README.md                               # Documentación principal del repositorio
```

---

## 💻 Tecnologías Utilizadas

| Tecnología | Rol en el Proyecto |
|---|---|
| **Three.js (v0.180.0)** | Motor de renderizado WebGL para el presentador 3D y el visor interactivo de geometría en $\mathbb{R}^3$. Maneja cámaras en perspectiva, iluminación PBR, `OrbitControls`, `GLTFLoader`, `DRACOLoader` y *Morph Targets*. |
| **GSAP (v3.15.0)** | Motor de animaciones de interfaz. Gestiona transiciones de entrada/salida de tarjetas, resaltado de elementos activos y respeto automático a `prefers-reduced-motion`. |
| **Web Audio API & HTML5 Audio** | Reproducción de audio de baja latencia con sincronización exacta de tiempo (`currentTime`) y análisis espectral. |
| **Rhubarb Lip Sync** | Sistema de reconocimiento fonético que procesa los archivos `.wav` y los diálogos `.txt` para generar las curvas temporales de fonemas en `.json`. |
| **Node.js (>=20)** | Servidor HTTP nativo (`server.mjs`) que incluye validación estricta de rutas (`path containment`), políticas de seguridad (*Content-Security-Policy*, *X-Content-Type-Options*, *Cross-Origin-Resource-Policy*) y endpoint de salud `/healthz`. |
| **CSS3 Moderno** | Variables CSS (Design Tokens), CSS Grid para el layout responsivo de dos columnas (escena/avatar), Glassmorphism con `backdrop-filter` y aceleración por GPU mediante `transform: translate3d`. |
| **Python & NumPy / PIL / Matplotlib** | Generación programática de diagramas vectoriales y rasterizados de alta precisión geométrica en `tools/`. |

---

## ⚙️ Dificultades Técnicas Superadas

### 1. Sincronización Milimétrica entre Fonemas y Audio
- **Problema**: El evento `timeupdate` de HTML5 Audio se emite a intervalos irregulares (cada 150-250 ms), lo que producía movimientos robóticos y desfasados en los labios del avatar.
- **Solución**: Se implementó una interpolación continua ejecutada en el bucle principal de `requestAnimationFrame` que lee directamente `audioPlayer.currentTime`. Adicionalmente, se incorporó un modelo de cadencia de puntuación (`PUNCTUATION_CADENCE`) que atenúa suavemente la apertura bucal en comas y puntos (`duck`, `attack`, `hold`, `release`) para emular la respiración natural de un orador humano.

### 2. Renderizado Concurrente de Dos Escenas 3D a 60 FPS
- **Problema**: Ejecutar simultáneamente el renderizado del presentador 3D con shaders complejos e iluminación direccional y el visor interactivo de $\mathbb{R}^3$ con `OrbitControls` podía provocar caídas de tasa de cuadros en dispositivos móviles o GPUs integradas.
- **Solución**: Se optimizaron las geometrías con compresión Meshopt/DRACO, se desactivaron los mapas de sombras pesados innecesarios (`shadowMap.enabled = false`), se calibró el `pixelRatio` con un tope adaptativo (`Math.min(window.devicePixelRatio, mobile ? 0.85 : 1)`) y se configuró el visor cartesiano para suspender cálculos innecesarios cuando no se encuentra en el viewport activo.

### 3. Foco Dinámico de Tarjetas sin Recargar el DOM
- **Problema**: Sincronizar múltiples imágenes y fórmulas matemáticas al ritmo de cada frase hablada sin provocar parpadeos ni reflows de layout costosos.
- **Solución**: Las tarjetas de cada diapositiva se precargan en el DOM y se modulan mediante transiciones CSS aceleradas por GPU (`opacity`, `transform`, `filter`). `ProcedimientoView` aplica clases de estado (`active`, `dimmed`) coordinadas con el índice de oración emitido por `SpeechSystem`.

### 4. Arquitectura Web Nativa sin Paso de Compilación
- **Problema**: Los empaquetadores modernos (Vite, Webpack) a menudo introducen dependencias frágiles y problemas de despliegue en hostings compartidos o servidores ligeros.
- **Solución**: Uso estricto de ES Modules nativos del navegador con *Import Maps* para Three.js y GSAP, permitiendo que el proyecto funcione de forma idéntica en local y en producción simplemente iniciando el servidor Node.js.

---

## 🎨 Cómo Adaptar la Plataforma para Cualquier Presentación

Gracias a su diseño desacoplado, este repositorio puede utilizarse como plantilla para crear **cualquier tipo de presentación interactiva**. A continuación se detalla la guía paso a paso:

```
PASO 1: Escribir diapositivas (slides.js)
   │
PASO 2: Grabar audio (.wav) y generar lipsync (.json)
   │
PASO 3: Diseñar tarjetas de apoyo (cards/ y procedimiento-scenes.js)
   │
PASO 4: (Opcional) Cambiar modelo 3D (facecap.glb) o visor R³ (cartesian-3d-explorer.js)
   │
PASO 5: Ejecutar localmente (npm run dev)
```

### Paso 1: Configurar las Diapositivas
Edita el archivo `face-lab/js/data/slides.js`:
```javascript
export const slides = [
  {
    index: "01",
    phase: "Introducción",
    title: "Tu Título Principal",
    subtitle: "Subtítulo de la diapositiva",
    deck: "Resumen breve de la idea central.",
    script: "Texto completo que el presentador va a pronunciar en esta diapositiva. Cada punto seguido (.) determinará el avance del foco visual entre las tarjetas.",
    html: `<div class="quote-card"><p>Idea clave</p><span>Autor / Fuente</span></div>`
  },
  // Agrega tantas diapositivas como necesites...
];
```

### Paso 2: Grabar Audio y Generar Sincronización Labial
1. Guarda la locución en formato WAV en `face-lab/voice/slide-01.wav`, `slide-02.wav`, etc.
2. Guarda el texto del guion en `face-lab/tools/lipsync-dialogs/slide-01.txt`.
3. Ejecuta el script generador de lipsync (requiere el ejecutable de [Rhubarb Lip Sync](https://github.com/DanielSWolf/rhubarb-lip-sync)):
   ```powershell
   node face-lab/tools/generate-lipsync.mjs
   ```
   Esto creará automáticamente los archivos `face-lab/lipsync/slide-01.json`, etc.

### Paso 3: Configurar las Tarjetas de Apoyo Visual
1. Coloca tus imágenes o gráficos en `face-lab/cards/` (por ejemplo: `card-01-1.png`, `card-01-2.png`).
2. Declara las tarjetas y la asociación con cada oración en `face-lab/js/data/procedimiento-scenes.js`:
   ```javascript
   export const procedimientoScenes = {
     "01": {
       title: "Título de la escena",
       objects: [
         {
           id: "card-1",
           type: "image",
           src: "./cards/card-01-1.png",
           alt: "Descripción accesible",
           title: "Encabezado de la tarjeta",
           desc: "Detalle técnico explicado",
           sentenceIndex: 0 // Se iluminará con la primera oración del script
         },
         {
           id: "card-2",
           type: "image",
           src: "./cards/card-01-2.png",
           alt: "Segunda tarjeta",
           title: "Segundo concepto",
           desc: "Explicación complementaria",
           sentenceIndex: 1 // Se iluminará con la segunda oración
         }
       ]
     }
   };
   ```

### Paso 4: (Opcional) Cambiar el Avatar 3D
- Puedes reemplazar el archivo `face-lab/models/facecap.glb` por cualquier modelo 3D en formato GLB que posea *blendshapes* estándar (visemas faciales tipo ARKit / Oculus: `jawOpen`, `mouthFunnel`, `mouthPucker`, `mouthSmile_L`, `mouthSmile_R`, `eyeBlink_L`, `eyeBlink_R`, etc.).
- La clase `AvatarController` detecta automáticamente los morph targets del modelo y enlaza las animaciones sin necesidad de reconfigurar la malla.

### Paso 5: (Opcional) Adaptar o Reemplazar el Visor Central
- Si tu presentación no requiere geometría en $\mathbb{R}^3$, puedes adaptar `face-lab/cartesian-3d-explorer.js` para cargar visualizaciones 3D de tu área (modelos anatómicos, piezas de ingeniería, moléculas químicas, gráficos de dispersión 3D) o simplemente ocultar el contenedor mediante CSS si solo deseas utilizar el deck de tarjetas.

---

## 🚀 Instalación y Uso Local

### Prerrequisitos
- [Node.js](https://nodejs.org/) v20 o superior instalado en el sistema.
- Gestor de paquetes `npm`.

### Pasos de Instalación

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/santiagosessa/ALGEBRA-TP.git
   cd ALGEBRA-TP
   ```

2. **Instalar dependencias en `face-lab/`:**
   ```bash
   cd face-lab
   npm install
   ```

3. **Iniciar el servidor de desarrollo:**
   ```bash
   npm run dev
   ```

4. **Abrir en el navegador:**
   Visita `http://localhost:4173` en Google Chrome, Microsoft Edge, Mozilla Firefox o Safari.

---

## 🌐 Despliegue en Producción

La aplicación está lista para ser desplegada en cualquier plataforma compatible con Node.js (Hostinger, Render, Railway, VPS, Docker, etc.):

### Despliegue en Hostinger (Node.js Web App)
1. En el panel de control de Hostinger (**hPanel**), dirígete a `Websites → Add Website → Node.js Web App`.
2. Conecta el repositorio de GitHub: `santiagosessa/ALGEBRA-TP`.
3. Configura las siguientes opciones:
   - **Root directory:** `face-lab`
   - **Entry point:** `server.mjs`
   - **Install command:** `npm install`
   - **Start command:** `npm start`
   - **Node.js version:** 20 o superior
4. Guarda y despliega. El servidor detectará automáticamente la variable de entorno `PORT` y habilitará la verificación en `/healthz`.

Para más detalles, consulta el archivo [`HOSTINGER.md`](HOSTINGER.md).

---

## ⌨️ Atajos de Teclado y Controles

| Control / Tecla | Acción |
|---|---|
| <kbd>Espacio</kbd> | Iniciar / Pausar / Reanudar la locución y animación actual |
| <kbd>→</kbd> (Flecha derecha) | Avanzar al siguiente diálogo o diapositiva |
| <kbd>←</kbd> (Flecha izquierda) | Retroceder al diálogo o diapositiva anterior |
| <kbd>Esc</kbd> | Cerrar el modal de cálculos manuales o cancelar zoom |
| **Botón "Iniciar"** | Reproduce la narración de la diapositiva actual con lipsync |
| **Botón "Pausar"** | Pausa la locución manteniendo la posición exacta del audio y gestos |
| **Botón "Detener"** | Detiene la locución y reinicia el estado de la diapositiva |
| **Botón "Gráfico 3D"** | Abre o cierra el visor interactivo de $\mathbb{R}^3$ debajo de las tarjetas |
| **Botón "Cálculos manuales"** | Despliega el modal con la bibliografía y el documento PDF original |

---

## 👤 Autor

- **Santiago Sessa** — [santiagosessa07@gmail.com](mailto:santiagosessa07@gmail.com)  
  *Ingeniería en Sistemas de Información · Universidad Tecnológica Nacional (UTN FRBA)*
