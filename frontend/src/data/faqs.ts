export interface StoreFaq {
  id: string;
  question: string;
  answer: string;
}

/** Shared by the homepage and the contact page so the answers never drift apart. */
export const STORE_FAQS: StoreFaq[] = [
  {
    id: "sourcing",
    question: "Where do you source your dry fruits from?",
    answer:
      "Our almonds and walnuts are sourced directly from certified organic groves in Pulwama and Pahalgam, Kashmir. Our King W-180 cashews come from Mangalore, while Medjool dates and Afghani figs are imported under strict temperature controls from Jordan and Afghanistan.",
  },
  {
    id: "freshness",
    question: "How does NutriNation guarantee zero rancidity?",
    answer:
      "All our products are packed in clean-room nitrogen-flushed tins and multilayer oxygen-barrier pouches. This seals in the delicate natural oils and keeps moisture and oxidation completely out.",
  },
  {
    id: "gifting",
    question: "Do you offer corporate and wedding gifting packages?",
    answer:
      "Yes! We specialize in bespoke handcrafted wooden caskets, brass filigree hampers, and customized gift sleeves for corporate milestones and luxury wedding celebrations.",
  },
  {
    id: "delivery",
    question: "What is your standard delivery timeline?",
    answer:
      "Standard ground/air delivery takes 2-3 business days across India. Priority next-day air express is also available at checkout for major metro cities.",
  },
];
