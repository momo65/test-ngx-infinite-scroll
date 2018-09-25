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
  words=[
    'wail','clover','launch','responsible','greet','stormy','rate','dream','daughter','fence','picture','fire','trot','orange',
    'winter','kind','smell','poke','books','summer','roasted','bubble','playground','bike','historical','empty','bed',
    'stew','knowing','mundane','rock','like','extra-large','famous','therapeutic'];/*,'year','nutritious','marvelous','bubble',
    'sleet','mellow','malicious','sniff','madly','bulb','comb','doll','materialistic','needless','innocent','grandmother',
    'abaft','check','unadvised','respectful','wasteful','pan','flap','didactic','pushy'
  ];*/
  wordsToAdd=['year','nutritious','marvelous','bubble',
  'sleet','mellow','malicious','sniff','madly','bulb','comb','doll','materialistic','needless','innocent','grandmother',
  'abaft','check','unadvised','respectful','wasteful','pan','flap','didactic','pushy'];
  isState$:Observable<fromIS.State>;
  newWords:string='';
  selectWord;
  delIndexes;
  indexWTA:number=0;//index of the next element we are going to concat to words array
  reachedEnd:boolean=false;//to know if we got to the end of the wordsToAdd array or not.
  listSize=10;
  initSize=20;
  addSize=10;

  constructor(private store:Store<fromApp.AppState>){}

  setOptions(){
    if(this.listSize!=null && this.initSize!=null && this.addSize!=null && this.listSize>0 && this.initSize>0
      && this.addSize>0){
        this.store.dispatch(new isActions.SetOptions({controlSize:this.listSize,initialSize:this.initSize,
          addedSize:this.addSize}));
      }
  }

  addFromArray(){
    this.store.select("infiniteScroll").pipe(take(1)).subscribe(
      (isState)=>{
        let tmpArr=this.wordsToAdd.slice(this.indexWTA,this.indexWTA+isState.addedSize);
        if(this.indexWTA+isState.addedSize>=this.wordsToAdd.length){
          this.reachedEnd=true;
        }
        this.words=this.words.concat(tmpArr);
        console.log(tmpArr);
        this.indexWTA+=isState.addedSize;
        if(this.indexWTA>=this.wordsToAdd.length){
          this.indexWTA=this.wordsToAdd.length-1;
        }
        this.store.dispatch(new isActions.UpdateScroll({total:this.words.length,data:this.words}));
      }
    );
  }

  deleteWords(){
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

  addWords(){
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
    this.isState$=this.store.select('infiniteScroll');
    console.log(this.words);
    this.store.dispatch(new isActions.InitializeScroll({total:this.words.length,data:this.words,initialSize:this.initSize,
      controlSize:this.listSize,addedSize:this.addSize}));
  }

  nextWords(){
    this.store.select('infiniteScroll').pipe(take(1)).subscribe(
      (isState)=>{
        if(isState.reachedDown<(isState.total-1)){
          this.store.dispatch(new isActions.SetNextScroll());
        }
      }
    );
  }

  prevWords(){
    this.store.select('infiniteScroll').pipe(take(1)).subscribe(
      (isState)=>{
        if(isState.reachedUp>0){
          this.store.dispatch(new isActions.SetPrevScroll());
        }
      }
    );
  }
}
