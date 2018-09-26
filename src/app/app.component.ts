import { Component,OnInit } from '@angular/core';
import {Store} from '@ngrx/store';
import {Observable} from 'rxjs';
import {take} from 'rxjs/operators';

import * as isActions from './shared/infinite-scroll-store/infinite-scroll.actions';
import * as fromIS from './shared/infinite-scroll-store/infinite-scroll.reducers';
import * as fromApp from './store/app.reducers';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  words=[ //main array
    'wail','clover','launch','responsible','greet','stormy','rate','dream','daughter','fence','picture','fire','trot','orange',
    'winter','kind','smell','poke','books','summer','roasted','bubble','playground','bike','historical','empty','bed',
    'stew','knowing','mundane','rock','like','extra-large','famous','therapeutic'];/*,'year','nutritious','marvelous','bubble',
    'sleet','mellow','malicious','sniff','madly','bulb','comb','doll','materialistic','needless','innocent','grandmother',
    'abaft','check','unadvised','respectful','wasteful','pan','flap','didactic','pushy'
  ];*/
  wordsToAdd=['year','nutritious','marvelous','bubble', //secondary arrary
  'sleet','mellow','malicious','sniff','madly','bulb','comb','doll','materialistic','needless','innocent','grandmother',
  'abaft','check','unadvised','respectful','wasteful','pan','flap','didactic','pushy'];
  isState$:Observable<fromIS.State>;
  newWords:string='';
  selectWord;
  delIndexes;
  indexWTA:number=0;//index of the next element we are going to concat to words array
  reachedEnd:boolean=false;//to know if we got to the end of the wordsToAdd array or not.
  listSize=10;//the options attributes of the application
  initSize=20;
  addSize=10;

  constructor(private store:Store<fromApp.AppState>){}

  setOptions(){ //when we modify one of the options this method's called to update the infinite-scroll's state
    if(this.listSize!=null && this.initSize!=null && this.addSize!=null && this.listSize>0 && this.initSize>0
      && this.addSize>0){
        this.store.dispatch(new isActions.SetOptions({controlSize:this.listSize,initialSize:this.initSize,
          addedSize:this.addSize}));
      }
  }

  addFromArray(){//this method's used to add the rest of the elements to the main array
    this.store.select("infiniteScroll").pipe(take(1)).subscribe(
      (isState)=>{
        //take the slice of the secondary array that we want to concatenate to the main array
        let tmpArr=this.wordsToAdd.slice(this.indexWTA,this.indexWTA+isState.addedSize);
        if(this.indexWTA+isState.addedSize>=this.wordsToAdd.length){//to know that we reached the end of the secondary array
          this.reachedEnd=true;
        }
        this.words=this.words.concat(tmpArr);
        console.log(tmpArr);
        this.indexWTA+=isState.addedSize;
        if(this.indexWTA>=this.wordsToAdd.length){
          this.indexWTA=this.wordsToAdd.length-1;
        }
        //use the action that updates the scroll parameters
        this.store.dispatch(new isActions.UpdateScroll({total:this.words.length,data:this.words}));
      }
    );
  }

  deleteWords(){//this method's called when we want to delete some elements from the main data based on their indexes
    let indexesStr=this.delIndexes.split(',');
    let indexes=[];
    for(let index of indexesStr){
      if((+index)!=NaN && ((+index)>=0 && (+index)<this.words.length) && index!=''){
        indexes.push(+index);
      }
    }
    this.store.select('infiniteScroll').pipe(take(1)).subscribe(
      (isState)=>{
        for(let i=0;i<indexes.length;i++){
          console.log(this.words[indexes[i]]);
          this.words.splice(indexes[i],1);
          console.log(i,this.words.length);
          for(let j=i+1;j<indexes.length;j++){//to correct the indexes after the splice
            if(indexes[i]<indexes[j]){
              indexes[j]--;
              if(indexes[j]<0){
                indexes[j]=0;
              }
            }else if(indexes[i]==indexes[j]){//to delete the duplicate indexes
              indexes.splice(j,1);
            }
          }
        }
        console.log(indexes);
        console.log(this.words);
        this.store.dispatch(new isActions.UpdateScroll({total:this.words.length,data:this.words}));
        this.delIndexes=undefined;
      }
    );
  }

  addWords(){//this method's called to add some words to the main array
    let newWords=this.newWords.split(',');
    console.log(newWords);
    for(let word of newWords){
      if(word.trim()!=''){
        this.words.push(word);
      }
    }
    this.store.dispatch(new isActions.UpdateScroll({total:this.words.length,data:this.words}));
    this.newWords='';
  }

  ngOnInit(){
    this.isState$=this.store.select('infiniteScroll');//this is the state of the application which we're gonna use in the template
    console.log(this.words);
    //the action that initializes the infiniteScroll's state
    this.store.dispatch(new isActions.InitializeScroll({total:this.words.length,data:this.words,initialSize:this.initSize,
      controlSize:this.listSize,addedSize:this.addSize}));
  }

  nextWords(){//this's triggered when we reach the new scrolling down point
    this.store.select('infiniteScroll').pipe(take(1)).subscribe(
      (isState)=>{
        if(isState.reachedDown<(isState.total-1)){
          this.store.dispatch(new isActions.SetNextScroll());
        }
      }
    );
  }

  prevWords(){//this's triggered when we reach the new scrolling up point
    this.store.select('infiniteScroll').pipe(take(1)).subscribe(
      (isState)=>{
        if(isState.reachedUp>0){
          this.store.dispatch(new isActions.SetPrevScroll());
        }
      }
    );
  }
}
