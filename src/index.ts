// import Vue from "vue";
import { SaveStrategy } from "./lib/save-strategy-enum";
import { Store } from "./lib/store";
import { StoreManager } from "./lib/stores-manager";

export { Store, SaveStrategy };

export default {
  install (Vue: any, options: { stores: Store<any>[] }) {
    const storeManager = new StoreManager(Vue);

    for (const store of options.stores) {
      storeManager.registerStore(store);
    }


    Vue.$vuey = storeManager;
    Vue.prototype.$vuey = storeManager;
  }
}
