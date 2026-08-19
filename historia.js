const PHOTO_VERSION = '20260818-1936';
const P = (n) => `assets/photos/foto_${String(n).padStart(2, '0')}.jpg?v=${PHOTO_VERSION}`;

window.HISTORIA = {
  consentimiento: {
    titulo: 'Antes de empezar…',
    subtitulo: '⚠️ ADVERTENCIA ROMÁNTICA',
    texto: 'El contenido que estás a punto de ver contiene recuerdos, perritos, mudanzas, momentos vergonzosos, arepas posiblemente quemadas y una cantidad irresponsable de amor.',
    exclusivo: 'Esta experiencia fue creada exclusivamente para Annys.',
    pregunta: '¿Estás segura de querer continuar?',
    ayudaVoz: 'Para continuar por voz, toca el micrófono y di: “sí acepto”.',
    ayudaSwipe: 'Durante la historia puedes deslizar ← → para avanzar o retroceder.'
  },
  portada: {
    titulo: 'Annys, esto fue hecho para ti ❤️',
    subtitulo: 'Nuestra historia no empezó perfecta. Empezó viviendo… y se volvió imposible de olvidar.',
    texto: 'No quería resumir seis años en una sola frase. Quería hacerte sentir cada etapa: cómo empezamos, todo lo que construimos, nuestras casas, George, Mía, nuestras aventuras, lo que dolió, lo que sanó y por qué, después de todo, sigo eligiéndote.',
    imagen: P(8)
  },
  familia: {
    titulo: 'Venezuela + Trujillo + Callao',
    texto: 'Cuatro historias de lugares distintos terminaron llamándose familia.',
    integrantes: [
      { tipo: 'flag', clase: 'flag-ve', nombre: 'Annys', detalle: 'Venezuela 🇻🇪' },
      { tipo: 'flag', clase: 'flag-pe', nombre: 'Diego', detalle: 'Trujillo, Perú 🇵🇪' },
      { tipo: 'pet', icono: '🐾', nombre: 'George', detalle: 'Nuestro schnauzer trujillano' },
      { tipo: 'pet', icono: '🐾', nombre: 'Mía', detalle: 'Nuestra hija chalaca adoptiva' }
    ],
    fotos: [P(5), P(9), P(8)]
  },
  capitulos: [
    {
      kind: 'origin', year: '2019', kicker: 'Capítulo 1', title: 'Primero fuimos amigos… y luego inevitables',
      text: 'Nos conocimos en 2019, sin imaginar hasta dónde iba a llegar todo esto. Empezamos viéndonos seguido, hablando, riéndonos y conociéndonos. Sin hacer ruido, la confianza empezó a convertirse en cariño. No nos enamoramos en una escena perfecta: nos fuimos enamorando mientras vivíamos.',
      quote: '“A veces el amor no llega haciendo ruido. Un día simplemente descubres que la persona con la que siempre quieres hablar ya se convirtió en tu lugar favorito.”',
      images: [P(3), P(17), P(18)]
    },
    {
      kind: 'covid', year: '2020', kicker: 'Capítulo 2', title: 'Mientras afuera el mundo se detenía, nosotros empezábamos',
      text: 'Llegó el COVID, llegó la cuarentena y todo se volvió incierto. Nosotros decidimos refugiarnos juntos. Mientras afuera el mundo parecía detenido, adentro empezábamos a construir una pequeña vida: cuidarnos, acompañarnos y descubrir la paz de tenernos cerca.',
      quote: '“En medio del caos, encontré hogar en estar contigo.”',
      images: [P(8), P(6), P(3)]
    },
    {
      kind: 'george', year: '2020', kicker: 'Capítulo 3', title: 'Éramos tú y yo. Y de pronto fuimos tres 🐾',
      text: 'Entonces llegó George, nuestro schnauzer toy con alma de rey. Con él entendimos que ya no éramos solamente una pareja: empezábamos a ser familia. Llegaron caminatas, travesuras, cuidados y ese amor extraño y precioso que solo entiende una familia petlover.',
      quote: 'Primer hijo oficial de esta historia.',
      images: [P(1), P(2), P(10)]
    },
    {
      kind: 'route', year: '2021', kicker: 'Capítulo 4', title: 'De Trujillo a Lima: cambiaron las casas, nosotros seguíamos siendo nosotros',
      text: 'Hasta 2021 gran parte de nuestra historia ocurrió en Trujillo. Después vinimos a Lima. Primero llegamos a Alameda Colonial, a la casa de mi abuelita. Luego tuvimos nuestro espacio solos, después Villabonita 3 y finalmente Gambeta Baja, Callao. Cambiaron la casa, el barrio, el trabajo y la rutina. Pero donde estábamos juntos, ahí terminábamos haciendo hogar.',
      route: ['TRUJILLO', 'ALAMEDA COLONIAL', 'NUESTRO ESPACIO SOLOS', 'VILLABONITA 3', 'GAMBETA BAJA · CALLAO'],
      images: [P(4), P(16), P(15)]
    },
    {
      kind: 'mia', year: 'Callao', kicker: 'Capítulo 5', title: 'Gambeta Baja nos presentó a Mía… y la manada quedó completa 🐾',
      text: 'Gambeta Baja era una zona picante jajaja, pero también terminó regalándonos una de las partes más bonitas de nuestra historia. Ahí conocimos a Mía. Su forma de ser nos encantó y sentimos que tenía que quedarse con nosotros. Se volvió nuestra segunda hija perruna, con cositas tuyas, cositas mías y muchísimo de ella.',
      quote: '“Mía tenía algo extraño: un poquito de ti, un poquito de mí y muchísimo de ella.”',
      stats: [['Nivel de dificultad del barrio', '🔥🔥🔥'], ['Nivel de nuestra familia', '❤️❤️❤️❤️❤️']],
      images: [P(9), P(12), P(13)]
    },
    {
      kind: 'battle', year: 'Con los años', kicker: 'Capítulo 6', title: 'Uno también se enamora durante la batalla del día a día',
      text: 'Cambié de trabajos y atravesamos etapas económicas, personales y profesionales distintas. Y ahí entendí algo más profundo: uno también se enamora mirando hacia el costado en un día pesado y descubriendo que la misma persona sigue ahí. Apoyándote. Siguiéndote. Aprendiendo contigo. Conociéndote. Viéndote intentar, fallar y volver a intentarlo… y quedándose.',
      bullets: ['apoyándome', 'siguiendo conmigo', 'aprendiendo a mi lado', 'conociéndome de verdad', 'quedándote incluso en los días difíciles'],
      quote: 'Amor joven → amor maduro.',
      images: [P(17), P(18), P(3)]
    },
    {
      kind: 'routine', year: 'Nuestra vida real', kicker: 'Capítulo 7', title: 'Sunsets, comida, gym… y arepas con final impredecible 😂',
      text: 'Amo nuestra versión cotidiana. Mirar un sunset contigo. Salir a comer y descubrir lugares nuevos casi todos los días. Caminar. Pasar tiempo con George y Mía. Recordar cuando entrenábamos en Smart Fit —aunque lo hemos dejado de lado un poquito jajaja— e imaginar que algún día aprenderemos a patinar sin matarnos. Incluso no hacer nada contigo se siente como un buen plan.',
      arepa: { pregunta: '¿La arepa sobrevivió?', respuesta: 'Plot twist: probablemente no 😂. Pero igual te amo y me la como.' },
      stats: [['“Esta vez sí me quedó perfecta”', '83%'], ['Probabilidad de que algo se haya tostado de más', '97% 😂']],
      images: [P(5), P(8), P(16)]
    },
    {
      kind: 'return', year: '2026', kicker: 'Capítulo 8', title: 'Tal vez necesitábamos estar lejos para entender cuánto significaba estar cerca',
      text: 'Este año empezó complicado. Volvimos a Trujillo pensando incluso en mudarnos. Por circunstancias familiares y personales terminamos alejándonos. Yo me quedé en Lima y tú estabas inicialmente en Trujillo. Nos tocó sentir de frente lo que era intentar continuar separados. Y al poco tiempo entendimos lo esencial: separados podemos seguir, sí… pero juntos sentimos que realmente vivimos.',
      equation: ['ANNYS', '+', 'DIEGO', '=', '💥 DINAMITA PURA'],
      quote: '“Nos complementamos. Contigo siento que puedo con todo.”',
      images: [P(8), P(6), P(3)]
    },
    {
      kind: 'maturity', year: 'Hoy', kicker: 'Capítulo 9', title: 'Después de conocerte de verdad, todavía quiero escribir el siguiente capítulo contigo',
      text: 'Ya no estamos en la etapa inicial de una relación. Nos conocemos. Sabemos nuestros defectos, costumbres y silencios. Hemos vivido mudanzas, trabajos, familia, mascotas, problemas, separaciones y reencuentros. Y justamente por conocer la historia completa puedo decirlo con más certeza: realmente te amo.',
      quote: '“No te amo porque nuestra historia haya sido perfecta. Te amo porque después de conocerla completa sigo queriendo escribir el siguiente capítulo contigo.”',
      images: [P(8), P(17), P(18)]
    }
  ],
  galeria: Array.from({ length: 47 }, (_, i) => P(i + 1)),
  carta: {
    titulo: 'Annys, si miro hacia atrás veo seis años. Si miro hacia adelante, siento que apenas estamos empezando.',
    parrafos: [
      'Vivimos casas distintas. Ciudades distintas. Trabajos distintos. Momentos hermosos y momentos difíciles. Fuimos dos. Luego fuimos tres. Después cuatro. Nos alejamos. Nos encontramos.',
      'Y después de todo eso todavía hay algo que no cambió: quiero vivir mi vida contigo. Quiero más cenas, más paseos, más sunsets, más viajes, más intentos de volver al gym, más George y Mía, más arepas chamuscadas, más lugares nuevos y más versiones de nosotros que todavía no conocemos.',
      'Después de conocerte durante seis años, después de todo lo bueno y todo lo difícil, si tuviera que empezar nuevamente… te elegiría otra vez.'
    ]
  },
  prefinal: ['Así que…', 'después de seis años…', 'quiero preguntarte algo como si fuera la primera vez.'],
  pregunta: 'Annys, ¿quieres ser mi enamorada?',
  respuesta: 'Entonces seguimos escribiendo. Te amo muchísimo, mi amor. — Diego',
  siguiente: 'Capítulo siguiente: Nosotros.'
};
