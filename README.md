# Vue-y

vue-y is a centralized state manager

## why vue-y ?

vue-y is an alternative to vuex
main diffrence is vuey use class **with typing**

## install

`npm install --save vue-y`

## how to use

### store

```ts
//my-store.ts
class MyClass {
  a?: boolean;

  b?: number;

  c?: string;

  d?: Date;
}

const intialValue:MyClass = {};

const myStore = new Store<MyClass>('storeName', intialValue);

export { myStore, MyClass };


//main.ts
import VueY from 'vue-y';
import { myStore } from './my-store.ts';

Vue.use(VueY, {
  stores: [
    myStore
  ]
});
```

#### custom getters and actions

```ts
class MyStore extends Store<MyClass> {
  getters = {
    ...super.getters,
    getA: () => {
      return this.get().a;
    }
  }

  actions = {
    ...super.actions,
    setA: (value:boolean) => {
      this.setProperty('a', value);
    },
    loadFromApi: () => {
      return apiLoad().then((result: MyClass) => {
        this.set(result);
        return result;
      });
    }
  }
}

const intialValue:MyClass = {};
const myStore = new MyStore('storeName', intialValue);
```

#### save and load

stores can be automaticly saved in localStorage or sessionStorage

```ts
const intialValue:MyClass = {};

const myStore = new Store<MyClass>('storeName', intialValue, SaveStrategy.SESSION);
```

custom serialization and deserialisation can be defined

```ts
class MyStore extends Store<MyClass> {
  serialize(state:MyClass):string{
    // todo
  }
  deserialize(stateStr:string):MyClass{
    // todo
  }
}

const intialValue:MyClass = {};
const myStore = new MyStore('storeName', intialValue, SaveStrategy.LOCAL);
```

### vue component usage

```ts
import { myStore, MyClass } from '@/store/my-store';

export default Vue.extend({
  name: 'MyComponent',
  computed: {
    testValue: myStore.getters.value
  },
  created () {
    myStore.actions.loadFromApi().then(()=> console.log('loaded'));
  },
  methods: {
    write (val: MyClass) {
      myStore.actions.set(val);
    },
    toggleA () {
      myStore.actions.setA(!this.testValue.a);
    }
  }
});
```