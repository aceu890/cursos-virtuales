import type { ArticleContent } from "../types";

function articulo(
  blocks: ArticleContent["blocks"],
): ArticleContent {
  return { blocks };
}

export const ARTICULO_TENSION = articulo([
  {
    type: "p",
    text: "La tensión, también llamada voltaje, es la diferencia de potencial entre dos puntos. No es “la electricidad que hay dentro de un cable” mirado solo. Siempre se habla de tensión entre un punto y otro: entre la fase y el neutro, entre los bornes de una lámpara, entre la carcasa y la tierra.",
  },
  { type: "h2", text: "El volt y lo que empuja" },
  {
    type: "p",
    text: "Se mide en volts (V). Una pila de linterna anda por 1,5 V. La red de este curso, y la de la mayoría de las viviendas de la región, es de 220 V entre fase y neutro. Ese número es lo que empuja a las cargas eléctricas a moverse por el circuito. Sin diferencia de potencial no hay corriente, aunque el cable esté perfecto.",
  },
  {
    type: "p",
    text: "Una imagen útil es la de un desnivel de agua. El voltaje es la altura entre el depósito y la salida. Más altura, más empuje. El cable es el tubo. La lámpara es lo que el agua tiene que atravesar. El tubo solo no hace nada si los dos extremos están a la misma altura.",
  },
  { type: "h2", text: "Siempre entre dos puntos" },
  {
    type: "ul",
    items: [
      "220 V es la tensión de la red, entre fase y neutro.",
      "En una lámpara encendida, casi toda esa tensión aparece entre sus dos bornes de trabajo.",
      "Un cable ideal, sin carga, no “gasta” tensión: los dos extremos están casi al mismo potencial.",
      "La tierra de protección no es el neutro. Entre una carcasa bien aislada y la tierra no debería haber tensión de trabajo.",
    ],
  },
  {
    type: "p",
    text: "En el tablero vas a verlo así: el poste ofrece fase y neutro. El medidor de tensión se pone en paralelo, un borne en cada lado, y lee esa diferencia. Nunca se inserta en el camino como si fuera una lámpara. La lección de medición lo practica; antes conviene tener claro que el volt es una diferencia, no una cosa que viaja sola por el cable.",
  },
]);

export const ARTICULO_CORRIENTE = articulo([
  {
    type: "p",
    text: "La corriente es el movimiento ordenado de cargas eléctricas por un conductor. Si la tensión es el desnivel, la corriente es el caudal: cuánta carga pasa por un punto en un segundo.",
  },
  { type: "h2", text: "El ampere" },
  {
    type: "p",
    text: "Se mide en amperes (A). Un ampere es un caudal ya considerable en una instalación de casa. Una lámpara de este tablero pide alrededor de 0,27 A. Un computador de 200 W pide cerca de 0,9 A. Un hervidor de 2200 W pide 10 A. El automático del curso abre si la corriente supera los 10 A: no es un número mágico, es el límite del circuito.",
  },
  {
    type: "p",
    text: "La corriente solo existe si el camino está cerrado. Sale por la fase, recorre la carga y vuelve por el neutro. En un circuito sano, lo que sale por la fase es lo que regresa por el neutro. Si una parte se escapa a tierra, esa diferencia es una fuga, y el diferencial existe para notarla.",
  },
  { type: "h2", text: "Qué no es" },
  {
    type: "ul",
    items: [
      "No se “gasta” en el sentido de desaparecer. La carga convierte energía; las cargas siguen y vuelven a la fuente.",
      "No elige el camino largo si hay un atajo. Un corto entre fase y neutro es un caudal enorme, sin pasar por la lámpara.",
      "No circula por la tierra en una instalación sana. El conductor verde está para una falla, no para alimentar.",
      "Se mide en serie: hay que abrir el camino e insertar el medidor, porque el medidor tiene que ser recorrido por ese mismo caudal.",
    ],
  },
  {
    type: "p",
    text: "Cuando armes los circuitos, cada vez que una lámpara encienda hay corriente. Cuando el interruptor está abierto, el camino se corta y la corriente de ese punto cae a cero, aunque la tensión de la red siga presente del lado de la fase.",
  },
]);

export const ARTICULO_OHM = articulo([
  {
    type: "p",
    text: "La resistencia es la oposición que un material presenta al paso de la corriente. Se mide en ohms (Ω). Un cable de cobre tiene muy poca. El filamento de una lámpara, o la resistencia de un hervidor, tiene mucha más: por eso ahí se convierte energía eléctrica en luz o en calor.",
  },
  { type: "h2", text: "La ley de Ohm" },
  {
    type: "p",
    text: "Para un elemento resistivo, la tensión, la corriente y la resistencia se atan con una sola relación: tensión = corriente × resistencia. En símbolos, V = I × R. Si conoces dos, sacas la tercera. Despejando: I = V / R y R = V / I.",
  },
  {
    type: "p",
    text: "En la red de 220 V, un hervidor de 10 A se comporta como una resistencia de 220 / 10 = 22 Ω. La lámpara del tablero, con unos 0,27 A, equivale a cerca de 220 / 0,27 ≈ 800 Ω. Más resistencia, menos corriente, a la misma tensión. Menos resistencia, más corriente: un corto es una resistencia casi nula y por eso la corriente se dispara.",
  },
  { type: "h2", text: "Cómo leerla en casa" },
  {
    type: "ul",
    items: [
      "La red fija la tensión, cerca de 220 V. La carga fija la resistencia. De las dos sale la corriente.",
      "Poner dos cargas en paralelo no suma sus resistencias. Cada una ve los 220 V y pide su propia corriente. El automático ve la suma.",
      "Poner dos cargas en serie reparte la tensión. Cada una recibe menos de 220 V y el conjunto pide menos corriente. Así no se instalan los enchufes de una vivienda.",
      "El interruptor abierto es una resistencia enorme: la corriente no pasa. Cerrado, es casi un cable.",
    ],
  },
  {
    type: "p",
    text: "Ohm no reemplaza al tablero. Te dice por qué un cable de más entre fase y neutro es grave, y por qué una lámpara y un computador pueden convivir en el mismo automático si la suma de corrientes cabe en su calibre.",
  },
]);

export const ARTICULO_POTENCIA = articulo([
  {
    type: "p",
    text: "La potencia es el ritmo al que se convierte la energía. En una vivienda es lo que “consume” un aparato mientras está encendido: la lámpara, el computador, el horno. Se mide en watts (W). Mil watts son un kilowatt (kW).",
  },
  { type: "h2", text: "Watts, volts y amperes" },
  {
    type: "p",
    text: "En una carga resistiva, potencia = tensión × corriente. P = V × I. Con 220 V, un aparato de 2200 W pide 2200 / 220 = 10 A. Uno de 200 W pide 200 / 220 ≈ 0,9 A. Por eso la ficha del equipo importa más que el tamaño de la caja: el hervidor cabe justo en el límite del automático de 10 A de este curso, y el computador casi no se nota.",
  },
  {
    type: "p",
    text: "La energía es la potencia mantenida en el tiempo. Si un equipo de 1 kW está encendido una hora, consume 1 kilowatt-hora (kWh). El medidor de la compañía cuenta energía, no la corriente de un instante. El automático, en cambio, vigila la corriente de ahora: no le importa cuántas horas llevas, le importa si en este momento el cable está sobrecargado.",
  },
  { type: "h2", text: "Sumar en el mismo circuito" },
  {
    type: "ul",
    items: [
      "En paralelo, las potencias se suman y las corrientes se suman.",
      "Lámpara de unos 60 W (0,27 A) más computador de 200 W (0,9 A) siguen muy por debajo de 10 A.",
      "Hervidor de 2200 W más cualquier cosa más ya pasa el automático de este tablero.",
      "Apagar el interruptor de la luz pone esa potencia en cero. El enchufe directo sigue pidiendo la suya.",
    ],
  },
  {
    type: "p",
    text: "Cuando elijas qué enchufar en las lecciones del tablero, usa esta cuenta. El computador está ahí porque es una carga chica y el circuito puede estudiarse sin disparo. El hervidor sirve para entender el límite, no para dejarlo junto a otra carga grande.",
  },
]);

export const ARTICULO_ALTERNA = articulo([
  {
    type: "p",
    text: "La pila entrega corriente continua: un polo es siempre positivo y el otro siempre negativo. La red de una vivienda entrega corriente alterna. La tensión cambia de sentido muchas veces por segundo. No hay un “más” y un “menos” guardados en el poste.",
  },
  { type: "h2", text: "220 V y 50 Hz" },
  {
    type: "p",
    text: "Los 220 V de la casa no son un pico instantáneo. Son el valor eficaz: el equivalente en corriente continua que produciría el mismo calor en una resistencia. Un voltímetro de instalación, puesto entre fase y neutro, lee esos 220 V. En este curso el tablero usa esa red. Hay países con 120 V u otras tensiones; las cuentas cambian, la idea no.",
  },
  {
    type: "p",
    text: "La frecuencia dice cuántos ciclos completos hay en un segundo. En la red de este curso son 50 Hz: cincuenta idas y vueltas por segundo. El ojo no ve ese cambio en una lámpara incandescente, y un motor o un transformador sí están hechos para esa frecuencia. Para cablear un punto de luz no eliges la frecuencia: ya viene dada por la red.",
  },
  { type: "h2", text: "Qué cambia en la instalación" },
  {
    type: "ul",
    items: [
      "Los dos conductores de trabajo se llaman fase y neutro, no positivo y negativo.",
      "El interruptor de una lámpara corta la fase. Si cortas solo el neutro, la luz se apaga y la fase sigue en el portalámparas.",
      "El neutro lleva corriente de retorno. No es “el cable que no hace nada”.",
      "La tierra es un tercer conductor, de protección. En alterna sigue sin alimentar la carga.",
    ],
  },
  {
    type: "p",
    text: "A partir de aquí el poste del tablero es la red alterna. Todo lo que armes después —general, diferencial, automático, luz y enchufe— vive entre esa fase y ese neutro, a 220 V.",
  },
]);

export const ARTICULO_FASE_NEUTRO = articulo([
  {
    type: "p",
    text: "Una instalación domiciliaria mínima tiene tres conductores con oficios distintos. Confundirlos es el error que más se repite, y el tablero del curso usa los mismos nombres que vas a ver en una caja real.",
  },
  { type: "h2", text: "Fase" },
  {
    type: "p",
    text: "La fase, o línea, es el conductor activo que llega desde la red. En el tablero es el cable rojo. Trae la tensión de trabajo respecto del neutro. El interruptor unipolar de una lámpara se instala aquí. Las protecciones también la cortan. Si una carcasa toca la fase, esa carcasa queda a tensión de red.",
  },
  { type: "h2", text: "Neutro" },
  {
    type: "p",
    text: "El neutro es el retorno de la corriente de los circuitos. En el tablero es el cable claro. En la red pública está vinculado a tierra en el transformador, así que su tensión respecto de tierra es baja, pero no es un conductor de protección: por él vuelve toda la corriente de las cargas. No se interrumpe con el interruptor de la lámpara. Sí se corta, junto con la fase, en el interruptor general y en el diferencial.",
  },
  { type: "h2", text: "Tierra de protección" },
  {
    type: "p",
    text: "La tierra, o PE, es el conductor verde. No alimenta. Une las carcasas metálicas y el borne de tierra del tomacorriente con la puesta a tierra de la instalación. En uso normal no lleva corriente. Si la fase toca una carcasa, la tierra ofrece un camino de falla para que el diferencial abra, en vez de que ese camino sea una persona.",
  },
  {
    type: "ul",
    items: [
      "Fase: empuje y corriente de ida. Se conmuta.",
      "Neutro: corriente de vuelta. No se usa como tierra.",
      "Tierra: protección. No se usa como neutro ni se pasa por el interruptor de la luz.",
      "En el tablero, unir fase con tierra a propósito es una fuga, no un cableado.",
    ],
  },
]);

export const ARTICULO_SEGURIDAD = articulo([
  {
    type: "p",
    text: "Este curso se practica en el tablero simulado. Una vivienda real puede matar con la misma tensión de 220 V, porque el cuerpo también es un camino para la corriente. La teoría de las protecciones no autoriza a abrir un tablero energizado.",
  },
  { type: "h2", text: "Por qué el cuerpo importa" },
  {
    type: "p",
    text: "La corriente que atraviesa el pecho, aunque sea de unas decenas de miliamperes, puede detener la respiración o el corazón. La piel seca resiste más; la piel húmeda, mucho menos. Por la ley de Ohm, a 220 V basta una resistencia baja del cuerpo para que circule una corriente peligrosa. No hace falta “agarrar fuerte”: un contacto fase-mano y otra mano o el piso pueden cerrar el circuito.",
  },
  { type: "h2", text: "Cómo se trabaja de verdad" },
  {
    type: "ul",
    items: [
      "Se corta la energía en el interruptor general antes de tocar un circuito.",
      "Se comprueba ausencia de tensión entre fase y neutro, y entre fase y tierra, con un instrumento adecuado.",
      "No se remplaza la tierra por el neutro, ni se puentea un diferencial para “que deje de saltar”.",
      "Un disparo repetido es un fallo que hay que encontrar, no un aparato molesto.",
      "Lo que armes aquí te enseña el orden. La obra en una casa la hace quien está habilitado y con la instalación sin tensión.",
    ],
  },
  {
    type: "p",
    text: "En las lecciones del tablero vas a poder equivocarte: un neutro conmutado, una tierra que falta, una fuga. El simulador avisa y no hay nadie en el circuito. Úsalo para reconocer el fallo. En una pared, ese mismo cableado se corrige con la energía cortada.",
  },
]);

export const ARTICULO_SERIE_PARALELO = articulo([
  {
    type: "p",
    text: "En una vivienda conviven las dos formas de conectar. Las protecciones van en serie con la acometida: la corriente de la casa las atraviesa una después de la otra. Las cargas de un mismo circuito van en paralelo: cada una tiene su propio camino entre fase y neutro.",
  },
  { type: "h2", text: "Serie: un solo camino" },
  {
    type: "p",
    text: "Dos elementos en serie son recorridos por la misma corriente. La tensión se reparte entre ellos. El interruptor de una lámpara está en serie con esa lámpara: si se abre, la corriente de la lámpara es cero. El general, el diferencial y el automático también están en serie con todo lo que hay aguas abajo. Si el general está abierto, no llega energía a nadie.",
  },
  { type: "h2", text: "Paralelo: cada carga ve la red" },
  {
    type: "p",
    text: "Dos cargas en paralelo ven la misma tensión, los 220 V, y cada una pide la corriente que le corresponde. Si apagas la lámpara, el enchufe sigue vivo. Por eso en una habitación la luz pasa por el interruptor y el tomacorriente sale directo del automático: comparten la protección y no se apagan juntos. Las corrientes se suman en el automático.",
  },
  {
    type: "ul",
    items: [
      "Serie entre protecciones: poste, general, diferencial, automático.",
      "Serie entre el interruptor y su lámpara, solo en la fase.",
      "Paralelo entre la lámpara ya conmutada y el tomacorriente.",
      "El neutro de cada carga vuelve al neutro del circuito. No se pone un enchufe “en fila” detrás de la lámpara.",
    ],
  },
  {
    type: "p",
    text: "En el tablero, un segundo cable en la salida del automático es justo este paralelo. No es un error de “terminal duplicado” cuando la lección lo permite: es la forma en que una vivienda reparte un circuito.",
  },
]);

export const ARTICULO_MEDIR = articulo([
  {
    type: "p",
    text: "Medir es comparar sin cambiar el circuito, o cambiándolo lo menos posible. El instrumento correcto depende de qué pregunta haces. Tensión y corriente no se miden del mismo modo, y cambiar los bornes de lugar puede ser un corto.",
  },
  { type: "h2", text: "Tensión: en paralelo" },
  {
    type: "p",
    text: "El voltímetro tiene una resistencia muy alta. Casi no deja pasar corriente, así que se conecta entre los dos puntos cuya diferencia quieres leer, sin abrir el circuito. En un tomacorriente, una sonda en la fase y la otra en el neutro. Si las dos sondas están del mismo lado, la lectura es cero: no hay diferencia. Entre fase y neutro de esta red, la lectura es 220 V.",
  },
  { type: "h2", text: "Corriente: en serie" },
  {
    type: "p",
    text: "El amperímetro tiene una resistencia muy baja, porque toda la corriente del circuito tiene que atravesarlo. Se abre el conductor —en la casa, la fase— y el medidor se inserta como un eslabón más. Ponerlo entre fase y neutro es unir la red con un casi-cable: un corto. El instrumento puede dañarse y la protección debe abrir.",
  },
  {
    type: "ul",
    items: [
      "¿Hay 220 V en el enchufe? Voltímetro en paralelo, fase contra neutro.",
      "¿Cuánto pide esta lámpara? Amperímetro en serie, en la fase, con la lámpara en el camino.",
      "¿La carcasa está a tierra? No se mide “a ojo”. Se comprueba continuidad del PE con la instalación sin tensión.",
      "Un medidor no sustituye a la carga. Para leer corriente tiene que haber un circuito cerrado por la lámpara o el equipo.",
    ],
  },
  {
    type: "p",
    text: "Las dos lecciones siguientes del tablero hacen exactamente esto: primero la tensión en el tomacorriente, después la corriente en la fase. Si la lectura no aparece, revisa si el medidor está en paralelo o en serie, no el número.",
  },
]);

export const ARTICULO_PROTECCIONES = articulo([
  {
    type: "p",
    text: "Las protecciones no están para que la luz encienda. Están para abrir el circuito cuando seguir cerrado sería peligroso. En el orden de una vivienda van: interruptor general, diferencial y, para cada circuito, un automático. La tierra no se corta en ninguna de ellas.",
  },
  { type: "h2", text: "Interruptor general" },
  {
    type: "p",
    text: "Corta la instalación completa. Abre la fase y el neutro a la vez. Es el aparato con el que se deja la casa sin energía antes de trabajar. No detecta fugas ni sobrecargas: solo obedece a la mano. Si está abierto, aguas abajo no hay tensión de red.",
  },
  { type: "h2", text: "Diferencial" },
  {
    type: "p",
    text: "Compara la corriente de la fase con la del neutro. En un circuito sano son iguales. Si una parte se va a tierra —una carcasa tocada por la fase, un cable pelado contra el PE— la diferencia aparece y el diferencial abre. Los de protección de personas suelen disparar a 30 mA, una corriente ya peligrosa para el cuerpo y todavía pequeña frente a los amperes de una carga. No reemplaza a la tierra: sin PE, la falla puede no tener camino hasta que alguien lo cierre con el cuerpo.",
  },
  { type: "h2", text: "Automático" },
  {
    type: "p",
    text: "Protege el cable del circuito contra demasiada corriente. Hay dos casos. La sobrecarga es un caudal alto y sostenido: demasiados equipos en el mismo circuito, el cable se calienta. El cortocircuito es un camino casi sin resistencia entre fase y neutro: la corriente sube de golpe. El calibre del automático se elige según el cable, no según “cuántos enchufes quiero”. En este curso el límite es 10 A. Por encima, abre.",
  },
  {
    type: "ul",
    items: [
      "General: aísla toda la vivienda. Fase y neutro.",
      "Diferencial: vigila fugas a tierra. No sirve si lo puenteas.",
      "Automático: vigila la corriente del circuito. Uno por circuito.",
      "Tierra: da el camino para que la fuga exista como corriente y el diferencial pueda verla.",
      "Un disparo se rearma después de quitar el fallo, no antes.",
    ],
  },
  {
    type: "p",
    text: "Las últimas lecciones del tablero te van a poner delante de cada fallo: la tierra que no está, el interruptor en el neutro, la fuga que el diferencial acusa, y al final el tablero entero en el orden correcto.",
  },
]);

export const DOMICILIARIA_ARTICLES: Record<string, ArticleContent> = {
  "que-es-la-tension": ARTICULO_TENSION,
  "que-es-la-corriente": ARTICULO_CORRIENTE,
  "resistencia-y-ohm": ARTICULO_OHM,
  "potencia-y-energia": ARTICULO_POTENCIA,
  "la-corriente-alterna": ARTICULO_ALTERNA,
  "fase-neutro-y-tierra": ARTICULO_FASE_NEUTRO,
  "seguridad-en-la-vivienda": ARTICULO_SEGURIDAD,
  "serie-y-paralelo-en-casa": ARTICULO_SERIE_PARALELO,
  "como-se-mide": ARTICULO_MEDIR,
  "las-protecciones": ARTICULO_PROTECCIONES,
};
