
export default {

// get an array with
get_auto_codes: function ( state ) {
  console.log('@store: get_auto_codes')
  return state.counties.map(a => a.code_auto)
}

}
