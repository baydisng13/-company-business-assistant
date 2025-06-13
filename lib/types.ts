export interface Transaction {
  type: string
  amount?: string
  date?: string
  investors?: string[]
  details?: string
}

export interface KeyPerson {
  name: string
  role: string
}

export interface CompanyData {
  name: string
  country: string
  sector: string
  description: string
  keyPeople: KeyPerson[]
  transactions: Transaction[] | null
  sourceUrl: string
}
