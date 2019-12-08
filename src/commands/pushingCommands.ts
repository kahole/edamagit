import { MagitPicker } from "../menus/magitPicker";
import { PushingMenu } from "../menus/pushing/pushingMenu";


export function pushing() {
  MagitPicker.showMagitPicker(new PushingMenu());
}