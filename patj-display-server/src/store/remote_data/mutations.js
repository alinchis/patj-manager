
export default {

// HOME PAGE / commit loading the UATs from DB
MUT_LOAD_UATS: ( state, { list, index } ) => {
  console.log('@store: MUT_LOAD_UATS')
  // clear current data from state
  state.counties[index].uat = []
  // set the values get from DB
  state.counties[index].uat = list
},

// HOME PAGE / commit the current county
MUT_SET_CURRENT_COUNTY: ( state, table_id) => {
  console.log('@store: MUT_SET_CURRENT_COUNTY = ', table_id)
  state.current_selection.county_index = table_id
  state.current_selection.county_code_auto = state.counties[table_id].code_auto
  state.current_selection.county_name_ro = state.counties[table_id].name_ro
},
// creal current county
MUT_CLEAR_CURRENT_COUNTY: ( state ) => {
  console.log('@store: MUT_CLEAR_CURRENT_COUNTY')
  state.current_selection.county_index = ''
  state.current_selection.county_code_auto = ''
  state.current_selection.county_name_ro = ''
},

// PROJECT PAGE / set current UAT based on SIRUTA
MUT_SET_CURRENT_UAT: ( state, uat_siruta) => {
  let table_id = state.current_selection.county_index
  let uat_index = state.counties[table_id].uat.map( (item) => item.code_siruta).indexOf(uat_siruta)
  console.log('@store: MUT_SET_CURRENT_UAT = ', uat_siruta)
  state.current_selection.uat_siruta = uat_siruta
  state.current_selection.uat_index = uat_index
  state.current_selection.uat_name_ro = state.counties[table_id].uat[uat_index].name_ro
},
// clear current UAT
MUT_CLEAR_CURRENT_UAT: ( state ) => {
  console.log('@store: MUT_CLEAR_CURRENT_UAT')
  state.current_selection.uat_siruta = ''
  state.current_selection.uat_index = ''
  state.current_selection.uat_name_ro = ''
}

}
