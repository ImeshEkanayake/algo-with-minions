(function(global){
  'use strict';
  const keywords=new Set(['and','or','not','is','in','True','False','None']);
  function lex(text){
    const out=[];let i=0;
    while(i<text.length){
      const rest=text.slice(i),space=/^\s+/.exec(rest);if(space){i+=space[0].length;continue;}
      const string=/^(?:"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')/.exec(rest);if(string){out.push({type:'literal',value:JSON.parse(string[0][0]==='"'?string[0]:'"'+string[0].slice(1,-1).replace(/"/g,'\\"')+'"')});i+=string[0].length;continue;}
      const number=/^(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?/.exec(rest);if(number){out.push({type:'literal',value:Number(number[0])});i+=number[0].length;continue;}
      const name=/^[A-Za-z_]\w*/.exec(rest);if(name){out.push({type:keywords.has(name[0])?'operator':'name',value:name[0]});i+=name[0].length;continue;}
      const op=/^(?:\/\/|==|!=|<=|>=|\+=|-=|[+\-*\/%<>=()[\]{},.:])/.exec(rest);if(!op)throw Error('Unsupported program token: '+rest);out.push({type:'operator',value:op[0]});i+=op[0].length;
    }
    return out;
  }
  const precedence={or:1,and:2,'==':3,'!=':3,'<':3,'>':3,'<=':3,'>=':3,is:3,'is not':3,in:3,'+':4,'-':4,'*':5,'/':5,'//':5,'%':5};
  function expression(text){
    const tokens=lex(text);let index=0;
    const peek=()=>tokens[index]?.value,take=()=>tokens[index++],expect=value=>{if(take()?.value!==value)throw Error('Expected '+value+' in '+text);};
    function atom(){
      const token=take();if(!token)throw Error('Missing expression: '+text);let node;
      if(token.type==='literal')node={type:'literal',value:token.value};
      else if(['True','False','None'].includes(token.value))node={type:'literal',value:token.value==='None'?null:token.value==='True'};
      else if(['-','+','not'].includes(token.value))node={type:'unary',op:token.value,arg:parse(token.value==='not'?3:6)};
      else if(token.value==='('){node=parse(0);expect(')');}
      else if(token.value==='['){const values=[];while(peek()!==']'){values.push(parse(0));if(peek()!==',')break;take();}expect(']');node={type:'list',values};}
      else if(token.type==='name')node={type:'name',name:token.value};
      else throw Error('Unsupported expression: '+text);
      while(true){
        if(peek()==='.'){take();node={type:'attr',target:node,name:take().value};}
        else if(peek()==='['){take();const start=peek()!==':'?parse(0):null;if(peek()===':'){take();const end=peek()!==']'?parse(0):null;expect(']');node={type:'slice',target:node,start,end};}else{expect(']');node={type:'index',target:node,index:start};}}
        else if(peek()==='('){take();const args=[],named=[];while(peek()!==')'){
          if(tokens[index]?.type==='name'&&tokens[index+1]?.value==='='){const name=take().value;take();named.push([name,parse(0)]);}else args.push(parse(0));
          if(peek()!==',')break;take();
        }expect(')');node={type:'call',target:node,args,named};}
        else break;
      }
      return node;
    }
    function parse(minimum){let left=atom();while(true){let op=peek(),count=1;if(op==='is'&&tokens[index+1]?.value==='not'){op='is not';count=2;}const p=precedence[op];if(p===undefined||p<minimum)break;index+=count;left={type:'binary',op,left,right:parse(p+1)};}return left;}
    const result=parse(0);if(index!==tokens.length)throw Error('Unexpected expression tail: '+text+' at '+peek());return result;
  }
  function compile(source){
    const lines=source.split('\n'),records=[];lines.forEach((text,i)=>{const trimmed=text.trim();if(trimmed&&!trimmed.startsWith('#')&&!trimmed.startsWith('from '))records.push({indent:text.length-text.trimStart().length,text:trimmed,line:i+1});});let cursor=0;
    function block(indent){
      const body=[];
      while(cursor<records.length&&records[cursor].indent===indent){
        const rec=records[cursor++],s=rec.text;let stmt;
        if(s.startsWith('def ')){const match=/^def (\w+)\((.*?)\):$/.exec(s);if(!match)throw Error('Invalid function '+s);stmt={type:'def',name:match[1],params:match[2].split(',').map(s=>s.trim()).filter(Boolean),body:block(indent+4),line:rec.line};}
        else if(s.startsWith('if ')){const branches=[{condition:expression(s.slice(3,-1)),line:rec.line,body:block(indent+4)}];let otherwise=[];
          while(cursor<records.length&&records[cursor].indent===indent&&records[cursor].text.startsWith('elif ')){const next=records[cursor++];branches.push({condition:expression(next.text.slice(5,-1)),line:next.line,body:block(indent+4)});}
          if(cursor<records.length&&records[cursor].indent===indent&&records[cursor].text==='else:'){cursor++;otherwise=block(indent+4);}stmt={type:'if',branches,otherwise,line:rec.line};
        }else if(s.startsWith('while '))stmt={type:'while',condition:expression(s.slice(6,-1)),body:block(indent+4),line:rec.line};
        else if(s.startsWith('for ')){const match=/^for (\w+) in (.*):$/.exec(s);stmt={type:'for',name:match[1],iterable:expression(match[2]),body:block(indent+4),line:rec.line};}
        else if(s==='return'||s.startsWith('return '))stmt={type:'return',value:s==='return'?{type:'literal',value:null}:expression(s.slice(7)),line:rec.line};
        else if(s==='break'||s==='continue')stmt={type:s,line:rec.line};
        else{
          const tokens=lex(s);let depth=0,at=-1;
          for(let i=0;i<tokens.length;i++){const v=tokens[i].value;if(['(','[','{'].includes(v))depth++;if([')',']','}'].includes(v))depth--;if(depth===0&&['=','+=','-='].includes(v)){at=i;break;}}
          if(at>=0){
            let offset=0,depth=0,split=-1,op='';for(let i=0;i<s.length;i++){const c=s[i];if(c==='('||c==='[')depth++;if(c===')'||c===']')depth--;if(!depth&&c==='='&&s[i-1]!=='='&&s[i+1]!=='='){split=i;op='=';if(['+','-'].includes(s[i-1])){split=i-1;op=s[i-1]+'=';}break;}}
            if(split<0)throw Error('Invalid assignment '+s);
            stmt={type:'assign',target:expression(s.slice(0,split).trim()),value:expression(s.slice(split+op.length).trim()),op,line:rec.line};
          }else stmt={type:'expr',value:expression(s),line:rec.line};
        }
        body.push(stmt);
      }
      return body;
    }
    const body=block(0);if(cursor!==records.length)throw Error('Unexpected indentation at line '+records[cursor].line);
    return {source,lines,functions:new Map(body.filter(s=>s.type==='def').map(s=>[s.name,s])),body:body.filter(s=>s.type!=='def')};
  }
  const truth=v=>Array.isArray(v)?v.length>0:v!==null&&v!==false&&v!==0&&v!=='';
  const same=(a,b)=>a===b;
  const hasKey=node=>node&&(node.type==='attr'&&node.name==='key'||node.type==='index'&&node.target.type==='attr'&&node.target.name==='keys');
  class Machine{
    constructor(program,inputs,onStep){
      this.program=program;this.frames=[{id:0,name:'Top level',locals:inputs}];this.nextFrame=1;this.nodes=new Map();this.nodeIds=new WeakMap();this.nextNode=0;this.keyIds=new Map();this.nextKey=0;this.comparisons=0;this.steps=0;this.accessed=new Set();this.accessedKeys=new Set();this.keyLists=new WeakSet();this.visited=new Set();this.pending=null;this.onStep=onStep;
    }
    namespace(value){const id='N'+this.nextNode++;this.nodeIds.set(value,id);this.nodes.set(id,value);if(Array.isArray(value.keys))this.keyLists.add(value.keys);const keys='key'in value?[value.key]:value.keys||[];for(const key of keys)this.keyId(key);return value;}
    keyId(value){if(!this.keyIds.has(value))this.keyIds.set(value,this.nextKey++);return this.keyIds.get(value);}
    frame(){return this.frames.at(-1);}
    lookup(name){const frame=this.frame();if(name in frame.locals)return frame.locals[name];if(name in this.frames[0].locals)return this.frames[0].locals[name];if(this.program.functions.has(name))return {function:name};if(['len','range','max','min','abs','SimpleNamespace'].includes(name))return {builtin:name};throw Error('Unknown Python name '+name);}
    attr(target,name){
      if(target===null)throw Error('Cannot read '+name+' on None');
      const nodeId=this.nodeIds.get(target);if(nodeId){this.accessed.add(nodeId);this.visited.add(nodeId);}
      if(Array.isArray(target)&&['append','insert','pop'].includes(name))return {method:name,owner:target};
      if(!(name in target))throw Error('Missing attribute '+name);if(nodeId&&name==='key')this.accessedKeys.add(this.keyId(target.key));return target[name];
    }
    *evaluate(node){
      if(node.type==='literal')return node.value;
      if(node.type==='name')return this.lookup(node.name);
      if(node.type==='list'){const result=[];for(const item of node.values)result.push(yield* this.evaluate(item));return result;}
      if(node.type==='attr')return this.attr(yield* this.evaluate(node.target),node.name);
      if(node.type==='index'){const list=yield* this.evaluate(node.target);let index=yield* this.evaluate(node.index);if(index<0)index+=list.length;if(index<0||index>=list.length)throw Error('Python list index out of range');if(node.target.type==='attr'&&node.target.name==='keys')this.accessedKeys.add(this.keyId(list[index]));return list[index];}
      if(node.type==='slice'){const list=yield* this.evaluate(node.target),start=node.start?yield* this.evaluate(node.start):undefined,end=node.end?yield* this.evaluate(node.end):undefined;return list.slice(start,end);}
      if(node.type==='unary'){const value=yield* this.evaluate(node.arg);return node.op==='not'?!truth(value):node.op==='-'?-value:+value;}
      if(node.type==='binary'){
        const a=yield* this.evaluate(node.left);if(node.op==='and')return truth(a)?yield* this.evaluate(node.right):a;if(node.op==='or')return truth(a)?a:yield* this.evaluate(node.right);
        const b=yield* this.evaluate(node.right);if(['==','!=','<','>','<=','>='].includes(node.op)&&(hasKey(node.left)||hasKey(node.right)))this.comparisons++;
        switch(node.op){case'+':return a+b;case'-':return a-b;case'*':return a*b;case'/':return a/b;case'//':return Math.floor(a/b);case'%':return ((a%b)+b)%b;case'==':return same(a,b);case'!=':return !same(a,b);case'<':return a<b;case'>':return a>b;case'<=':return a<=b;case'>=':return a>=b;case'is':return a===b;case'is not':return a!==b;case'in':return b.includes(a);}
      }
      if(node.type==='call'){
        const callable=yield* this.evaluate(node.target),args=[];for(const arg of node.args)args.push(yield* this.evaluate(arg));const named={};for(const [name,arg]of node.named)named[name]=yield* this.evaluate(arg);
        if(callable.function)return yield* this.call(callable.function,args);
        if(callable.builtin){
          switch(callable.builtin){case'len':return args[0].length;case'abs':return Math.abs(args[0]);case'max':return Math.max(...args);case'min':return Math.min(...args);case'range':{const start=args.length>1?args[0]:0,end=args.length>1?args[1]:args[0],step=args[2]??1,result=[];for(let i=start;step>0?i<end:i>end;i+=step)result.push(i);return result;}case'SimpleNamespace':return this.namespace({...named});}
        }
        if(callable.method){const list=callable.owner;switch(callable.method){case'append':list.push(args[0]);if(this.keyLists.has(list))this.accessedKeys.add(this.keyId(args[0]));return null;case'insert':{const index=args[0]<0?Math.max(0,list.length+args[0]):Math.min(list.length,args[0]);list.splice(index,0,args[1]);if(this.keyLists.has(list))this.accessedKeys.add(this.keyId(args[1]));return null;}case'pop':{let index=args[0]??-1;if(index<0)index+=list.length;if(index<0||index>=list.length)throw Error('Python pop index out of range');const value=list.splice(index,1)[0];if(this.keyLists.has(list))this.accessedKeys.add(this.keyId(value));return value;}}}
        throw Error('Unsupported Python call');
      }
      throw Error('Unsupported Python expression '+node.type);
    }
    *assign(target,value){
      if(target.type==='name'){this.frame().locals[target.name]=value;return;}
      if(target.type==='attr'){const object=yield* this.evaluate(target.target);object[target.name]=value;return;}
      if(target.type==='index'){const list=yield* this.evaluate(target.target);let index=yield* this.evaluate(target.index);if(index<0)index+=list.length;if(index<0||index>=list.length)throw Error('Python assignment index out of range');list[index]=value;return;}throw Error('Unsupported assignment');
    }
    *emit(line,kind){
      if(++this.steps>150000)throw Error('Tree trace exceeded its safety limit.');
      if(this.onStep)yield this.onStep(line,kind,this);
      this.accessed.clear();this.accessedKeys.clear();
    }
    *execute(body){
      for(const stmt of body){
        if(stmt.type==='assign'){let value=yield* this.evaluate(stmt.value);if(stmt.op!=='='){const old=yield* this.evaluate(stmt.target);value=stmt.op==='+='?old+value:old-value;}yield* this.assign(stmt.target,value);this.pending=null;yield* this.emit(stmt.line,'assign');}
        else if(stmt.type==='expr'){yield* this.evaluate(stmt.value);this.pending=null;yield* this.emit(stmt.line,'call');}
        else if(stmt.type==='return'){const value=yield* this.evaluate(stmt.value);this.pending={value,name:this.frame().name};yield* this.emit(stmt.line,'return');return {type:'return',value};}
        else if(stmt.type==='break'||stmt.type==='continue'){yield* this.emit(stmt.line,stmt.type);return {type:stmt.type};}
        else if(stmt.type==='if'){
          let selected=false;for(const branch of stmt.branches){const result=truth(yield* this.evaluate(branch.condition));yield* this.emit(branch.line,result?'condition-true':'condition-false');if(result){selected=true;const control=yield* this.execute(branch.body);if(control)return control;break;}}
          if(!selected){const control=yield* this.execute(stmt.otherwise);if(control)return control;}
        }else if(stmt.type==='while'){
          while(true){const result=truth(yield* this.evaluate(stmt.condition));yield* this.emit(stmt.line,result?'loop-true':'loop-false');if(!result)break;const control=yield* this.execute(stmt.body);if(control?.type==='return')return control;if(control?.type==='break')break;}
        }else if(stmt.type==='for'){
          const values=yield* this.evaluate(stmt.iterable);let broken=false;
          for(const value of values){this.frame().locals[stmt.name]=value;yield* this.emit(stmt.line,'loop-true');const control=yield* this.execute(stmt.body);if(control?.type==='return')return control;if(control?.type==='break'){broken=true;break;}}
          if(!broken)yield* this.emit(stmt.line,'loop-false');
        }
      }
      return null;
    }
    *call(name,args){const fn=this.program.functions.get(name);if(!fn)throw Error('Unknown function '+name);const frame={id:this.nextFrame++,name,locals:{}};fn.params.forEach((p,i)=>frame.locals[p]=args[i]);this.frames.push(frame);const control=yield* this.execute(fn.body);this.frames.pop();return control?.value??null;}
    *run(){yield* this.execute(this.program.body);}
  }
  global.TreeRuntime={compile,Machine,truth};
})(typeof window!=='undefined'?window:globalThis);
