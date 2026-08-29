export type ComponentName =
  | "Dashboard"
  | "CreateTest"
  | "TestTracking"
  | "TestPreview"
  | "TestConfirmation";

export interface SidebarQuestion {
  id: string;
  label: string;
  status: string;
}