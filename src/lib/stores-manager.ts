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

    store._initVueInstance(this.vue);
    this.stores[name] = store;
  }

  resetAll () {
    for (const name in this.stores) {
      if (this.stores[name].actions.reset) {
        this.stores[name].actions.reset()
      } else {
        console.warn("Store " + name + " have no reset() function");
      }
    }
  }

  clearAll () {
    for (const name in this.stores) {
      if (this.stores[name].actions.clear) {
        this.stores[name].actions.clear()
      } else {
        console.warn("Store " + name + " have no clear() function");
      }
    }
  }
}

export { StoreManager };
