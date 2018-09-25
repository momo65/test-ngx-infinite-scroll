import {ActionReducerMap} from '@ngrx/Store';

import * as fromIS from '../shared/infinite-scroll-store/infinite-scroll.reducers';

export interface AppState{
  infiniteScroll:fromIS.State;
}

export const reducers:ActionReducerMap<AppState>={ //same shape as in app.module in StoreModule.forRoot
  infiniteScroll:fromIS.infiniteScrollReducer
};
