import { VueConstructor } from "vue";
import { Store } from "./store";

class StoreManager {
  private stores: { [key: string]: Store<any> } = {};


  constructor (private vue: VueConstructor) {

  }

  public registerStore (store: Store<any>) {
    const name = store.name;
    if (this.stores[name] !== undefined) {
      throw new Error(`Store name ${name} is already used`);
    }

    store.initVueInstance(this.vue);
    this.stores[name] = store;
  }
}

export { StoreManager };
