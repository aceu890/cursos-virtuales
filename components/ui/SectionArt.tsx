import Image from "next/image";

const ART = {
  home: {
    src: "/illustrations/home-practicar.png",
    alt: "Persona con una ampolleta y una pila",
  },
  catalog: {
    src: "/illustrations/catalogo-cursos.png",
    alt: "Libros de cursos y birrete",
  },
  course: {
    src: "/illustrations/curso-electricidad.png",
    alt: "Pila, interruptor y ampolleta",
  },
  lesson: {
    src: "/illustrations/leccion-circuito.png",
    alt: "Circuito simple con pila, interruptor y ampolleta",
  },
  offline: {
    src: "/illustrations/offline-senal.png",
    alt: "Señal de wifi tachada",
  },
  auth: {
    src: "/illustrations/cuenta-llave.png",
    alt: "Candado y llave",
  },
} as const;

const SIZE = {
  sm: "h-24 w-24",
  md: "h-36 w-36 sm:h-40 sm:w-40",
  lg: "h-44 w-44 sm:h-52 sm:w-52",
} as const;

export type SectionArtKey = keyof typeof ART;

export function SectionArt({
  section,
  size = "md",
  className = "",
  priority = false,
}: {
  section: SectionArtKey;
  size?: keyof typeof SIZE;
  className?: string;
  priority?: boolean;
}) {
  const art = ART[section];
  return (
    <Image
      src={art.src}
      alt={art.alt}
      width={1024}
      height={1024}
      priority={priority}
      className={`art-3d pointer-events-none select-none object-contain ${SIZE[size]} ${className}`}
    />
  );
}
