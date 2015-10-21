parse = (s) ->
  __parse = (s) ->
    not1 = 0
    i = 0
    for x,i in s
      switch x
      | '!', '¬' =>
        not1+=1
        continue
      | '(' =>
        [var1, j] = __parse s.slice (i+1)
        i += j+1
        if s[i] != ')'
          throw new Error 'expect an ) in ' + s
      | ')' => throw new Error 'unexpected ) in '+s
      | '>', '→' => throw new Error 'unexpected operator in '+s
      | _ => var1 = x
      break

    if !(var1?)
      throw new Error "empty string "+s
    i++

    while i < s.length
      x = s[i]
      i++
      switch x
      | ')' => i-=1
      | '>', '→'  => op = '>'
      | _ => throw new Error 'expect an operator in '+s
      break
    p1 = var1
    for n from 1 to not1
      p1 = {op:'!', p:[p1]}

    if op?
      [p2, j] = __parse s.slice i
      return [{op:op, p:[p1, p2]}, i+j]
    return [p1, i]

  s = s.replace(/\s/g, '')
  [ptree, i] = __parse s
  if i< s.length
    throw new Error "unfinished string "+(s.slice i)
  return ptree
sort_uniq = (l) ->
  last = void
  for x in l.sort! when x!=last
    last = x
    x

get_vars = (ptree) ->
  __get_vars = (ptree) ->
    if (typeof ptree) == 'string'
      return [ptree]
    rtn = []
    for p in ptree.p
      rtn = rtn.concat __get_vars p
    return rtn
  sort_uniq __get_vars ptree

sub_vars = (ptree, table) ->
  if (typeof ptree) == 'string'
    if table[ptree]?
      return table[ptree]
    return ptree
  return {op: ptree.op, p: [sub_vars p, table for p in ptree.p]}

ptree_to_expression = (ptree) ->
  if (typeof ptree) == 'string'
    return ptree
  s_expr = [ptree_to_expression p for p in ptree.p]
  s0 = s_expr[0]
  if ptree.p[0].p?.length > 1
    s0 = '('+s0+')'
  if ptree.op == '>'
    rtn = s0 + '→'+s_expr[1]
  if ptree.op == '!'
    rtn = '¬' + s0
  return rtn

MP =(P, P_then_Q,unordered=true) ->
  console.log 'MP', P, P_then_Q, unordered
  if P_then_Q.op != '>'
    if unordered
      return MP P_then_Q, P, false
    throw Error 'P>Q must be an implication'
  if P_then_Q.p?[0] === P
    return P_then_Q.p[1]
  else
    if unordered
      return MP P_then_Q, P, false
    throw Error "can not do MP"

test_parse = !->
  data =
    * ['a>b' {op:'>' p: ['a' 'b']}]
    * ['!a' {op:'!' p:['a']}]
  for sr in data
    if !((parse sr[0]) === (sr[1]))
      throw new Error "test not passed " + sr
