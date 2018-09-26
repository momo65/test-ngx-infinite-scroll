import * as isActions from './infinite-scroll.actions';

export interface State{
  total:number, // the length of the whole data
  reachedDown:number,//biggest index we got currently in the list
  reachedUp:number,//least index pointing on the initial element that is on the list
  scrollDDistance:number,//the value on which we're going to get more data from scrolling down
  scrollUDistance:number,//the value on which we're going to get more data from scrolling up
  data:any[],//the whole data content
  dataDisplay:any[],//only the data we're going to display on the list
  initialSize:number,//the number we're going to load on the list initially
  controlSize:number,//the number of elements which the list is going to display permanently
  addedSize:number//the number of elements we're going to add when we reach a scroll point for loading more data
};

const initialState:State={
  total:0,
  reachedDown:0,
  reachedUp:0,
  scrollDDistance:10,//means we're at the top of the list from the point of view of ngx-infinite-scroll
  scrollUDistance:0,
  data:[],
  dataDisplay:[],
  initialSize:0,//how many we will charge at the beginning
  controlSize:0,//how many the html control can display at once
  addedSize:10 // how many to add each scroll
};

export function infiniteScrollReducer(state=initialState,action:isActions.ISActions){
  switch(action.type){
    case isActions.INITIALIZE_SCROLL: //the action to initialize the whole state of scrolling
      let total=action.payload.total;
      let dataI=[...action.payload.data];
      let initSize=action.payload.initialSize;
      let ctrlSize=action.payload.controlSize;
      let addSize=action.payload.addedSize;
      let dDisplay=[];
      let scrollDDI;
      let rd;//same as the reachedDown state element
      if(total-initSize<0){//the length of the data is less than the capacity of the list
        rd=total-1;//we point it to the last element of the data
        scrollDDI=10;//We don't need to scroll down, there's no more data so i put the scroll down point to 10
      }else{
        rd=initSize-1; //put rd to the last element that fits in the list
        scrollDDI=(total-rd)/total;//set the scroll down point to its next value
        console.log(scrollDDI);
      }
      for(let i=0;i<=rd;i++){ //populate the array we're gonna display into the list
        dDisplay.push(dataI[i]);
      }
      return {//put all calculated values into the state to update it
        ...state,total:total,reachedDown:rd,reachedUp:0,scrollDDistance:scrollDDI,scrollUDistance:0,data:dataI,
        dataDisplay:dDisplay,controlSize:ctrlSize,addedSize:addSize,initialSize:initSize
      };
    case isActions.SET_NEXT_SCROLL://the action that updates the state of the application when we reach a scroll down point
      let rdNS=state.reachedDown+state.addedSize;//increments reachedDown as we scroll down
      let ruNS=state.reachedUp+Math.floor(state.addedSize/2);//same as reached down but with half the pace to visualize more elements
      //to ensure we can see some previous elements when we scroll down.
      if(rdNS<state.total){
        if(rdNS-(state.initialSize-1)<0){//reachedDown's still a little number less than the list's capacity
          rdNS=state.initialSize-1; // point it to the last element of the list
        }
      }else{
        rdNS=state.total-1; // point it to the last element of the whole data
      }
      if(ruNS>=0){
        if(ruNS+state.initialSize>state.total){//ruNS's value is out of its place
          ruNS=state.total-state.initialSize;//rectify its value
        }
      }else{
        ruNS=0; //it shouldn't be under 0 so we put it to 0 its min value
      }
      let dDisplayN=[]; // the array to display to display into the list
      for(let i=ruNS;i<=rdNS;i++){// we populate the array between the two indexes which represent the first and
      //last element into the list
        dDisplayN.push(state.data[i]);
      }
      console.log(dDisplayN);
      let scrollDD=(state.total-rdNS)/state.total;//we update the next scrolling down point
      console.log(scrollDD);
      let scrollUD=ruNS/state.total;//we update the next scrolling up point
      console.log(scrollUD);
      return {//finally we update the state of the infinite-scroll
        ...state,reachedDown:rdNS,reachedUp:ruNS,scrollDDistance:scrollDD,scrollUDistance:scrollUD,dataDisplay:dDisplayN
      };
    case isActions.SET_PREV_SCROLL://the action that triggers when we reach a scroll up point
      let rdPS=state.reachedDown-Math.floor(state.addedSize/2);//rdPS increments half the pace ruPS increments
      let ruPS=state.reachedUp-state.addedSize;//reachedUp should decrement while we're scrolling up
      if(rdPS<state.total){
        if(rdPS-state.initialSize+1<0){//rdps reached a level nearby the 0 index
          rdPS=state.initialSize-1; //we point it to the last element of the list
        }
      }else{
        rdPS=state.total-1;//we point it to the last element of the whole data
      }
      if(ruPS>=0){
        if(ruPS+state.initialSize>state.total){ //means ruPS's nearby the last element of the data
          ruPS=state.total-state.initialSize;//put it farther away from that element
        }
      }else{
        ruPS=0;//shouldn't be under 0 so we put it to 0 its min value
      }
      let dDisplayP=[];//displayed elements's array
      for(let i=ruPS;i<=rdPS;i++){//populate the array
        dDisplayP.push(state.data[i]);
      }
      console.log(dDisplayP);
      let scrollDDis=(state.total-rdPS)/state.total;//set the next scrolling down point
      let scrollUDis=ruPS/state.total;//set the next scrolling up point
      console.log(scrollUDis);
      return {//set the infinite-scroll's state
        ...state,reachedDown:rdPS,reachedUp:ruPS,scrollDDistance:scrollDDis,scrollUDistance:scrollUDis,
        dataDisplay:dDisplayP
      };
    case isActions.UPDATE_SCROLL://the action that updates the state when we add elements or delete them from the list
      let totalU=action.payload.total;//the new total of elements after manipulating the whole data
      let dataU=[...action.payload.data];//the new data after manipulating the whole data
      let dDisplayU=[];// the array to display
      let scrollDDUpd;//scrolling points
      let scrollUDUpd;
      let rdUpd;//indexes first and last in the list
      let ruUpd;
      if(totalU-state.total>0){ // if the new data is bigger than the old data
        if(state.reachedDown==state.total-1){//reachedDown is at the last position in the old data
          rdUpd=state.reachedDown+state.addedSize;//we go for more data when advancing this index
          ruUpd=state.reachedUp+Math.floor(state.addedSize/2);//ruUpd increments half the pace rdUpd increments
          if(rdUpd<totalU){
            if(rdUpd-(state.initialSize-1)<0){//rdUpd's too little
              rdUpd=state.initialSize-1;
            }
          }else{//rdUpd's out of bounds
            rdUpd=totalU-1;
          }
          if(ruUpd>=0){
            if(ruUpd+state.initialSize>totalU){
              ruUpd=totalU-state.initialSize;//we get ruUpd to a better index
            }
          }else{
            ruUpd=0;//we set this index to its min value
          }
        }else{//we don't need to modify the indexes so we take their old state.
          rdUpd=state.reachedDown;
          ruUpd=state.reachedUp;
        }
        scrollDDUpd=(totalU-rdUpd)/totalU;//we calculate the next scrolling down point
        scrollUDUpd=ruUpd/totalU;//we calculate the next scrolling up point
      }else if(totalU-state.total<0){//the new data's less than the old data
        if(state.reachedDown>=totalU){//reachedDown's out of bounds
          rdUpd=state.reachedDown;
          ruUpd=state.reachedUp;
          while(rdUpd>=totalU){//we iterate as many times as we need to put it in its correct place
            rdUpd=rdUpd-Math.floor(state.addedSize/2);
            ruUpd=ruUpd-state.addedSize;
            if(rdUpd<totalU){
              if((rdUpd-state.initialSize+1)<0){
                rdUpd=state.initialSize-1;
              }
            }
          }
          //final rectifications & corrections for rdUpd & ruUpd
          let diff=rdUpd-ruUpd;
          if(rdUpd<totalU-1){
            rdUpd=totalU-1;
            ruUpd=rdUpd-diff;
          }
          if(diff<state.initialSize-1){
            ruUpd=rdUpd-state.initialSize+1;
          }
          if(ruUpd<0){
            ruUpd=0;
          }
          scrollUDUpd=(ruUpd)/totalU;//next scrolling up point
          scrollDDUpd=0; //no more scrolling down: means we reached the bottom of the data
        }else{//reachedDown's still inbound
          rdUpd=state.reachedDown;//take the old state for these variables
          ruUpd=state.reachedUp;
          console.log("check right here");
          scrollDDUpd=state.scrollDDistance;//check right here
          scrollUDUpd=state.scrollUDistance;
        }
      }else{//state.total===totalU // same volume of data for old & new data
        rdUpd=state.reachedDown;
        ruUpd=state.reachedUp;
        scrollDDUpd=state.scrollDDistance;
        scrollUDUpd=state.scrollUDistance;
      }
      for(let i=ruUpd;i<=rdUpd;i++){//populate the array we're gonna display
        dDisplayU.push(dataU[i]);
      }
      console.log(dDisplayU);
      return {//update infinite-scroll's state in the end of this action
        ...state,total:totalU,reachedDown:rdUpd,reachedUp:ruUpd,scrollDDistance:scrollDDUpd,scrollUDistance:scrollUDUpd,
        data:dataU,dataDisplay:dDisplayU
      };
    case isActions.SET_OPTIONS://this action allows to update the state when we modify the options of the list
      let ctrlSizeSO=action.payload.controlSize;// take the new values of the options & put em into some variables
      let initSizeSO=action.payload.initialSize;
      let addSizeSO=action.payload.addedSize;
      // we need this difference
      let diff=state.reachedDown-state.reachedUp;
      let rdSO;//to put new reachedDown
      let ruSO;//& new reachedUp
      if(initSize>diff){//calculate the new values when the new capacity of the list's superior to its old capacity
        if(initSize%2==0){
          rdSO=state.reachedDown+initSize/2;
          ruSO=state.reachedUp-initSize/2;
        }else{
          rdSO=state.reachedDown+Math.ceil(initSize/2);
          ruSO=state.reachedUp-Math.floor(initSize/2);
        }
      }else if(initSize<diff){//calculate the new values when the new capacity of the list's inferior to its old capacity
        if(initSize%2==0){
          rdSO=state.reachedDown-initSize/2;
          ruSO=state.reachedUp+initSize/2;
        }else{
          rdSO=state.reachedDown-Math.ceil(initSize/2);
          ruSO=state.reachedUp+Math.floor(initSize/2);
        }
      }else{
        rdSO=state.reachedDown;
        ruSO=state.reachedUp;
      }
      let totalSO=state.total;//the total's still the same.
      let dDisplaySO=[];
      let dataSO=[...state.data];//the whole data
      for(let i=ruSO;i<=rdSO;i++){
        dDisplaySO.push(dataSO[i]);
      }
      let scrollDDSO=(totalSO-rdSO)/totalSO;
      let scrollUDSO=ruSO/totalSO;

      console.log(scrollDDSO);
      console.log(scrollUDSO);
      return{//set the state
        ...state,controlSize:ctrlSizeSO,initialSize:initSizeSO,reachedUp:ruSO,scrollDDistance:scrollDDSO,
        addedSize:addSizeSO,dataDisplay:dDisplaySO,scrollUDistance:scrollUDSO
      }
    default://the default case
      return state;
  }
}
