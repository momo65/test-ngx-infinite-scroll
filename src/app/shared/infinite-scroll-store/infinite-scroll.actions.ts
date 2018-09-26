import {Action} from '@ngrx/store';
//The types of the actions of the infiniteScroll's store
export const INITIALIZE_SCROLL="INITIALIZE_SCROLL";
export const SET_NEXT_SCROLL="SET_NEXT_SCROLL";
export const SET_PREV_SCROLL="SET_PREV_SCROLL";
export const UPDATE_SCROLL="UPDATE_SCROLL";
export const SET_OPTIONS="SET_OPTIONS";
//The actions of the infiniteScroll's store
export class InitializeScroll implements Action{
  readonly type=INITIALIZE_SCROLL;

  constructor(public payload:{total:number,data:any[],initialSize:number,controlSize:number,addedSize:number}){}
}

export class SetNextScroll implements Action{
  readonly type=SET_NEXT_SCROLL;
}

export class SetPrevScroll implements Action{
  readonly type=SET_PREV_SCROLL;
}

export class UpdateScroll implements Action{
  readonly type=UPDATE_SCROLL;

  constructor(public payload:{total:number,data:any[]}){}
}

export class SetOptions implements Action{
  readonly type=SET_OPTIONS;

  constructor(public payload:{controlSize:number,initialSize:number,addedSize:number}){}
}

export type ISActions=InitializeScroll|SetNextScroll|SetPrevScroll|UpdateScroll|SetOptions;
