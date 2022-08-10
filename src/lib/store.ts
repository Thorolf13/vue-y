import Vue from 'vue';
import { CombinedVueInstance } from 'vue/types/vue';
import { cloneDeep } from './clone-deep';
import { SaveStrategy } from './save-strategy-enum';

const storeNames: string[] = []

class Store<V> {

  private vueInstance: CombinedVueInstance<Vue, { state: V; }, { set (value: V): void; }, { get: V; }, Record<never, any>, {}>;

  // #############################
  // init
  // #############################

  /**
   *
   * @param name the name of the store, must be unique
   * @param initialValue initial state value
   * @param saveStrategy NONE, SESSION, LOCAL
   */
  constructor (
    public readonly name: string,
    protected readonly initialValue: V,
    public readonly saveStrategy: SaveStrategy = SaveStrategy.NONE
  ) {
    if (storeNames.includes(name)) {
      throw new Error(`Store name ${name} is already used`);
    }
    storeNames.push(name);

    this.vueInstance = this.initVueInstance();
  }

  private getStoreKey (): string {
    return 'STORE/' + this.name;
  }

  private initVueInstance () {
    const instanceName = this.getStoreKey();
    const savedValue = this.loadSave();
    const state = savedValue || this.initialValue;
    const saveCallback = () => this.save();

    return new Vue({
      name: instanceName,
      data: () => ({
        state: state // do not read or write directly, use get and set()
      }),
      computed: {
        get (): V {
          return this.state;
        }
      },
      methods: {
        set (value: V) {
          this.state = value;
          saveCallback();
        }
      }
    });
  }

  // #############################
  // state manipulation functions
  // #############################

  /**
   *
   * @returns {V} the current state
   */
  protected get (): V {
    return cloneDeep(this.vueInstance.get);
  }

  /**
   *
   * @param value the value to be set
   */
  protected set (value: V): void {
    this.vueInstance.set(cloneDeep(value));
  }

  /**
   *
   * @param key the key of the property
   * @param value the value to be set
   */
  protected setProperty<K extends keyof V> (key: K, value: V[K]): void {
    const state = this.get();
    state[key] = value;
    this.set(state);
  }

  /**
   *
   * @param properties partial state properties to be set
   */
  protected setProperties (properties: Partial<V>): void {
    const state = this.get();
    Object.assign(state, properties);
    this.set(state);
  }

  /**
   * reset the state to the initial value
   */
  protected reset (): void {
    this.set(this.initialValue);
  }

  /**
   * set state to null
   */
  protected clear (): void {
    this.set(null);
  }

  // #############################
  // getters and setters
  // #############################

  private defaultGetters = {
    value: () => this.get()
  }

  /**
   * store getters
   */
  public getters = this.defaultGetters;

  private defaultActions = {
    set: (value: V) => this.set(value),
    reset: () => this.reset(),
    clear: () => this.clear()
  }

  /**
   * store actions
   */
  public actions = this.defaultActions;

  /**
   * extends default getters with customs ones
   * @param getters the custom getters, override the default getters if same name
   * @returns default getters and custom getters
   * @example
   * // state:string[]
   * getters = store.extendsGetters({ length: () => this.get().length })
   * // getters:{value:()=>string[], length:()=>number}
   */
  protected extendsGetters<Getters extends { [key: string]: () => any }> (getters: Getters): Store<V>['defaultGetters'] & Getters {
    return {
      ...this.defaultGetters,
      ...getters
    };
  }

  /**
   * extends default actions with customs ones
   * @param actions the custom actions, override the default actions if same name
   * @returns default actions and custom actions
   * @example
   * // state:string[]
   * actions = store.extendsActions({ add: (value:string) => {state = this.get(); state.push(value); this.set(state); })
   * // actions:{set:(string[])=>void, reset:()=>void, clear:()=>void, add:(value:string)=>void}
   */
  protected extendsActions<Actions extends { [key: string]: (value?: any) => any }> (actions: Actions): Store<V>['defaultActions'] & Actions {
    return {
      ...this.defaultActions,
      ...actions
    };
  }

  // #############################
  // storage functions
  // #############################

  private save (): void {
    if (this.saveStrategy === SaveStrategy.NONE) {
      return;
    }

    const state = this.vueInstance.state;
    const serializedState = this.serialize(state);

    if (this.saveStrategy === SaveStrategy.SESSION) {
      sessionStorage.setItem(this.getStoreKey(), serializedState);
    } else if (this.saveStrategy === SaveStrategy.LOCAL) {
      localStorage.setItem(this.getStoreKey(), serializedState);
    }
  }

  private loadSave (): V {
    if (this.saveStrategy === SaveStrategy.NONE) {
      return null;
    }

    let serializedState;
    if (this.saveStrategy === SaveStrategy.SESSION) {
      serializedState = sessionStorage.getItem(this.getStoreKey());
    } else if (this.saveStrategy === SaveStrategy.LOCAL) {
      serializedState = localStorage.getItem(this.getStoreKey());
    }

    return serializedState ? this.deserialize(serializedState) : null;
  }

  /**
   * state serialisation function for session or local storage, default is JSON.stringify, can be overridden
   * @param value the value to be serialized
   * @returns serialized value
   */
  protected serialize (value: V): string {
    return JSON.stringify(value);
  }

  /**
   * state deserialisation function for session or local storage, default is JSON.parse, can be overridden
   * @param value the serialized value
   * @returns parsed value
   */
  protected deserialize (value: string): V {
    return JSON.parse(value);
  }
}

export { Store };
