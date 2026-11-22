(function(global){
  'use strict';
  const code=text=>text.trim().split('\n'),clone=value=>Array.isArray(value)?value.map(clone):value&&typeof value==='object'?Object.fromEntries(Object.entries(value).map(([k,v])=>[k,clone(v)])):value;
  const algorithms=[
    {id:'linear',name:'Linear search',family:'Sequential search · Week 1',time:'O(n)',space:'O(1)',ordered:false,match:'First match',description:'Check each value from left to right. A checked mismatch fades; the first confirmed match is highlighted green.',code:code(`def linear_search(a, key):
    for i in range(len(a)):
        if a[i] == key:
            return i
    return -1`)},
    {id:'sentinel',name:'Sentinel search',family:'Sequential search · Extra',time:'O(n)',space:'O(1)',ordered:false,match:'First match',description:'Temporarily replace the last value with the target as a sentinel. The original value is always restored before returning. An extra beyond the course tutorials.',code:code(`def sentinel_search(a, key):
    n = len(a)
    if n == 0:
        return -1
    last = a[n - 1]
    a[n - 1] = key
    i = 0
    while a[i] != key:
        i += 1
    a[n - 1] = last
    if i < n - 1 or last == key:
        return i
    return -1`)},
    {id:'binary',name:'Binary search',family:'Decrease and conquer · Week 5',time:'O(log n)',space:'O(1)',ordered:true,match:'Any match',description:'Probe the middle of an ascending array and discard the impossible half. With duplicates, return the first match encountered by this algorithm.',code:code(`def binary_search(a, key):
    lo = 0
    hi = len(a) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if a[mid] == key:
            return mid
        if a[mid] < key:
            lo = mid + 1
        else:
            hi = mid - 1
    return -1`)},
    {id:'ternary',name:'Ternary search',family:'Decrease and conquer · Week 5 extension',time:'O(log n)',space:'O(1)',ordered:true,match:'Any match',description:'Probe two positions in an ascending array, then keep only the possible third. Watch both probes and the boundary updates in the Python trace.',code:code(`def ternary_search(a, key):
    lo = 0
    hi = len(a) - 1
    while lo <= hi:
        third = (hi - lo) // 3
        m1 = lo + third
        m2 = hi - third
        if a[m1] == key:
            return m1
        if a[m2] == key:
            return m2
        if key < a[m1]:
            hi = m1 - 1
        elif key > a[m2]:
            lo = m2 + 1
        else:
            lo = m1 + 1
            hi = m2 - 1
    return -1`)}
  ].map(meta=>({...meta,collection:'searching'}));
  function parseTarget(text){const values=global.SortingEngine.parse(text,1);if(values.length!==1)throw Error('Enter one finite number as the target.');return values[0];}
  function build(id,input,key){
    const meta=algorithms.find(a=>a.id===id);if(!meta)throw Error('Unknown searching algorithm.');
    if(!Array.isArray(input)||input.length>10||input.some(v=>!Number.isFinite(v))||!Number.isFinite(key))throw Error('Use up to 10 finite numbers and a finite target.');
    if(meta.ordered&&input.some((v,i)=>i>0&&input[i-1]>v))throw Error(`${meta.name} needs an ascending array. Use Sort input or edit your array.`);
    const original=input.slice(),a=input.slice(),items=()=>a.map((v,id)=>({v,id}));
    let locals={a,key},active=[],comparisons=0,lo=0,hi=a.length-1,pointers={},sentinel=null,result=null;
    const events=[],eliminated=new Set();
    const snapshot=(line,text,quick=false,done=false)=>({line,text,quick,items:items(),frames:[{id:0,name:meta.code[0].slice(4).split('(')[0],locals:clone(locals)}],fixed:{},nodes:[],depths:{},view:{type:'search',lo,hi,pointers:clone(pointers),eliminated:[...eliminated],sentinel,target:key},active:active.slice(),pivotId:null,heldId:null,comparisons,exchanges:0,result,...(done?{done:true}:{})});
    const emit=(line,text,quick=false)=>events.push(snapshot(line,text,quick));
    const finish=(line,index)=>{result=index;active=index<0?[]:[index];events.push(snapshot(line,index<0?`Target ${key} is not in the array. Return -1.`:`Target ${key} found at index ${index}. Return ${index}.`,true,true));};
    function bounds(){for(let i=0;i<a.length;i++)if(i<lo||i>hi)eliminated.add(i);}
    const initial={...snapshot(null,'Enter an array and target, then choose Quick run or Next line.'),frames:[]};
    emit(1,`Enter ${meta.name.toLowerCase()} with target ${key}.`);
    if(id==='linear'){
      for(let i=0;i<a.length;i++){
        locals.i=i;pointers={i};active=[];lo=i;emit(2,`The loop selects index ${i}.`);
        comparisons++;active=[i];const matches=a[i]===key;emit(3,`Compare a[${i}] = ${a[i]} with ${key}: ${matches?'equal':'different'}.`,true);
        if(matches){finish(4,i);break;}eliminated.add(i);
      }
      if(result===null){lo=a.length;active=[];emit(2,'The for loop has no more values.');finish(5,-1);}
    }else if(id==='sentinel'){
      locals.n=a.length;emit(2,`n = ${a.length}.`);emit(3,`The array is empty: ${a.length===0}.`);
      if(!a.length)finish(4,-1);
      else{
        locals.last=a[a.length-1];emit(5,`Save the original last value ${locals.last}.`);
        a[a.length-1]=key;sentinel=a.length-1;emit(6,`Temporarily place target ${key} at index ${sentinel}.`,true);
        locals.i=0;pointers={i:0};emit(7,'Start i at 0.');
        while(true){
          comparisons++;active=[locals.i];const different=a[locals.i]!==key;emit(8,`a[${locals.i}] != key is ${different}.`,true);if(!different)break;
          eliminated.add(locals.i);locals.i++;lo=locals.i;pointers={i:locals.i};active=[];emit(9,`Advance i to ${locals.i}.`);
        }
        a[a.length-1]=locals.last;sentinel=null;emit(10,`Restore the original last value ${locals.last}.`,true);
        if(locals.i===a.length-1)comparisons++;
        const found=locals.i<a.length-1||locals.last===key;emit(11,`The match belongs to the original array: ${found}.`,true);
        if(!found){eliminated.add(a.length-1);lo=a.length;}
        finish(found?12:13,found?locals.i:-1);
      }
    }else{
      locals.lo=0;pointers={lo};emit(2,'Set lo = 0.');locals.hi=a.length-1;pointers={lo,hi};emit(3,`Set hi = ${hi}.`);
      while(true){
        active=[];pointers={lo,hi};const more=lo<=hi;emit(4,`lo <= hi is ${more}${more?`: search indices ${lo} through ${hi}`:': no candidates remain'}.`);if(!more){finish(id==='binary'?12:19,-1);break;}
        if(id==='binary'){
          locals.mid=Math.floor((lo+hi)/2);pointers={lo,hi,mid:locals.mid};emit(5,`mid = ${locals.mid}.`);
          const mid=locals.mid;comparisons++;active=[mid];const equal=a[mid]===key;emit(6,`a[${mid}] = ${a[mid]} equals ${key}: ${equal}.`,true);if(equal){finish(7,mid);break;}
          comparisons++;const smaller=a[mid]<key;emit(8,`a[${mid}] < key is ${smaller}.`);
          if(smaller){lo=mid+1;locals.lo=lo;bounds();pointers={lo,hi,mid};emit(9,`Set lo = ${lo}; discard the left half.`);}
          else{hi=mid-1;locals.hi=hi;bounds();pointers={lo,hi,mid};emit(11,`Set hi = ${hi}; discard the right half.`);}
        }else{
          locals.third=Math.floor((hi-lo)/3);emit(5,`third = ${locals.third}.`);
          locals.m1=lo+locals.third;pointers={lo,hi,m1:locals.m1};emit(6,`m1 = ${locals.m1}.`);
          locals.m2=hi-locals.third;pointers={lo,hi,m1:locals.m1,m2:locals.m2};emit(7,`m2 = ${locals.m2}.`);
          const {m1,m2}=locals;comparisons++;active=[m1];const first=a[m1]===key;emit(8,`a[${m1}] = ${a[m1]} equals ${key}: ${first}.`,true);if(first){finish(9,m1);break;}
          comparisons++;active=[m2];const second=a[m2]===key;emit(10,`a[${m2}] = ${a[m2]} equals ${key}: ${second}.`,true);if(second){finish(11,m2);break;}
          comparisons++;active=[m1];const left=key<a[m1];emit(12,`key < a[m1] is ${left}.`,true);
          if(left){hi=m1-1;locals.hi=hi;bounds();pointers={lo,hi,m1,m2};emit(13,`Set hi = ${hi}; keep the left third.`);}
          else{
            comparisons++;active=[m2];const right=key>a[m2];emit(14,`key > a[m2] is ${right}.`,true);
            if(right){lo=m2+1;locals.lo=lo;bounds();pointers={lo,hi,m1,m2};emit(15,`Set lo = ${lo}; keep the right third.`);}
            else{lo=m1+1;locals.lo=lo;bounds();pointers={lo,hi,m1,m2};emit(17,`Set lo = ${lo}.`);hi=m2-1;locals.hi=hi;bounds();pointers={lo,hi,m1,m2};emit(18,`Set hi = ${hi}; keep the middle third.`);}
          }
        }
      }
    }
    return {meta,input:original,target:key,initial,events};
  }
  global.SearchingEngine={algorithms,parseTarget,build,clone};
})(typeof window!=='undefined'?window:globalThis);
