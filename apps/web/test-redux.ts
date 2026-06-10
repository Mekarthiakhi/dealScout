import { store } from './src/store/index';
import { setQuery } from './src/store/slices/searchSlice';

console.log('Initial state:', store.getState().search.query);
store.dispatch(setQuery('iphone'));
console.log('State after setQuery:', store.getState().search.query);
