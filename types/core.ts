// enum
export type Roles = "ADVISOR";
// export type UserStatus = "USER" | "NOT_USER";

// type
export type ErrorRes = { 
  message: string 
};
export interface SuccessRes {
  success: boolean;
  message: string;
}
export interface FileType {
  id: string;
  url: string;
}
