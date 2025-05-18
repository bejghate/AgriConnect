// Types for financial services data
export interface FinancialInstitution {
  id: string;
  name: string;
  description: string;
  logo: string;
  type: 'bank' | 'microfinance' | 'cooperative' | 'ngo' | 'government' | 'other';
  servicesOffered: string[];
  operatingRegions: string[];
  contactEmail?: string;
  contactPhone?: string;
  website?: string;
  address?: {
    street?: string;
    city: string;
    region: string;
    country: string;
  };
  isActive: boolean;
}

export interface FinancialProduct {
  id: string;
  institutionId: string;
  institution?: FinancialInstitution;
  name: string;
  description: string;
  shortDescription?: string;
  type: 'loan' | 'credit' | 'grant' | 'subsidy' | 'insurance' | 'savings' | 'other';
  category: 'equipment' | 'inputs' | 'land' | 'livestock' | 'infrastructure' | 'working_capital' | 'crop_insurance' | 'livestock_insurance' | 'weather_insurance' | 'savings' | 'other';
  minAmount?: number;
  maxAmount?: number;
  currency: string;
  interestRate?: number;
  interestType?: 'fixed' | 'variable' | 'reducing_balance' | 'flat';
  minTerm?: number;
  maxTerm?: number;
  termUnit: 'days' | 'weeks' | 'months' | 'years';
  repaymentFrequency?: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'biannually' | 'annually' | 'custom' | 'none';
  gracePeriod?: number;
  eligibilityCriteria?: {
    minAge?: number;
    maxAge?: number;
    minFarmSize?: number;
    maxFarmSize?: number;
    farmSizeUnit?: string;
    minFarmingExperience?: number;
    requiredDocuments?: string[];
    otherRequirements?: string[];
  };
  requiredDocuments: string[];
  applicationProcess?: string;
  processingTime?: number;
  fees?: {
    applicationFee?: number;
    serviceFee?: number;
    insuranceFee?: number;
    otherFees?: {
      name: string;
      amount: number;
      type: 'fixed' | 'percentage';
    }[];
  };
  benefits: string[];
  isActive: boolean;
  imageUrl?: string;
  tags?: string[];
}

export interface FinancingApplication {
  id: string;
  userId: string;
  productId: string;
  product?: FinancialProduct;
  institutionId: string;
  institution?: FinancialInstitution;
  applicationNumber: string;
  amount: number;
  currency: string;
  purpose: string;
  term?: number;
  status: 'draft' | 'submitted' | 'under_review' | 'additional_info_required' | 'approved' | 'conditionally_approved' | 'rejected' | 'cancelled' | 'disbursed' | 'closed';
  submissionDate?: string;
  decisionDate?: string;
  disbursementDate?: string;
  documents?: {
    id: string;
    name: string;
    type: string;
    url: string;
    uploadDate: string;
  }[];
  businessPlan?: {
    description: string;
    expectedRevenue: number;
    expectedCosts: number;
    timeline: string;
  };
  farmDetails?: {
    size: number;
    sizeUnit: string;
    location: string;
    crops?: string[];
    livestock?: string[];
    assets?: {
      name: string;
      value: number;
    }[];
  };
  financialHistory?: {
    previousLoans?: {
      lender: string;
      amount: number;
      status: 'active' | 'completed' | 'defaulted';
    }[];
    annualRevenue?: number;
    annualExpenses?: number;
  };
  collateral?: {
    type: string;
    description: string;
    value: number;
    documents?: string[];
  }[];
  approvedAmount?: number;
  approvedTerm?: number;
  interestRate?: number;
  repaymentSchedule?: {
    frequency: string;
    nextPaymentDate: string;
    totalPayments: number;
    payments: {
      number: number;
      dueDate: string;
      amount: number;
      principal: number;
      interest: number;
      fees: number;
      status: 'pending' | 'paid' | 'overdue' | 'partial';
      paidAmount?: number;
      paidDate?: string;
    }[];
  };
  comments?: {
    id: string;
    authorId: string;
    authorName: string;
    authorRole: string;
    content: string;
    createdAt: string;
    isInternal: boolean;
    attachments?: string[];
  }[];
  createdAt: string;
  updatedAt: string;
}

// Sample data for financial institutions
export const financialInstitutions: FinancialInstitution[] = [
  {
    id: 'inst-1',
    name: 'Banque Agricole du Sénégal',
    description: 'La Banque Agricole du Sénégal est une institution financière spécialisée dans le financement du secteur agricole et rural.',
    logo: 'https://via.placeholder.com/150?text=BA',
    type: 'bank',
    servicesOffered: ['loans', 'savings', 'insurance'],
    operatingRegions: ['Dakar', 'Thiès', 'Saint-Louis', 'Kaolack'],
    contactEmail: 'contact@banqueagricole.sn',
    contactPhone: '+221 33 889 55 00',
    website: 'https://www.banqueagricole.sn',
    address: {
      street: '31, Rue Amadou Assane Ndoye',
      city: 'Dakar',
      region: 'Dakar',
      country: 'Sénégal'
    },
    isActive: true
  },
  {
    id: 'inst-2',
    name: 'PAMECAS - Microfinance',
    description: 'PAMECAS est une institution de microfinance qui offre des services financiers adaptés aux besoins des populations à faibles revenus.',
    logo: 'https://via.placeholder.com/150?text=PAMECAS',
    type: 'microfinance',
    servicesOffered: ['microcredit', 'savings', 'money_transfer'],
    operatingRegions: ['Dakar', 'Thiès', 'Diourbel', 'Fatick'],
    contactPhone: '+221 33 869 76 76',
    website: 'https://www.pamecas.sn',
    isActive: true
  },
  {
    id: 'inst-3',
    name: 'Coopérative Agricole de Kaolack',
    description: 'Coopérative offrant des services financiers adaptés aux agriculteurs de la région de Kaolack.',
    logo: 'https://via.placeholder.com/150?text=CAK',
    type: 'cooperative',
    servicesOffered: ['group_loans', 'savings', 'equipment_financing'],
    operatingRegions: ['Kaolack', 'Kaffrine'],
    contactPhone: '+221 33 941 22 33',
    isActive: true
  }
];

// Sample data for financial products
export const financialProducts: FinancialProduct[] = [
  {
    id: 'prod-1',
    institutionId: 'inst-1',
    name: 'Crédit Équipement Agricole',
    description: 'Financement pour l\'achat de matériel et d\'équipements agricoles modernes pour améliorer la productivité de votre exploitation.',
    shortDescription: 'Financement d\'équipements agricoles avec des conditions avantageuses',
    type: 'loan',
    category: 'equipment',
    minAmount: 100000,
    maxAmount: 5000000,
    currency: 'XOF',
    interestRate: 8.5,
    interestType: 'reducing_balance',
    minTerm: 6,
    maxTerm: 36,
    termUnit: 'months',
    repaymentFrequency: 'monthly',
    gracePeriod: 1,
    eligibilityCriteria: {
      minAge: 18,
      minFarmingExperience: 2,
      requiredDocuments: ['ID Card', 'Proof of Residence', 'Farm Ownership/Lease Document']
    },
    requiredDocuments: [
      'Pièce d\'identité',
      'Justificatif de domicile',
      'Document de propriété ou bail agricole',
      'Devis de l\'équipement à financer',
      'Historique d\'activité agricole'
    ],
    processingTime: 7,
    benefits: [
      'Taux d\'intérêt préférentiel',
      'Période de grâce d\'un mois',
      'Possibilité de remboursement anticipé sans pénalités'
    ],
    isActive: true,
    imageUrl: 'https://via.placeholder.com/400x200?text=Agricultural+Equipment',
    tags: ['équipement', 'modernisation', 'productivité']
  },
  {
    id: 'prod-2',
    institutionId: 'inst-1',
    name: 'Assurance Récolte',
    description: 'Protection contre les pertes de récoltes dues aux aléas climatiques comme la sécheresse, les inondations ou les parasites.',
    shortDescription: 'Protégez vos cultures contre les risques climatiques',
    type: 'insurance',
    category: 'crop_insurance',
    minAmount: 25000,
    maxAmount: 1000000,
    currency: 'XOF',
    termUnit: 'months',
    requiredDocuments: [
      'Pièce d\'identité',
      'Justificatif de domicile',
      'Document de propriété ou bail agricole',
      'Historique des cultures',
      'Photos de l\'exploitation'
    ],
    processingTime: 5,
    benefits: [
      'Indemnisation rapide en cas de sinistre',
      'Couverture adaptée aux cultures locales',
      'Évaluation des dommages par des experts'
    ],
    isActive: true,
    imageUrl: 'https://via.placeholder.com/400x200?text=Crop+Insurance',
    tags: ['assurance', 'récolte', 'climat', 'protection']
  },
  {
    id: 'prod-3',
    institutionId: 'inst-2',
    name: 'Microcrédit Intrants Agricoles',
    description: 'Financement à court terme pour l\'achat de semences, engrais et produits phytosanitaires pour la saison agricole.',
    shortDescription: 'Financement rapide pour vos intrants agricoles',
    type: 'credit',
    category: 'inputs',
    minAmount: 50000,
    maxAmount: 500000,
    currency: 'XOF',
    interestRate: 12,
    interestType: 'flat',
    minTerm: 3,
    maxTerm: 12,
    termUnit: 'months',
    repaymentFrequency: 'monthly',
    requiredDocuments: [
      'Pièce d\'identité',
      'Justificatif de domicile',
      'Devis des intrants à acheter'
    ],
    processingTime: 3,
    benefits: [
      'Décaissement rapide',
      'Procédure simplifiée',
      'Accompagnement technique'
    ],
    isActive: true,
    imageUrl: 'https://via.placeholder.com/400x200?text=Agricultural+Inputs',
    tags: ['intrants', 'semences', 'engrais', 'rapide']
  },
  {
    id: 'prod-4',
    institutionId: 'inst-3',
    name: 'Épargne Agricole Programmée',
    description: 'Solution d\'épargne adaptée aux cycles agricoles permettant de constituer un capital pour les investissements futurs.',
    shortDescription: 'Épargnez selon votre cycle agricole',
    type: 'savings',
    category: 'savings',
    currency: 'XOF',
    interestRate: 4.5,
    interestType: 'fixed',
    termUnit: 'months',
    requiredDocuments: [
      'Pièce d\'identité',
      'Justificatif de domicile'
    ],
    benefits: [
      'Taux d\'intérêt attractif',
      'Flexibilité des dépôts',
      'Possibilité de retrait partiel en cas d\'urgence'
    ],
    isActive: true,
    imageUrl: 'https://via.placeholder.com/400x200?text=Agricultural+Savings',
    tags: ['épargne', 'investissement', 'sécurité']
  },
  {
    id: 'prod-5',
    institutionId: 'inst-2',
    name: 'Assurance Bétail',
    description: 'Protection contre les pertes de bétail dues aux maladies, accidents ou catastrophes naturelles.',
    shortDescription: 'Protégez votre bétail contre les risques',
    type: 'insurance',
    category: 'livestock_insurance',
    minAmount: 50000,
    maxAmount: 2000000,
    currency: 'XOF',
    termUnit: 'months',
    requiredDocuments: [
      'Pièce d\'identité',
      'Justificatif de domicile',
      'Certificats vétérinaires',
      'Photos du bétail',
      'Registre d\'élevage'
    ],
    processingTime: 5,
    benefits: [
      'Couverture contre les maladies courantes',
      'Indemnisation en cas de mortalité',
      'Services vétérinaires inclus'
    ],
    isActive: true,
    imageUrl: 'https://via.placeholder.com/400x200?text=Livestock+Insurance',
    tags: ['assurance', 'bétail', 'élevage', 'protection']
  }
];

// Sample data for financing applications
export const financingApplications: FinancingApplication[] = [
  {
    id: 'app-1',
    userId: 'user-1',
    productId: 'prod-1',
    institutionId: 'inst-1',
    applicationNumber: 'FIN-2023-001',
    amount: 2500000,
    currency: 'XOF',
    purpose: 'Achat d\'un système d\'irrigation goutte-à-goutte pour 2 hectares de culture maraîchère',
    term: 24,
    status: 'approved',
    submissionDate: '2023-06-15T10:30:00Z',
    decisionDate: '2023-06-22T14:45:00Z',
    disbursementDate: '2023-06-25T09:15:00Z',
    documents: [
      {
        id: 'doc-1',
        name: 'Pièce d\'identité',
        type: 'image/jpeg',
        url: 'https://via.placeholder.com/300x200?text=ID+Card',
        uploadDate: '2023-06-14T11:20:00Z'
      },
      {
        id: 'doc-2',
        name: 'Devis système irrigation',
        type: 'application/pdf',
        url: 'https://via.placeholder.com/300x200?text=Quote',
        uploadDate: '2023-06-14T11:25:00Z'
      }
    ],
    businessPlan: {
      description: 'Culture de tomates et poivrons sur 2 hectares avec système d\'irrigation moderne',
      expectedRevenue: 5000000,
      expectedCosts: 2000000,
      timeline: '12 mois'
    },
    farmDetails: {
      size: 5,
      sizeUnit: 'hectares',
      location: 'Région de Thiès',
      crops: ['Tomates', 'Poivrons', 'Oignons']
    },
    approvedAmount: 2500000,
    approvedTerm: 24,
    interestRate: 8.5,
    repaymentSchedule: {
      frequency: 'monthly',
      nextPaymentDate: '2023-08-25T00:00:00Z',
      totalPayments: 24,
      payments: [
        {
          number: 1,
          dueDate: '2023-07-25T00:00:00Z',
          amount: 113750,
          principal: 104167,
          interest: 9583,
          fees: 0,
          status: 'paid',
          paidAmount: 113750,
          paidDate: '2023-07-24T10:15:00Z'
        },
        {
          number: 2,
          dueDate: '2023-08-25T00:00:00Z',
          amount: 113750,
          principal: 104167,
          interest: 9583,
          fees: 0,
          status: 'pending'
        }
      ]
    },
    comments: [
      {
        id: 'comment-1',
        authorId: 'staff-1',
        authorName: 'Amadou Diop',
        authorRole: 'Chargé de crédit',
        content: 'Dossier complet et projet viable. Recommandation favorable.',
        createdAt: '2023-06-20T09:30:00Z',
        isInternal: true
      },
      {
        id: 'comment-2',
        authorId: 'user-1',
        authorName: 'Moussa Sow',
        authorRole: 'Demandeur',
        content: 'Merci pour l\'approbation rapide de ma demande.',
        createdAt: '2023-06-22T15:20:00Z',
        isInternal: false
      }
    ],
    createdAt: '2023-06-14T10:15:00Z',
    updatedAt: '2023-07-24T10:15:00Z'
  }
];

// Financial education content
export interface FinancialEducationContent {
  id: string;
  title: string;
  description: string;
  content: string;
  category: 'budgeting' | 'credit' | 'savings' | 'insurance' | 'investment' | 'general';
  level: 'beginner' | 'intermediate' | 'advanced';
  imageUrl?: string;
  videoUrl?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

// Sample financial education content
export const financialEducationContent: FinancialEducationContent[] = [
  {
    id: 'edu-1',
    title: 'Comprendre les bases du crédit agricole',
    description: 'Guide d\'introduction aux principes fondamentaux du crédit agricole et comment l\'utiliser efficacement.',
    content: `# Comprendre les bases du crédit agricole

Le crédit agricole est un outil financier essentiel pour les agriculteurs qui souhaitent développer leur exploitation. Ce guide vous aidera à comprendre les concepts de base.

## Qu'est-ce que le crédit agricole?

Le crédit agricole est un prêt spécifiquement conçu pour répondre aux besoins des agriculteurs et des entreprises agricoles. Il prend en compte les spécificités du secteur, notamment la saisonnalité des revenus.

## Types de crédits agricoles

1. **Crédit de campagne**: Financement à court terme pour couvrir les coûts des intrants (semences, engrais, etc.)
2. **Crédit d'équipement**: Financement à moyen ou long terme pour l'achat de matériel agricole
3. **Crédit d'investissement**: Financement à long terme pour des projets d'infrastructure (irrigation, bâtiments, etc.)

## Comment évaluer vos besoins en financement

Avant de demander un crédit, il est important de:
- Calculer précisément le montant dont vous avez besoin
- Évaluer votre capacité de remboursement
- Déterminer le calendrier de remboursement qui correspond à vos cycles de revenus

## Conseils pour une demande de crédit réussie

- Préparez un plan d'affaires solide
- Rassemblez tous les documents nécessaires
- Démontrez votre expérience et vos compétences
- Présentez des garanties si possible
- Montrez comment le crédit améliorera votre productivité et vos revenus`,
    category: 'credit',
    level: 'beginner',
    imageUrl: 'https://via.placeholder.com/800x400?text=Agricultural+Credit+Basics',
    tags: ['crédit', 'financement', 'bases', 'agriculture'],
    createdAt: '2023-05-10T08:00:00Z',
    updatedAt: '2023-05-10T08:00:00Z'
  },
  {
    id: 'edu-2',
    title: 'Gérer efficacement votre budget agricole',
    description: 'Techniques et outils pour planifier et suivre votre budget d\'exploitation agricole.',
    content: `# Gérer efficacement votre budget agricole

Une bonne gestion financière est essentielle pour la réussite de votre exploitation agricole. Ce guide vous présente des méthodes pratiques pour gérer votre budget.

## Pourquoi établir un budget agricole?

Un budget bien planifié vous permet de:
- Anticiper vos besoins financiers
- Prendre des décisions éclairées
- Suivre vos performances
- Identifier les opportunités d'amélioration
- Préparer vos demandes de financement

## Composantes d'un budget agricole

### Revenus
- Ventes de produits agricoles
- Subventions et aides
- Autres sources de revenus

### Dépenses
- Coûts variables (semences, engrais, carburant, main-d'œuvre saisonnière)
- Coûts fixes (loyer, assurances, salaires permanents)
- Investissements (équipements, infrastructures)
- Remboursements de prêts

## Outils de gestion budgétaire

- Cahier de comptes simple
- Tableurs (Excel, Google Sheets)
- Applications mobiles de gestion agricole
- Logiciels spécialisés

## Conseils pratiques

- Séparez vos finances personnelles et professionnelles
- Enregistrez toutes les transactions
- Analysez régulièrement vos résultats
- Ajustez votre budget en fonction des saisons
- Prévoyez une réserve pour les imprévus`,
    category: 'budgeting',
    level: 'beginner',
    imageUrl: 'https://via.placeholder.com/800x400?text=Farm+Budget+Management',
    tags: ['budget', 'gestion financière', 'planification', 'agriculture'],
    createdAt: '2023-05-15T09:30:00Z',
    updatedAt: '2023-05-15T09:30:00Z'
  }
];

// Financial calculator types
export enum CalculatorType {
  LOAN = 'loan',
  INSURANCE = 'insurance',
  SAVINGS = 'savings'
}
