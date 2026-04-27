import { Guide } from "@/types/guide";

export const MOCK_GUIDES: Omit<Guide, 'id'>[] = [
  {
    title: "US B1/B2 Visitor Visa Mastery",
    country: "United States",
    visaType: "Visitor (B1/B2)",
    price: 49.99,
    shortDescription: "Your complete roadmap to securing a US visitor visa, covering documentation, interview prep, and common pitfalls.",
    fullContent: "This guide is meticulously designed for travelers who need to navigate the complexities of the US B1/B2 visa application process. From filling out the DS-160 to handling the high-pressure consulate interview, we provide step-by-step instructions based on thousands of successful applications.",
    category: "Tourism",
    prerequisites: [
      "Valid passport (6+ months validity)",
      "Digital passport-size photo",
      "Financial stability evidence",
      "No criminal record"
    ],
    tableOfContents: [
      "Introduction to the B1/B2 Visa",
      "The DS-160 Form: Line-by-Line Guide",
      "Fee Payment & Scheduling",
      "Required Documentation Checklist",
      "The Interview: Winning Strategies",
      "What to do if Rejected"
    ],
    imageUrl: "https://picsum.photos/seed/usa-visitor/600/400",
    countryIds: ["united states", "usa"]
  },
  {
    title: "US H-1B Specialty Occupation Guide",
    country: "United States",
    visaType: "H-1B Work Visa",
    price: 89.99,
    shortDescription: "A professional guide for high-skilled professionals looking to secure employment and sponsorship in the USA.",
    fullContent: "Navigating the H-1B lottery and petition process requires precision. This guide covers LCA requirements, specialty occupation definitions, and the transition from F-1 or other statuses to H-1B sponsorship.",
    category: "Work",
    prerequisites: [
      "Bachelor's degree or equivalent",
      "Job offer from a US employer",
      "Employer willing to sponsor",
      "Valid passport"
    ],
    tableOfContents: [
      "The H-1B Cap & Lottery System",
      "Defining Specialty Occupations",
      "The LCA Process Explained",
      "Documenting Your Credentials",
      "Consular Processing vs. Change of Status",
      "Dependents and H-4 Visas"
    ],
    imageUrl: "https://picsum.photos/seed/usa-work/600/400",
    countryIds: ["united states", "usa", "america"]
  },
  {
    title: "Australia Holiday & Work Explorer",
    country: "Australia",
    visaType: "Working Holiday (Subclass 417)",
    price: 54.99,
    shortDescription: "The ultimate guide to living and working in Australia for up to 3 years while exploring the continent.",
    fullContent: "Australia's Working Holiday program is the gold standard for global youth migration. This guide covers every step from the online application to landing your first job in Melbourne or Sydney.",
    category: "Work",
    prerequisites: [
      "Age 18 to 30 (35 for some countries)",
      "Valid passport from eligible nation",
      "Approximately $5,000 AUD in savings",
      "Health and character requirements"
    ],
    tableOfContents: [
      "Eligibility Check & Country Lists",
      "The ImmiAccount Application Process",
      "Finding Work: Best Industries for WHVs",
      "Banking, Tax, and Medicare Setup",
      "Regional Work for Visa Extensions",
      "Traveler Safety & Insurance Tips"
    ],
    imageUrl: "https://picsum.photos/seed/australia-visa/600/400",
    countryIds: ["australia", "oz", "down under"]
  },
  {
    title: "UK Skilled Worker Visa Roadmap",
    country: "United Kingdom",
    visaType: "Skilled Worker",
    price: 94.99,
    shortDescription: "Complete guide to the point-based immigration system for working in the UK.",
    fullContent: "The UK's point-based system requires applicants to meet specific criteria for sponsorship, skill level, and English proficiency. This guide explains how to secure a Certificate of Sponsorship and successfully apply for your visa.",
    category: "Work",
    prerequisites: [
      "Certificate of Sponsorship (CoS)",
      "Job on the eligible occupations list",
      "English language proficiency (B1)",
      "Minimum salary requirement"
    ],
    tableOfContents: [
      "Points-Based System Explained",
      "Finding a Licensed Sponsor",
      "The Shortage Occupation List",
      "Proof of English Proficiency",
      "The Health and Care Worker Route",
      "Calculating Your Visa Fees"
    ],
    imageUrl: "https://picsum.photos/seed/uk-work/600/400",
    countryIds: ["united kingdom", "uk", "britain"]
  },
  {
    title: "Canada Study Permit Accelerator",
    country: "Canada",
    visaType: "Student Visa",
    price: 69.99,
    shortDescription: "Your step-by-step guide to studying at world-class Canadian institutions and securing your permit.",
    fullContent: "Studying in Canada is a primary pathway to permanent residency. This guide details the LOA process, proof of funds requirements, and the recent changes to student caps and PGWP eligibility for 2024.",
    category: "Study",
    prerequisites: [
      "Letter of Acceptance (LOA)",
      "Proof of financial support",
      "No criminal record (Police check)",
      "Medical exam (if applicable)"
    ],
    tableOfContents: [
      "Selecting a DLI Institution",
      "Securing your Letter of Acceptance",
      "Financial Evidence & GIC explained",
      "The Study Plan/Statement of Purpose",
      "Biometrics and Visa Appointment",
      "Working While Studying in Canada"
    ],
    imageUrl: "https://picsum.photos/seed/canada-study/600/400",
    countryIds: ["canada"]
  },
  {
    title: "Bali Digital Nomad B211A Guide",
    country: "Indonesia",
    visaType: "Remote Worker (B211A)",
    price: 59.99,
    shortDescription: "The ultimate guide to living and working remotely in Bali as a digital nomad.",
    fullContent: "Indonesia's remote work landscape is vibrant but regulated. Stay ahead with our updated guide to the B211A offshore visa. Learn how to manage your taxes, find the best coworking spots, and handle extensions.",
    category: "Nomad",
    prerequisites: [
      "Proof of remote income ($2,000+/mo)",
      "Health insurance",
      "Valid passport (12+ months)",
      "Return flight ticket"
    ],
    tableOfContents: [
      "Visa Types for Remote Workers",
      "Offshore Application Walkthrough",
      "Extension Procedures & Costs",
      "Tax Implications for Nomads",
      "Bali Logistics: Housing & Bikes",
      "Best Coworking Communities"
    ],
    imageUrl: "https://picsum.photos/seed/bali-visa/600/400",
    countryIds: ["indonesia", "bali"]
  }
];
