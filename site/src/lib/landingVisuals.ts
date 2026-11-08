/** Public marketing visual anchors — cream editorial chrome stays; these images supply atmosphere. */
export const LANDING_VISUALS = {
  network: {
    src: "/images/landings/neon-immune-cell-network.jpg",
    alt: "Bioluminescent cell connected to DNA, protein, molecule, antibody, therapy and organ research nodes",
    caption: "Connected biology · illustrative",
  },
  signalling: {
    src: "/images/landings/immune-cell-signalling.jpg",
    alt: "Immune cell contacting tissue with glowing molecular signalling pathways",
    caption: "Mechanism context · illustrative",
  },
  immunometabolic: {
    src: "/images/landings/immunometabolic-network.jpg",
    alt: "Interconnected organs, immune cells, mitochondria and vascular systems linked by a knowledge network",
    caption: "Systems biology · illustrative",
  },
  knowledge: {
    src: "/images/landings/biomedical-knowledge-network.jpg",
    alt: "Cream-background biomedical knowledge network linking protein, tissue, lungs, DNA, cells and research dossiers",
    caption: "Evidence network · illustrative",
  },
} as const;

export type LandingVisualKey = keyof typeof LANDING_VISUALS;
