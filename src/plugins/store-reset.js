import _cloneDeep from 'lodash/cloneDeep'

export default function resetStore({ store }) {
  const initialState = _cloneDeep(store.$state)
  store.$reset = () => store.$patch(_cloneDeep(initialState))
}
