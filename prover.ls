
mpthis =  ->
  P = parse (document.getElementById 'P').value
  P_then_Q = parse (document.getElementById 'P_then_Q').value
  Q = MP P, P_then_Q
  Qexpr = ptree_to_expression Q
  document.getElementById('output').innerHTML = '<div>'+(Qexpr)+'</div>'

axioms = for p in ['p>q>p' '(p>q>r)>(p>q)>p>r' '(!p>!q)>q>p']
  sub_vars (parse p), {p:'_p_', q:'_q_', r:'_r_'}
assumptions = []
steps = []
assumption_vars = []

prop_table={A:axioms, H:assumptions, S:steps}
get_prop = (s) ->
  prop_table[s[0]][(s.slice(1).|.0)-1]
step_reasons = []
selected = []
selected_seq = []
sub_seq = []

mk_sub = (p) ->
  seq = 'subvar_'+p
  sub_seq.push seq
  label = '<span>'+p+'</span> '
  input = '<input width=50 id="'+seq+'" value="'+(p.replace /_/g '')+'"/>'
  li = '<li>'+ label+" : "+ input+'</li>'
  ($ '#sub_vars').append li


mk_li = (prefix, num, p, reason) !->
  seq = prefix + num
  label = '<span>'+seq+'</span>'
  expr = '<input style="font-size: large" value="'+(ptree_to_expression p)+'" size=40 readonly/>'
  remark = '<span>('+reason+')</span>'
  li = '<li id="step_'+seq+'">'+ label+" : "+ expr + "&nbsp; "+remark+'</li>'
  ($ '#proof').append li

prop_selected = ( event, ui ) !->
  selected := $ '.ui-selected'
  selected_seq := [(x.id.slice 5) for x in selected]
  $('#selected_steps').html selected_seq.join ","
  if selected.length >= 1
    $('#mp_p1').html ($ selected[0]).html!
    $('#sub_p').html ($ selected[0]).html!
    vars = get_vars get_prop selected_seq[0]
    $('#sub_vars').html('')
    sub_seq := []
    for p in vars when p not in assumption_vars
      mk_sub p
  else
    $('#mp_p1').html 'Please select steps'
    $('#sub_p').html 'Please select steps'
    $('#sub_vars').html('')
    sub_seq := []
  if selected.length >= 2
    $('#mp_p2').html ($ selected[1]).html!
  else
    $('#mp_p2').html 'Please select steps'

get_sub_prop = ->
  1

init_proof = !->
  $('#tabs').tabs!
  for ax,i in axioms
    mk_li 'A', i+1, ax, "axiom"
  ($ '.prop_list').selectable do
    selected: prop_selected
    unselected: prop_selected

add_mp = !->
  if selected.length <2
    $('#message').html('<span style="color: red"> need two propositions</span>')
    return
  seq1 = selected_seq[0]
  seq2 = selected_seq[1]
  prop1 = get_prop seq1
  prop2 = get_prop seq2
  try
        prop = MP prop1, prop2
  catch {message}
    $('#message').html('<span style="color: red">'+message+'</span>')
  prop_expr = ptree_to_expression prop
  i = steps.length
  reason = ["MP", seq1, seq2]
  steps.push prop
  step_reasons.push reason
  mk_li 'S', (i+1), prop, reason.join ','

add_assumption = ->
  s = ($ '#new_assumption').val!
  try
    p = parse s
    i = assumptions.length
    assumptions.push p
    mk_li 'H', (i+1), p, 'assumption'
    $('#message').html('<span style="color: green">OK!</span>')
  catch {message}
    $('#message').html('<span style="color: red">'+message+'</span>')
  assumption_vars := []
  for p in assumptions
    Array.prototype.push.apply assumption_vars, get_vars p
  assumption_vars := sort_uniq assumption_vars
  console.log assumption_vars

add_sub = ->
  if selected.length <1
    $('#message').html('<span style="color: red"> need a proposition</span>')
    return
  seq1 = selected_seq[0]
  prop1 = get_prop seq1
  table_items = for ss in sub_seq
    [(ss.slice 7), parse ($ '#'+ss).val!]
  table = {[k,v] for [k,v] in table_items when k != ptree_to_expression v}
  console.log table
  prop = sub_vars prop1, table
  prop_expr = ptree_to_expression prop
  i = steps.length
  reason = ["SUB", seq1, table]
  table_src = [k+'/'+ptree_to_expression v for k,v of table].join ','
  steps.push prop
  step_reasons.push reason
  mk_li 'S', (i+1), prop, reason[0]+","+reason[1]+","+table_src
