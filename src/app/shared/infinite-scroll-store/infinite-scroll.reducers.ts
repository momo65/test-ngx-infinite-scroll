import * as isActions from './infinite-scroll.actions';

export interface State{
  total:number,
  reachedDown:number,
  reachedUp:number,
  scrollDDistance:number,
  scrollUDistance:number,
  data:any[],
  dataDisplay:any[],
  initialSize:number,
  controlSize:number,
  addedSize:number
};

const initialState:State={
  total:0,
  reachedDown:0,
  reachedUp:0,
  scrollDDistance:10,
  scrollUDistance:0,
  data:[],
  dataDisplay:[],
  initialSize:0,//how many we will charge at the beginning
  controlSize:0,//how many the html control can display at once
  addedSize:10 // how many to add each scroll
};

export function infiniteScrollReducer(state=initialState,action:isActions.ISActions){
  switch(action.type){
    case isActions.INITIALIZE_SCROLL:
      let total=action.payload.total;
      let dataI=[...action.payload.data];
      let initSize=action.payload.initialSize;
      let ctrlSize=action.payload.controlSize;
      let addSize=action.payload.addedSize;
      let dDisplay=[];
      let scrollDDI;
      let rd;
      if(total-initSize<0){
        rd=total-1;
        scrollDDI=10;
      }else{
        scrollDDI=addSize/(total-initSize)+(initSize-ctrlSize)/((initSize/ctrlSize)*total);
        //*(initSize/ctrlSize) to calculate the average distance.
        rd=initSize-1;
      }
      for(let i=0;i<=rd;i++){
        dDisplay.push(dataI[i]);
      }
      return {
        ...state,total:total,reachedDown:rd,reachedUp:0,scrollDDistance:scrollDDI,scrollUDistance:0,data:dataI,
        dataDisplay:[...dDisplay],controlSize:ctrlSize,addedSize:addSize,initialSize:initSize
      };
    case isActions.SET_NEXT_SCROLL:
      let rdNS=state.reachedDown+state.addedSize;
      let ruNS=state.reachedUp+Math.floor(state.addedSize/2);//ruNS increments half the pace rdNS increments
      //to ensure we can see some previous elements when we scroll down.
      if(rdNS<state.total){
        if(rdNS-(state.initialSize-1)<0){
          rdNS=state.initialSize-1;
        }
      }else{
        rdNS=state.total-1;
      }
      if(ruNS>=0){
        if(ruNS+state.initialSize>state.total){
          ruNS=state.total-state.initialSize;
        }
      }else{
        ruNS=0;
      }
      let dDisplayN=[];
      for(let i=ruNS;i<=rdNS;i++){
        dDisplayN.push(state.data[i]);
      }
      console.log(dDisplayN);
      let scrollDD=state.scrollDDistance-state.addedSize/(state.total-rdNS)-(state.initialSize-state.controlSize)/
      ((state.initialSize/state.controlSize)*state.total);
      let scrollUD=state.scrollUDistance+state.addedSize/(state.total-rdNS)+(state.initialSize-state.controlSize)/
      ((state.initialSize/state.controlSize)*state.total);
      console.log(scrollDD);
      return {
        ...state,reachedDown:rdNS,reachedUp:ruNS,scrollDDistance:scrollDD,scrollUDistance:scrollUD,dataDisplay:[...dDisplayN]
      };
    case isActions.SET_PREV_SCROLL:
      let rdPS=state.reachedDown-Math.floor(state.addedSize/2);//rdPS increments half the pace ruPS increments
      let ruPS=state.reachedUp-state.addedSize;
      if(rdPS<state.total){
        if(rdPS-state.initialSize+1<0){
          rdPS=state.initialSize-1;
        }
      }else{
        rdPS=state.total-1;
      }
      if(ruPS>=0){
        if(ruPS+state.initialSize>state.total){
          ruPS=state.total-state.initialSize;
        }
      }else{
        ruPS=0;
      }
      let dDisplayP=[];
      for(let i=ruPS;i<=rdPS;i++){
        dDisplayP.push(state.data[i]);
      }
      console.log(dDisplayP);
      let scrollDDis=state.scrollDDistance+state.addedSize/(ruPS)+(state.initialSize-state.controlSize)/
      ((state.initialSize/state.controlSize)*state.total);
      let scrollUDis=state.scrollUDistance-state.addedSize/(ruPS)-(state.initialSize-state.controlSize)/
      ((state.initialSize/state.controlSize)*state.total);
      console.log(scrollUDis);
      return {
        ...state,reachedDown:rdPS,reachedUp:ruPS,scrollDDistance:scrollDDis,scrollUDistance:scrollUDis,
        dataDisplay:[...dDisplayP]
      };
    case isActions.UPDATE_SCROLL:
      let totalU=action.payload.total;
      let dataU=[...action.payload.data];
      let dDisplayU=[];
      let scrollDDUpd;
      let scrollUDUpd;
      let rdUpd;
      let ruUpd;
      if(totalU-state.total>0){
        if(state.reachedDown==state.total-1){
          rdUpd=state.reachedDown+state.addedSize;
          ruUpd=state.reachedUp+Math.floor(state.addedSize/2);//ruUpd increments half the pace rdUpd increments
          if(rdUpd<totalU){
            if(rdUpd-(state.initialSize-1)<0){
              rdUpd=state.initialSize-1;
            }
          }else{
            rdUpd=totalU-1;
          }
          if(ruUpd>=0){
            if(ruUpd+state.initialSize>totalU){
              ruUpd=totalU-state.initialSize;
            }
          }else{
            ruUpd=0;
          }
        }else{
          rdUpd=state.reachedDown;
          ruUpd=state.reachedUp;
        }
        scrollDDUpd=state.scrollDDistance-state.addedSize/(totalU-state.reachedDown-1)-
        (state.initialSize-state.controlSize)/((state.initialSize/state.controlSize)*totalU);
        //*(state.initialSize/state.controlSize) to calculate the average because we don't know where the scroll reached exactly.
        scrollUDUpd=state.scrollUDistance;
      }else if(totalU-state.total<0){
        if(state.reachedDown>=totalU){
          rdUpd=state.reachedDown;
          ruUpd=state.reachedUp;
          while(rdUpd>=totalU){//to correct rdUpd's value
            rdUpd=rdUpd-Math.floor(state.addedSize/2);
            ruUpd=ruUpd-state.addedSize;
            if(rdUpd<totalU){
              if((rdUpd-state.initialSize+1)<0){
                rdUpd=state.initialSize-1;
              }
            }
          }
          let diff=rdUpd-ruUpd;
          if(rdUpd<totalU-1){
            rdUpd=totalU-1;
            ruUpd=rdUpd-diff;
          }
          if(diff<state.initialSize-1){//to correct ruUpd's value
            ruUpd=rdUpd-state.initialSize+1;
          }
          if(ruUpd<0){//this one too
            ruUpd=0;
          }
          scrollUDUpd=state.scrollUDistance-state.addedSize/(state.reachedUp)-
          (state.initialSize-state.controlSize)/((state.initialSize/state.controlSize)*totalU);
          //(state.initialSize/state.controlSize)* to calculate the average too because we don't know where the scroll
          //exactly reached ;p
          scrollDDUpd=100;
        }else{
          rdUpd=state.reachedDown;
          ruUpd=state.reachedUp;
          scrollDDUpd=state.scrollDDistance+state.addedSize/(totalU-state.reachedDown-1)+
          (state.initialSize-state.controlSize)/((state.initialSize/state.controlSize)*totalU);
          scrollUDUpd=state.scrollUDistance;
        }
      }else{//state.total===totalU
        rdUpd=state.reachedDown;
        ruUpd=state.reachedUp;
        scrollDDUpd=state.scrollDDistance;
        scrollUDUpd=state.scrollUDistance;
      }
      for(let i=ruUpd;i<=rdUpd;i++){
        dDisplayU.push(dataU[i]);
      }
      console.log(dDisplayU);
      return {
        ...state,total:totalU,reachedDown:rdUpd,reachedUp:ruUpd,scrollDDistance:scrollDDUpd,scrollUDistance:scrollUDUpd,
        data:[...dataU],dataDisplay:[...dDisplayU]
      };
    case isActions.SET_OPTIONS:
      console.log(action.payload);
      return{
        ...state,controlSize:action.payload.controlSize,initialSize:action.payload.initialSize,
        addedSize:action.payload.addedSize
      }
    default:
      return state;
  }
}
