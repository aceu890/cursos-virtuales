export const APPLIANCES = [
  {
    id: "refrigerador",
    label: "Refrigerador",
    src: "/electrodomesticos/refrigerador.png",
    watts: 150,
  },
  {
    id: "microondas",
    label: "Microondas",
    src: "/electrodomesticos/microondas.png",
    watts: 1200,
  },
  {
    id: "lavadora",
    label: "Lavadora",
    src: "/electrodomesticos/lavadora.png",
    watts: 500,
  },
  {
    id: "fryer",
    label: "Freidora",
    src: "/electrodomesticos/fryer.png",
    watts: 1400,
  },
  {
    id: "tostadora",
    label: "Tostadora",
    src: "/electrodomesticos/tostadora.png",
    watts: 800,
  },
  {
    id: "hervidor",
    label: "Hervidor",
    src: "/electrodomesticos/hervidor.png",
    watts: 2200,
  },
  {
    id: "computador",
    label: "Computador",
    src: "/electrodomesticos/computador.png",
    watts: 200,
  },
  {
    id: "secadora",
    label: "Secadora",
    src: "/electrodomesticos/secadora.png",
    watts: 2000,
  },
] as const;

export type ApplianceId = (typeof APPLIANCES)[number]["id"];

export function applianceById(id: string | undefined) {
  return APPLIANCES.find((item) => item.id === id);
}
