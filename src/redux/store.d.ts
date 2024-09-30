import { RoleStore } from './reducers/role-reducer';
import { UserStore } from './reducers/user-reducer';

export type RBACStore = {
  userReducer: UserStore;
  roleReducer: RoleStore;
};

declare module 'react-redux' {
  export function useSelector<TState = RBACStore, TSelected = unknown>(
    selector: (state: TState) => TSelected,
    equalityFn?: (left: TSelected, right: TSelected) => boolean
  ): TSelected;
}
