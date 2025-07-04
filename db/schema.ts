import { pgTable, serial, text } from "drizzle-orm/pg-core";


export const usersTable = pgTable('users_table', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  age: text('age').notNull(),
  email: text('email').notNull().unique(),
})

export const companiesTable = pgTable('companies_table', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  content: text('content').notNull(),
})




export const companies = pgTable("companies", {
  id: serial("id").primaryKey(),

  companiesName: text("companies_name").notNull(),
  headquaters: text("headquaters").notNull(),
  website: text("website").notNull(),

  shortCompanyDescription: text("short_company_description").notNull(),
  longCompanyDescription: text("long_company_description").notNull(),

  numberOfEmployees: text("number_of_employees").notNull(),

  sector: text("sector").notNull(), 
  subSector: text("sub_sector").notNull(),

  shareholders: text("shareholders").notNull(),
  keyPeople: text("key_people").notNull(),

  ownershipTransactions: text("ownership_transactions").notNull(),
  corporateAcquisitions: text("corporate_acquisitions").notNull(),
  corporateDivestiture: text("corporate_divestiture").notNull(),

  investmentStage: text("investment_stage").notNull(),
  tag: text("tag").notNull(),

  source1: text("source_1").notNull(),
  source2: text("source_2"),
  source3: text("source_3"),
  source4: text("source_4"),
  source5: text("source_5"),
});
