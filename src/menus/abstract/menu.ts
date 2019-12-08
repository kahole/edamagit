import { MenuItem } from "./menuItem";

export interface Menu {
  title?: string;
  items: MenuItem[];
  onDidAcceptItems(acceptedItems: readonly MenuItem[]): Menu | undefined;
  isSwitchesMenu?: boolean;
}