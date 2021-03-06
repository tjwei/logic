// Generated by LiveScript 1.3.1
var parse, sort_uniq, get_vars, sub_vars, ptree_to_expression, MP, test_parse;
parse = function(s){
  var __parse, ref$, ptree, i;
  __parse = function(s){
    var not1, i, i$, len$, x, ref$, var1, j, op, p1, n, p2;
    not1 = 0;
    i = 0;
    for (i$ = 0, len$ = s.length; i$ < len$; ++i$) {
      i = i$;
      x = s[i$];
      switch (x) {
      case '!':
      case '¬':
        not1 += 1;
        continue;
      case '(':
        ref$ = __parse(s.slice(i + 1)), var1 = ref$[0], j = ref$[1];
        i += j + 1;
        if (s[i] !== ')') {
          throw new Error('expect an ) in ' + s);
        }
        break;
      case ')':
        throw new Error('unexpected ) in ' + s);
      case '>':
      case '→':
        throw new Error('unexpected operator in ' + s);
      default:
        var1 = x;
      }
      break;
    }
    if (!(var1 != null)) {
      throw new Error("empty string " + s);
    }
    i++;
    while (i < s.length) {
      x = s[i];
      i++;
      switch (x) {
      case ')':
        i -= 1;
        break;
      case '>':
      case '→':
        op = '>';
        break;
      default:
        throw new Error('expect an operator in ' + s);
      }
      break;
    }
    p1 = var1;
    for (i$ = 1; i$ <= not1; ++i$) {
      n = i$;
      p1 = {
        op: '!',
        p: [p1]
      };
    }
    if (op != null) {
      ref$ = __parse(s.slice(i)), p2 = ref$[0], j = ref$[1];
      return [
        {
          op: op,
          p: [p1, p2]
        }, i + j
      ];
    }
    return [p1, i];
  };
  s = s.replace(/\s/g, '');
  ref$ = __parse(s), ptree = ref$[0], i = ref$[1];
  if (i < s.length) {
    throw new Error("unfinished string " + s.slice(i));
  }
  return ptree;
};
sort_uniq = function(l){
  var last, i$, ref$, len$, x, results$ = [];
  last = void 8;
  for (i$ = 0, len$ = (ref$ = l.sort()).length; i$ < len$; ++i$) {
    x = ref$[i$];
    if (x !== last) {
      last = x;
      results$.push(x);
    }
  }
  return results$;
};
get_vars = function(ptree){
  var __get_vars;
  __get_vars = function(ptree){
    var rtn, i$, ref$, len$, p;
    if (typeof ptree === 'string') {
      return [ptree];
    }
    rtn = [];
    for (i$ = 0, len$ = (ref$ = ptree.p).length; i$ < len$; ++i$) {
      p = ref$[i$];
      rtn = rtn.concat(__get_vars(p));
    }
    return rtn;
  };
  return sort_uniq(__get_vars(ptree));
};
sub_vars = function(ptree, table){
  var p;
  if (typeof ptree === 'string') {
    if (table[ptree] != null) {
      return table[ptree];
    }
    return ptree;
  }
  return {
    op: ptree.op,
    p: (function(){
      var i$, ref$, len$, results$ = [];
      for (i$ = 0, len$ = (ref$ = ptree.p).length; i$ < len$; ++i$) {
        p = ref$[i$];
        results$.push(sub_vars(p, table));
      }
      return results$;
    }())
  };
};
ptree_to_expression = function(ptree){
  var s_expr, res$, i$, ref$, len$, p, s0, rtn;
  if (typeof ptree === 'string') {
    return ptree;
  }
  res$ = [];
  for (i$ = 0, len$ = (ref$ = ptree.p).length; i$ < len$; ++i$) {
    p = ref$[i$];
    res$.push(ptree_to_expression(p));
  }
  s_expr = res$;
  s0 = s_expr[0];
  if (((ref$ = ptree.p[0].p) != null ? ref$.length : void 8) > 1) {
    s0 = '(' + s0 + ')';
  }
  if (ptree.op === '>') {
    rtn = s0 + '→' + s_expr[1];
  }
  if (ptree.op === '!') {
    rtn = '¬' + s0;
  }
  return rtn;
};
MP = function(P, P_then_Q, unordered){
  var ref$;
  unordered == null && (unordered = true);
  console.log('MP', P, P_then_Q, unordered);
  if (P_then_Q.op !== '>') {
    if (unordered) {
      return MP(P_then_Q, P, false);
    }
    throw Error('P>Q must be an implication');
  }
  if (deepEq$((ref$ = P_then_Q.p) != null ? ref$[0] : void 8, P, '===')) {
    return P_then_Q.p[1];
  } else {
    if (unordered) {
      return MP(P_then_Q, P, false);
    }
    throw Error("can not do MP");
  }
};
test_parse = function(){
  var data, i$, len$, sr;
  data = [
    [
      'a>b', {
        op: '>',
        p: ['a', 'b']
      }
    ], [
      '!a', {
        op: '!',
        p: ['a']
      }
    ]
  ];
  for (i$ = 0, len$ = data.length; i$ < len$; ++i$) {
    sr = data[i$];
    if (!deepEq$(parse(sr[0]), sr[1], '===')) {
      throw new Error("test not passed " + sr);
    }
  }
};
function deepEq$(x, y, type){
  var toString = {}.toString, hasOwnProperty = {}.hasOwnProperty,
      has = function (obj, key) { return hasOwnProperty.call(obj, key); };
  var first = true;
  return eq(x, y, []);
  function eq(a, b, stack) {
    var className, length, size, result, alength, blength, r, key, ref, sizeB;
    if (a == null || b == null) { return a === b; }
    if (a.__placeholder__ || b.__placeholder__) { return true; }
    if (a === b) { return a !== 0 || 1 / a == 1 / b; }
    className = toString.call(a);
    if (toString.call(b) != className) { return false; }
    switch (className) {
      case '[object String]': return a == String(b);
      case '[object Number]':
        return a != +a ? b != +b : (a == 0 ? 1 / a == 1 / b : a == +b);
      case '[object Date]':
      case '[object Boolean]':
        return +a == +b;
      case '[object RegExp]':
        return a.source == b.source &&
               a.global == b.global &&
               a.multiline == b.multiline &&
               a.ignoreCase == b.ignoreCase;
    }
    if (typeof a != 'object' || typeof b != 'object') { return false; }
    length = stack.length;
    while (length--) { if (stack[length] == a) { return true; } }
    stack.push(a);
    size = 0;
    result = true;
    if (className == '[object Array]') {
      alength = a.length;
      blength = b.length;
      if (first) {
        switch (type) {
        case '===': result = alength === blength; break;
        case '<==': result = alength <= blength; break;
        case '<<=': result = alength < blength; break;
        }
        size = alength;
        first = false;
      } else {
        result = alength === blength;
        size = alength;
      }
      if (result) {
        while (size--) {
          if (!(result = size in a == size in b && eq(a[size], b[size], stack))){ break; }
        }
      }
    } else {
      if ('constructor' in a != 'constructor' in b || a.constructor != b.constructor) {
        return false;
      }
      for (key in a) {
        if (has(a, key)) {
          size++;
          if (!(result = has(b, key) && eq(a[key], b[key], stack))) { break; }
        }
      }
      if (result) {
        sizeB = 0;
        for (key in b) {
          if (has(b, key)) { ++sizeB; }
        }
        if (first) {
          if (type === '<<=') {
            result = size < sizeB;
          } else if (type === '<==') {
            result = size <= sizeB
          } else {
            result = size === sizeB;
          }
        } else {
          first = false;
          result = size === sizeB;
        }
      }
    }
    stack.pop();
    return result;
  }
}