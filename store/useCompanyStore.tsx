import { create } from "zustand";
import { persist } from "zustand/middleware";
type Company = {
  name: string;
  data: string; // JSON stringified full data
};

type CompanyState = {
  companies: Company[];
  isLoading: boolean;
  fetchCompanies: () => Promise<void>;
  addCompany: (company: Company) => void;
  updateCompany: (company: Company) => void;
  deleteCompany: (companyName: string) => void;
};

export const useCompanyStore = create<CompanyState>()(
  persist(
    (set, get) => ({
      companies: [],
      isLoading: false,

      fetchCompanies: async () => {
        set({ isLoading: true });

        try {
          await new Promise((resolve) => setTimeout(resolve, 500));
          const { companies } = get();
          if (companies.length === 0) {
            // you can use default data here if needed
            set({ companies: [] });
          }
        } catch (error) {
          console.error("Error fetching companies:", error);
        } finally {
          set({ isLoading: false });
        }
      },

      addCompany: (company) => {
        set((state) => {
          const exists = state.companies.some((c) => c.name === company.name);
          if (exists) {
            return {
              companies: state.companies.map((c) =>
                c.name === company.name ? company : c,
              ),
            };
          } else {
            return { companies: [...state.companies, company] };
          }
        });
      },

      updateCompany: (company) => {
        set((state) => ({
          companies: state.companies.map((c) =>
            c.name === company.name ? company : c,
          ),
        }));
      },

      deleteCompany: (companyName) => {
        set((state) => ({
          companies: state.companies.filter((c) => c.name !== companyName),
        }));
      },
    }),
    {
      name: "companies",
      skipHydration: true,
    },
  ),
);
