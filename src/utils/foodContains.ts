import { ItemProps } from "../components/Item";

// This function checks if there is food on the plate 
export function foodContains(items: ItemProps[], foodName: string){
  for (const item of items) {
    if (item.name.toLocaleLowerCase() === foodName.toLocaleLowerCase()) {
      return true;
    }
  }

  return false;
}