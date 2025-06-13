"use client"
import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { CompanyData } from "@/lib/types"

interface CompanyState {
  companies: CompanyData[]
  isLoading: boolean
  fetchCompanies: () => Promise<void>
  addCompany: (company: CompanyData) => void
  updateCompany: (company: CompanyData) => void
  deleteCompany: (companyName: string) => void
}

// Initial data to populate the store if empty
const initialCompanies: CompanyData[] = [
  {
    name: "Sylndr",
    country: "Egypt",
    sector: "Automotive E-commerce",
    description:
      "Sylndr is an online marketplace for used cars in Egypt, offering certified pre-owned vehicles with financing options and warranty services.",
    keyPeople: [
      {
        name: "Omar El Defrawy",
        role: "Co-founder and CEO",
      },
      {
        name: "Amr Mazen",
        role: "Co-founder",
      },
    ],
    transactions: [
      {
        type: "Seed Funding",
        amount: "$12.6 million",
        date: "May 2022",
        investors: ["RAED Ventures", "Algebra Ventures", "Nuwa Capital", "1984 Ventures", "Global Founders Capital"],
        details: "Largest pre-seed round in MENA region",
      },
      {
        type: "Pre-Seed Funding",
        amount: "$800,000",
        date: "2021",
        investors: ["Algebra Ventures"],
      },
    ],
    sourceUrl:
      "https://techcrunch.com/2022/05/23/egyptian-startup-sylndr-raises-pre-seed-of-12-6m-for-its-online-used-car-marketplace/",
  },
  {
    name: "Lapaire Glasses",
    country: "Kenya",
    sector: "Healthcare / Eyewear",
    description:
      "Lapaire Glasses is an affordable eyewear company providing quality prescription glasses and eye tests to underserved communities across Africa.",
    keyPeople: [
      {
        name: "Jerome Lapaire",
        role: "Founder and CEO",
      },
    ],
    transactions: [
      {
        type: "Series A Funding",
        amount: "$3 million",
        date: "October 2022",
        investors: ["Investisseurs & Partenaires (I&P)", "Goodwell Investments", "AAIC", "Venture Capital for Africa"],
        details: "Expansion to new African markets",
      },
      {
        type: "Seed Funding",
        amount: "$1.5 million",
        date: "2020",
        investors: ["Investisseurs & Partenaires (I&P)"],
      },
    ],
    sourceUrl: "https://disrupt-africa.com/2022/10/18/kenyan-eyewear-startup-lapaire-raises-3m-series-a-funding-round/",
  },
  {
    name: "Merec Industries",
    country: "Mozambique",
    sector: "Food Manufacturing",
    description:
      "Merec Industries is one of Mozambique's largest food processing companies, specializing in wheat flour, pasta, biscuits, and animal feed production.",
    keyPeople: [
      {
        name: "Prakash Ratilal",
        role: "Chairman",
      },
      {
        name: "Nuno Quelhas",
        role: "CEO",
      },
    ],
    transactions: [
      {
        type: "Investment",
        amount: "$55 million",
        date: "2019",
        investors: ["African Development Bank", "Investment Fund for Developing Countries (IFU)"],
        details: "Expansion of production facilities",
      },
    ],
    sourceUrl:
      "https://www.afdb.org/en/news-and-events/press-releases/mozambique-african-development-bank-approves-15-million-equity-investment-boost-local-food-production-and-create-jobs-33088",
  },
  {
    name: "SanLei",
    country: "Lesotho",
    sector: "Aquaculture",
    description:
      "SanLei is a premium trout farming and processing company operating in the highlands of Lesotho, exporting high-quality trout products to international markets.",
    keyPeople: [
      {
        name: "Willem Schalk van der Merwe",
        role: "Managing Director",
      },
    ],
    transactions: [
      {
        type: "Investment",
        amount: "$7.6 million",
        date: "2018",
        investors: ["Mergence Investment Managers", "Norfund"],
        details: "Expansion of aquaculture operations",
      },
    ],
    sourceUrl: "https://www.norfund.no/investmentdetails/sanlei/",
  },
  {
    name: "Moni-Shop",
    country: "Democratic Republic of Congo (DRC)",
    sector: "E-commerce / Fintech",
    description:
      "Moni-Shop is a digital platform in DRC that combines e-commerce with financial services, allowing users to shop online and access digital payment solutions.",
    keyPeople: [
      {
        name: "Serge Nawej",
        role: "Founder and CEO",
      },
    ],
    transactions: [
      {
        type: "Seed Funding",
        amount: "Undisclosed",
        date: "2022",
        investors: ["Kinshasa Digital", "Local angel investors"],
        details: "Initial funding for platform development and market expansion",
      },
    ],
    sourceUrl: "https://www.monishop.cd/",
  },
]

export const useCompanyStore = create<CompanyState>()(
  persist(
    (set, get) => ({
      companies: [],
      isLoading: false,

      fetchCompanies: async () => {
        set({ isLoading: true })

        try {
          // Simulate API call delay
          await new Promise((resolve) => setTimeout(resolve, 500))

          // Check if we already have companies
          const { companies } = get()
          if (companies.length === 0) {
            // If no companies, use initial data
            set({ companies: initialCompanies })
          }
        } catch (error) {
          console.error("Error fetching companies:", error)
        } finally {
          set({ isLoading: false })
        }
      },

      addCompany: (company) => {
        set((state) => {
          // Check if company already exists
          const exists = state.companies.some((c) => c.name === company.name)
          if (exists) {
            // Update existing company
            return {
              companies: state.companies.map((c) => (c.name === company.name ? company : c)),
            }
          } else {
            // Add new company
            return { companies: [...state.companies, company] }
          }
        })
      },

      updateCompany: (company) => {
        set((state) => ({
          companies: state.companies.map((c) => (c.name === company.name ? company : c)),
        }))
      },

      deleteCompany: (companyName) => {
        set((state) => ({
          companies: state.companies.filter((c) => c.name !== companyName),
        }))
      },
    }),
    {
      name: "company-storage", // unique name for localStorage
      skipHydration: true, // important for Next.js to avoid hydration mismatch
    },
  ),
)
