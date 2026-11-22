(function (global) {
  'use strict';
  const source = text => text.trim().split('\n');
  const algorithms = [
    {id:'bubble',name:'Bubble sort',family:'Brute force',time:'O(n²)',space:'O(1)',stable:true,description:'Neighbours compare and swap. Each completed pass confirms another position at the right.',code:source(`def bubble_sort(a):
    n = len(a)
    for p in range(n - 1):
        swapped = False
        for i in range(n - 1 - p):
            if a[i] > a[i + 1]:
                a[i], a[i + 1] = a[i + 1], a[i]
                swapped = True
        if not swapped:
            break
    return a`)},
    {id:'selection',name:'Selection sort',family:'Brute force',time:'O(n²)',space:'O(1)',stable:false,description:'Find the smallest remaining value and place it at the start of the unsorted region.',code:source(`def selection_sort(a):
    n = len(a)
    for i in range(n - 1):
        minimum = i
        for j in range(i + 1, n):
            if a[j] < a[minimum]:
                minimum = j
        a[i], a[minimum] = a[minimum], a[i]
    return a`)},
    {id:'insertion',name:'Insertion sort',family:'Decrease and conquer',time:'O(n²)',space:'O(1)',stable:true,description:'Lift a key, shift larger neighbours, and insert it into the ordered prefix. An ordered prefix is not yet permanently fixed.',code:source(`def insertion_sort(a):
    for i in range(1, len(a)):
        key = a[i]
        j = i - 1
        while j >= 0 and a[j] > key:
            a[j + 1] = a[j]
            j -= 1
        a[j + 1] = key
    return a`)},
    {id:'merge',name:'Merge sort',family:'Divide and conquer',time:'O(n log n)',space:'O(n)',stable:true,description:'Walls separate recursive subarrays. Sorted runs merge upward; final hats appear when the complete result is established.',code:source(`def merge_sort(a):
    if len(a) <= 1:
        return a
    mid = len(a) // 2
    left = merge_sort(a[:mid])
    right = merge_sort(a[mid:])
    result = []
    i = j = 0
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            result.append(left[i])
            i += 1
        else:
            result.append(right[j])
            j += 1
    result.extend(left[i:])
    result.extend(right[j:])
    return result

a = merge_sort(a)`)},
    {id:'quick',name:'Quicksort',family:'Divide and conquer',time:'O(n²) worst',space:'O(n) worst',stable:false,description:'The first value is the pivot. Two pointers partition the range; confirmed pivots stay in their columns while children move down.',code:source(`def quicksort(a, lo, hi):
    if lo >= hi:
        return
    s = partition(a, lo, hi)
    quicksort(a, lo, s - 1)
    quicksort(a, s + 1, hi)

def partition(a, lo, hi):
    pivot = a[lo]
    i = lo + 1
    j = hi
    while True:
        while i <= j and a[i] < pivot:
            i += 1
        while j >= i and a[j] > pivot:
            j -= 1
        if i >= j:
            break
        a[i], a[j] = a[j], a[i]
        i += 1
        j -= 1
    a[lo], a[j] = a[j], a[lo]
    return j

quicksort(a, 0, len(a) - 1)`)},
    {id:'heap',name:'Heapsort',family:'Transform and conquer',time:'O(n log n)',space:'O(1)',stable:false,description:'Build a max heap, then extract its root into the sorted suffix. Tree connections follow the active heap.',code:source(`def sift_down(a, root, end):
    while 2 * root + 1 < end:
        child = 2 * root + 1
        if child + 1 < end and a[child] < a[child + 1]:
            child += 1
        if a[root] >= a[child]:
            break
        a[root], a[child] = a[child], a[root]
        root = child

def heap_sort(a):
    n = len(a)
    for root in range(n // 2 - 1, -1, -1):
        sift_down(a, root, n)
    for end in range(n - 1, 0, -1):
        a[0], a[end] = a[end], a[0]
        sift_down(a, 0, end)
    return a

heap_sort(a)`)},
    {id:'counting',name:'Counting sort',family:'Space–time trade-off',time:'O(n + k log k)',space:'O(n + k)',stable:true,description:'This ordered-key variant supports decimals and negatives. Sorting k distinct keys adds O(k log k); distribution counting then takes O(n + k).',code:source(`def counting_sort(a):
    keys = sorted(set(a))
    rank = {value: i for i, value in enumerate(keys)}
    counts = [0] * len(keys)
    for value in a:
        counts[rank[value]] += 1
    for i in range(1, len(counts)):
        counts[i] += counts[i - 1]
    output = [None] * len(a)
    for i in range(len(a) - 1, -1, -1):
        key = rank[a[i]]
        counts[key] -= 1
        output[counts[key]] = a[i]
    return output

a = counting_sort(a)`)},
    {id:'pancake',name:'Pancake sort',family:'Decrease and conquer',time:'O(n²)',space:'O(n)',stable:false,description:'Find the largest remaining value and use prefix flips to place it at the end. This Python slice implementation uses O(n) temporary storage; an in-place flip can use O(1).',code:source(`def pancake_sort(a):
    for size in range(len(a), 1, -1):
        largest = 0
        for j in range(1, size):
            if a[j] > a[largest]:
                largest = j
        if largest != size - 1:
            if largest != 0:
                a[:largest + 1] = a[:largest + 1][::-1]
            a[:size] = a[:size][::-1]
    return a`)},
    {id:'exhaustive',name:'Exhaustive sort',family:'Exhaustive search',time:'O(n · n!)',space:'O(n)',stable:false,maxLength:6,description:'Try permutations and test their order. Limited to six values so the complete, reversible execution history stays practical.',code:source(`from itertools import permutations

def exhaustive_sort(a):
    tested = 0
    for candidate in permutations(a):
        tested += 1
        ordered = True
        for i in range(len(candidate) - 1):
            if candidate[i] > candidate[i + 1]:
                ordered = False
                break
        if ordered:
            return list(candidate)

a = exhaustive_sort(a)`)}
  ];
  const clone = value => Array.isArray(value) ? value.map(clone) : value && typeof value === 'object' ? Object.fromEntries(Object.entries(value).map(([k,v])=>[k,clone(v)])) : value;
  const numeric = value => Array.isArray(value) ? value.map(numeric) : value && typeof value === 'object' ? ('id' in value && 'v' in value ? value.v : Object.fromEntries(Object.entries(value).map(([k,v])=>[k,numeric(v)]))) : value;
  function parse(text, limit=10) {
    const input=text.trim().replace(/−/g,'-').replace(/^\[/,'').replace(/\]$/,'').trim();
    if(!input)return [];
    const parts=input.split(/[\s,]+/).filter(Boolean);
    if(parts.length>limit)throw Error(`Use at most ${limit} values for this algorithm.`);
    if(parts.some(p=>!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i.test(p)))throw Error('Use numbers separated by commas or spaces, for example −2, 0, 1.5.');
    const values=parts.map(Number);
    if(values.some(v=>!Number.isFinite(v)))throw Error('Use finite numbers; NaN and infinity are not supported.');
    if(parts.some((p,i)=>/^[+-]?\d+$/.test(p)&&!Number.isSafeInteger(values[i])))throw Error('An integer is outside JavaScript’s exact integer range. Use a smaller integer.');
    return values;
  }
  function build(id, input) {
    const meta=algorithms.find(a=>a.id===id);if(!meta)throw Error('Unknown sorting algorithm.');
    if(input.length>(meta.maxLength||10)||input.some(v=>!Number.isFinite(v)))throw Error('Unsupported input.');
    let a=input.map((v,id)=>({v,id})),display=a.slice(),frames=[],serial=0;
    const events=[],fixed={},nodes=[],depths={};
    let comparisons=0,exchanges=0,view={type:'row'},active=[],pivotId=null,heldId=null;
    function frame(name,locals){const f={id:serial++,name,locals};frames.push(f);return f.locals;}
    function emit(line,text,quick=false){
      events.push({line,text,quick,items:clone(display),frames:frames.map(f=>({id:f.id,name:f.name,locals:numeric(clone(f.locals))})),fixed:clone(fixed),nodes:clone(nodes),depths:clone(depths),view:clone(view),active:active.slice(),pivotId,heldId,comparisons,exchanges});
    }
    function swap(i,j){if(i!==j){[a[i],a[j]]=[a[j],a[i]];exchanges++;}display=a.slice();}
    function fix(index,depth=0,kind='fixed'){fixed[display[index].id]={index,depth,kind};}
    function allFixed(){display.forEach((item,index)=>{if(!fixed[item.id])fixed[item.id]={index,depth:depths[item.id]||0,kind:'fixed'};});}
    function moveVisual(item,target){const at=display.findIndex(x=>x.id===item.id);display.splice(at,1);display.splice(target,0,item);}
    function finish(line,text){active=[];heldId=null;allFixed();emit(line,text,true);events.at(-1).done=true;}
    if(id==='bubble'){
      const v=frame('bubble_sort',{a,n:null,p:null,swapped:null,i:null});emit(1,'Enter bubble_sort.');v.n=a.length;emit(2,`Set n = ${v.n}.`);
      for(let p=0;p<a.length-1;p++){
        v.p=p;emit(3,`Begin pass ${p+1}.`);v.swapped=false;emit(4,'Reset the swap flag.');
        for(let i=0;i<a.length-1-p;i++){
          v.i=i;active=[a[i].id,a[i+1].id];emit(5,`Set i = ${i}.`);comparisons++;const yes=a[i].v>a[i+1].v;emit(6,`${a[i].v} > ${a[i+1].v}: ${yes}.`,!yes);
          if(yes){swap(i,i+1);emit(7,'Exchange the neighbouring values.',true);v.swapped=true;emit(8,'Record that an exchange occurred.');}
        }
        active=[];fix(a.length-1-p);emit(5,'The inner loop has ended; this pass confirms its rightmost position.',true);
        emit(9,`No swaps this pass: ${!v.swapped}.`);
        if(!v.swapped){allFixed();emit(10,'No swaps means the whole array is sorted.',true);break;}
      }
      finish(11,'Return the sorted array.');
    }else if(id==='selection'){
      const v=frame('selection_sort',{a,n:null,i:null,minimum:null,j:null});emit(1,'Enter selection_sort.');v.n=a.length;emit(2,`Set n = ${v.n}.`);
      for(let i=0;i<a.length-1;i++){
        v.i=i;emit(3,`Fill final position ${i}.`);v.minimum=i;view={type:'row',prefix:i,minimum:a[i].id};emit(4,'Start with the first remaining value.');
        for(let j=i+1;j<a.length;j++){v.j=j;emit(5,`Inspect index ${j}.`);active=[a[j].id,a[v.minimum].id];comparisons++;const yes=a[j].v<a[v.minimum].v;emit(6,`A smaller value was found: ${yes}.`,!yes);if(yes){v.minimum=j;view.minimum=a[j].id;emit(7,`The minimum is now at index ${j}.`,true);}}
        swap(i,v.minimum);fix(i);active=[a[i].id];emit(8,`Put the minimum in its confirmed final position ${i}.`,true);
      }
      finish(9,'Return the sorted array.');
    }else if(id==='insertion'){
      const v=frame('insertion_sort',{a,i:null,key:null,j:null});emit(1,'Enter insertion_sort.');
      for(let i=1;i<a.length;i++){
        v.i=i;view={type:'row',prefix:i};emit(2,`Insert the value at index ${i} into the ordered prefix.`);v.key=a[i];heldId=v.key.id;emit(3,'Lift the key; keep its value while neighbours shift.',true);v.j=i-1;emit(4,`Set j = ${v.j}.`);
        while(true){const valid=v.j>=0;if(valid)comparisons++;const yes=valid&&a[v.j].v>v.key.v;active=valid?[a[v.j].id,v.key.id]:[v.key.id];emit(5,valid?`${a[v.j].v} > ${v.key.v}: ${yes}.`:'j is negative; stop without reading a[j].',!yes);
          if(!yes)break;const shifting=a[v.j];a[v.j+1]=shifting;moveVisual(shifting,v.j+1);emit(6,'Shift the larger value right. The key remains held separately.',true);v.j--;emit(7,`Move j left to ${v.j}.`);
        }
        a[v.j+1]=v.key;display=a.slice();heldId=null;view.prefix=i+1;emit(8,`Insert the key at index ${v.j+1}. The prefix is ordered, but future keys may still shift it.`,true);
      }
      finish(9,'The complete array is now sorted; all positions are final.');
    }else if(id==='quick'){
      view={type:'recursive',algorithm:'quick'};nodes.push({id:0,lo:0,hi:a.length-1,depth:0,status:'pending'});
      function partition(lo,hi,depth,node){
        const v=frame('partition',{a,lo,hi,pivot:null,i:null,j:null});emit(8,`Enter partition for ${lo}…${hi}.`);v.pivot=a[lo].v;pivotId=a[lo].id;emit(9,`Choose first value ${v.pivot} as pivot.`,true);v.i=lo+1;emit(10,`Set i = ${v.i}.`);v.j=hi;emit(11,`Set j = ${v.j}.`);
        while(true){emit(12,'Begin the next pair of pointer scans.');while(true){const valid=v.i<=v.j;if(valid)comparisons++;const go=valid&&a[v.i].v<v.pivot;active=valid?[a[v.i].id,pivotId]:[];emit(13,valid?`${a[v.i].v} < ${v.pivot}: ${go}.`:'Pointers crossed; do not read a[i].',valid);if(!go)break;v.i++;emit(14,`Increment i to ${v.i}.`);}
          while(true){const valid=v.j>=v.i;if(valid)comparisons++;const go=valid&&a[v.j].v>v.pivot;active=valid?[a[v.j].id,pivotId]:[];emit(15,valid?`${a[v.j].v} > ${v.pivot}: ${go}.`:'Pointers crossed; do not read a[j].',valid);if(!go)break;v.j--;emit(16,`Decrement j to ${v.j}.`);}
          emit(17,`Pointers met or crossed: ${v.i>=v.j}.`);if(v.i>=v.j){emit(18,'Leave the partition loop.');break;}active=[a[v.i].id,a[v.j].id];swap(v.i,v.j);emit(19,'Exchange the out-of-place pair.',true);v.i++;emit(20,`Increment i to ${v.i}.`);v.j--;emit(21,`Decrement j to ${v.j}.`);
        }
        swap(lo,v.j);fix(v.j,depth,'pivot');emit(22,`Pivot ${v.pivot} is final at index ${v.j}.`,true);node.status='split';node.pivotIndex=v.j;
        for(const [l,h]of[[lo,v.j-1],[v.j+1,hi]])if(l<=h){nodes.push({id:nodes.length,lo:l,hi:h,depth:depth+1,status:'pending'});for(let k=l;k<=h;k++)depths[a[k].id]=depth+1;}
        emit(23,'Return the pivot position. The remaining ranges descend one level.',true);const result=v.j;frames.pop();pivotId=null;return result;
      }
      function quick(lo,hi,depth){
        const node=nodes.find(n=>n.lo===lo&&n.hi===hi&&n.depth===depth&&n.status==='pending');if(node)node.status='active';
        const v=frame('quicksort',{a,lo,hi,s:null});emit(1,`Enter quicksort(${lo}, ${hi}) at depth ${depth}.`);emit(2,`Base case: ${lo>=hi}.`);
        if(lo>=hi){if(lo===hi){fix(lo,depth);node.status='ready';}emit(3,lo===hi?'A single remaining element is final.':'An empty range needs no work.',lo===hi);frames.pop();return;}
        emit(4,'Call partition; s is waiting for its result.');v.s=partition(lo,hi,depth,node);emit(4,`Assign returned pivot position s = ${v.s}.`);emit(5,'Call the left partition.');quick(lo,v.s-1,depth+1);emit(5,'The left call returned.');emit(6,'Call the right partition.');quick(v.s+1,hi,depth+1);node.status='done';emit(6,'The right call returned.');frames.pop();
      }
      emit(25,'Call quicksort on the complete input.');quick(0,a.length-1,0);finish(25,'All recursive calls returned.');
    }else if(id==='merge'){
      view={type:'recursive',algorithm:'merge'};
      function merge(input,lo,depth){
        const node={id:nodes.length,lo,hi:lo+input.length-1,depth,status:'active'};nodes.push(node);input.forEach(x=>depths[x.id]=depth);
        const v=frame('merge_sort',{a:input,mid:null,left:null,right:null,result:null,i:null,j:null});emit(1,`Enter merge_sort for ${input.length} values at depth ${depth}.`);emit(2,`Base case: ${input.length<=1}.`);
        if(input.length<=1){node.status='ready';emit(3,'Return this already ordered run.');frames.pop();return input.slice();}
        v.mid=Math.floor(input.length/2);node.status='split';input.forEach(x=>depths[x.id]=depth+1);emit(4,`Split at mid = ${v.mid}; walls separate the two runs.`,true);
        emit(5,'Sort the left slice.');v.left=merge(input.slice(0,v.mid),lo,depth+1);emit(5,'The left sorted run returned.');emit(6,'Sort the right slice.');v.right=merge(input.slice(v.mid),lo+v.mid,depth+1);emit(6,'The right sorted run returned.');node.status='merging';v.result=[];emit(7,'Create an empty merge result.');v.i=v.j=0;emit(8,'Set i = j = 0.');
        function place(item){const at=lo+v.result.length;v.result.push(item);moveVisual(item,at);depths[item.id]=depth;}
        while(true){const more=v.i<v.left.length&&v.j<v.right.length;emit(9,`Both runs still contain an unread value: ${more}.`);if(!more)break;active=[v.left[v.i].id,v.right[v.j].id];comparisons++;const takeLeft=v.left[v.i].v<=v.right[v.j].v;emit(10,`Take the left value (including ties): ${takeLeft}.`,false);
          if(takeLeft){place(v.left[v.i]);emit(11,'Append the left value; move it up into the merged run.',true);v.i++;emit(12,`Increment i to ${v.i}.`);}else{place(v.right[v.j]);emit(14,'Append the right value; move it up into the merged run.',true);v.j++;emit(15,`Increment j to ${v.j}.`);}
        }
        active=[];for(const item of v.left.slice(v.i))place(item);emit(16,'Append any unread left values.',true);for(const item of v.right.slice(v.j))place(item);emit(17,'Append any unread right values.',true);
        for(const child of nodes)if(child.depth===depth+1&&child.lo>=node.lo&&child.hi<=node.hi)child.status='consumed';node.status='ready';
        if(depth===0)allFixed();emit(18,'Return the merged sorted run.',true);const result=v.result.slice();frames.pop();return result;
      }
      emit(20,'Assign a from the result of merge_sort.');a=merge(a.slice(),0,0);display=a.slice();finish(20,'The complete merge result is assigned to a.');
    }else if(id==='heap'){
      view={type:'heap',heapSize:a.length};
      function sift(root,end){const v=frame('sift_down',{a,root,end,child:null});emit(1,'Enter sift_down.');while(true){const childExists=2*v.root+1<end;emit(2,`The root has an active child: ${childExists}.`);if(!childExists)break;v.child=2*v.root+1;emit(3,`Start with child ${v.child}.`);const right=v.child+1<end;if(right)comparisons++;const larger=right&&a[v.child].v<a[v.child+1].v;active=right?[a[v.child].id,a[v.child+1].id]:[a[v.child].id];emit(4,`The right child is larger: ${larger}.`,!larger);if(larger){v.child++;emit(5,'Select the larger right child.',true);}comparisons++;active=[a[v.root].id,a[v.child].id];const ordered=a[v.root].v>=a[v.child].v;emit(6,`Parent is at least its largest child: ${ordered}.`,ordered);if(ordered){emit(7,'The heap order is restored here.');break;}swap(v.root,v.child);emit(8,'Exchange the parent with its larger child.',true);v.root=v.child;emit(9,'Continue down from the child position.');}frames.pop();}
      emit(20,'Call heap_sort.');const v=frame('heap_sort',{a,n:null,root:null,end:null});emit(11,'Enter heap_sort.');v.n=a.length;emit(12,`Set n = ${v.n}.`);
      for(let root=Math.floor(a.length/2)-1;root>=0;root--){v.root=root;emit(13,`Build the heap from internal node ${root}.`);emit(14,'Call sift_down.');sift(root,a.length);emit(14,'The sift-down call returned.');}
      for(let end=a.length-1;end>0;end--){v.end=end;emit(15,`Extract the heap maximum into index ${end}.`);swap(0,end);fix(end,Math.floor(Math.log2(Math.max(1,a.length))));view.heapSize=end;emit(16,'The maximum is now final; shrink the active heap.',true);emit(17,'Restore the remaining heap.');sift(0,end);emit(17,'The remaining heap is restored.');}
      finish(18,'Return the sorted array.');
    }else if(id==='counting'){
      view={type:'counting',output:Array(a.length).fill(null),keys:[],counts:[],phase:'Frequencies',source:a.slice()};
      const v=frame('counting_sort',{a,keys:null,rank:null,counts:null,value:null,i:null,output:null,key:null});emit(1,'Enter counting_sort.');v.keys=[...new Set(a.map(x=>x.v))].sort((x,y)=>x-y);view.keys=v.keys;emit(2,'Order the distinct numeric keys, including negative and decimal values.',true);
      const rank=new Map(v.keys.map((x,i)=>[x,i]));v.rank=Object.fromEntries(rank);emit(3,'Map each value to its ordered key index.');v.counts=Array(v.keys.length).fill(0);view.counts=v.counts;emit(4,'Create one counter per distinct key.');
      for(const item of a){v.value=item.v;active=[item.id];emit(5,`Count value ${item.v}.`);v.counts[rank.get(item.v)]++;emit(6,'Increase the matching frequency.',true);}
      for(let i=1;i<v.counts.length;i++){v.i=i;emit(7,`Accumulate counter ${i}.`);v.counts[i]+=v.counts[i-1];view.phase='Cumulative positions';emit(8,'Add the preceding cumulative count.',true);}
      active=[];v.output=Array(a.length).fill(null);view.output=v.output;emit(9,'Create the output array.');
      for(let i=a.length-1;i>=0;i--){v.i=i;active=[a[i].id];emit(10,`Place source index ${i}, scanning right to left.`);v.key=rank.get(a[i].v);emit(11,`Find ordered key index ${v.key}.`);v.counts[v.key]--;emit(12,'Reserve the next available output position.');const index=v.counts[v.key];v.output[index]=a[i];fixed[a[i].id]={index,depth:1,kind:'output'};emit(13,`Place value ${a[i].v} at its final output index ${index}.`,true);}
      emit(14,'Return the output array.');a=v.output.slice();display=a.slice();frames.pop();frame('top level',{a});finish(16,'Assign the sorted result to a.');
    }else if(id==='pancake'){
      const v=frame('pancake_sort',{a,size:null,largest:null,j:null});emit(1,'Enter pancake_sort.');
      function flip(end){a.splice(0,end,...a.slice(0,end).reverse());display=a.slice();exchanges++;view={type:'row',flip:end};active=a.slice(0,end).map(x=>x.id);}
      for(let size=a.length;size>1;size--){v.size=size;emit(2,`Set the active stack size to ${size}.`);v.largest=0;emit(3,'Start the maximum search.');for(let j=1;j<size;j++){v.j=j;emit(4,`Inspect index ${j}.`);comparisons++;active=[a[j].id,a[v.largest].id];const bigger=a[j].v>a[v.largest].v;emit(5,`A larger value was found: ${bigger}.`,!bigger);if(bigger){v.largest=j;emit(6,'Remember the larger value.',true);}}
        const needs=v.largest!==size-1;emit(7,`The largest value needs moving: ${needs}.`);if(needs){emit(8,`The largest value is away from the front: ${v.largest!==0}.`);if(v.largest!==0){flip(v.largest+1);emit(9,'Flip the prefix to bring the largest value to the front.',true);}flip(size);fix(size-1);emit(10,'Flip the active prefix. Its largest value is now final.',true);}else{fix(size-1);emit(7,'The maximum search confirms the value already at this end is final.',true);}
      }
      finish(11,'Return the sorted array.');
    }else if(id==='exhaustive'){
      const v=frame('exhaustive_sort',{a,tested:null,candidate:null,ordered:null,i:null});emit(3,'Enter exhaustive_sort.');v.tested=0;emit(4,'No candidates have been tested.');let result=null;
      function* permutations(items){if(!items.length){yield [];return;}for(let i=0;i<items.length;i++)for(const rest of permutations(items.slice(0,i).concat(items.slice(i+1))))yield [items[i],...rest];}
      for(const candidate of permutations(a)){
        v.candidate=candidate;display=candidate.slice();emit(5,'Take the next permutation.',true);v.tested++;emit(6,`Candidate count = ${v.tested}.`);v.ordered=true;emit(7,'Assume this candidate is ordered.');
        for(let i=0;i<candidate.length-1;i++){v.i=i;emit(8,`Test adjacent index ${i}.`);comparisons++;active=[candidate[i].id,candidate[i+1].id];const bad=candidate[i].v>candidate[i+1].v;emit(9,`This pair is out of order: ${bad}.`,true);if(bad){v.ordered=false;emit(10,'The candidate is not sorted.');emit(11,'Stop checking this candidate.');break;}}
        emit(12,`The complete candidate is ordered: ${v.ordered}.`);if(v.ordered){result=candidate.slice();allFixed();emit(13,'Return the first completely verified sorted permutation.',true);break;}
      }
      a=result;display=a.slice();frames.pop();frame('top level',{a});finish(15,'Assign the sorted candidate to a.');
    }
    const initialItems=input.map((v,id)=>({v,id}));
    return {meta,input:input.slice(),events,initial:{line:null,text:'Choose Quick run or Next line to begin.',quick:false,items:initialItems,frames:[],fixed:{},nodes:[],depths:{},view:{type:meta.id==='heap'?'heap':'row',heapSize:input.length},active:[],pivotId:null,heldId:null,comparisons:0,exchanges:0}};
  }
  global.SortingEngine={algorithms,parse,build,clone};
})(typeof window!=='undefined'?window:globalThis);
