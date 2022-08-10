import { Store } from "./store";

class StoresDirectory<_Stores extends { [key: string]: Store<any> }>{

  constructor (public stores: _Stores) { }

  resetAll (): void {
    Object.values(this.stores).forEach(store => store.actions.reset());
  }

  clearAll (): void {
    Object.values(this.stores).forEach(store => store.actions.clear());
  }
}

export { StoresDirectory };
