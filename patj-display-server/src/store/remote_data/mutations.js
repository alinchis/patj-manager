
import Axios from 'axios'


export default {

//// HOME PAGE / commit loading the UATs from DB
MUT_LOAD_UATS: ( state, { list, index } ) => {
  console.log('@store: MUT_LOAD_UATS')
  // clear current data from state
  state.counties[index].uat = []
  // set the values get from DB
  state.counties[index].uat = list
},

//// HOME PAGE / commit the current county
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

//// PROJECT PAGE / set current UAT based on SIRUTA
MUT_SET_CURRENT_UAT: ( state, uat_siruta) => {
  let table_id = state.current_selection.county_index
  let uat_index = state.counties[table_id].uat.map( (item) => item.code_siruta).indexOf(uat_siruta)
  console.log('@store: MUT_SET_CURRENT_UAT = ', uat_siruta)
  state.current_selection.uat_siruta = uat_siruta
  state.current_selection.uat_index = uat_index
  state.current_selection.uat_name_ro = state.counties[table_id].uat[uat_index].name_ro
  state.current_selection.uat_name_en = state.counties[table_id].uat[uat_index].name_en

  // send request to control-server to create the pdf file
  Axios.get('/api/uat/' + uat_siruta + '/pdfcreate')
  .then( (response) => {
    const file_name = response.pdf_path
    console.log('@store: MUT_SET_CURRENT_UAT > Pdf file created on server: ', file_name)
    state.current_selection.uat_pdf_path = 'http://localhost:3333/static/' + uat_siruta + '.pdf#zoom=100'
  })
  // error management
  .catch(function (error) {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.log('ERR data', error.response.data)
      console.log('ERR status', error.response.status)
      console.log('ERR header', error.response.headers)
    } else if (error.request) {
      // The request was made but no response was received
      // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
      // http.ClientRequest in node.js
      console.log('ERR request', error.request)
    } else {
      // Something happened in setting up the request that triggered an Error
      console.log('Error', error.message)
    }
    console.log(error.config)
  })
},
// clear current UAT
MUT_CLEAR_CURRENT_UAT: ( state ) => {
  console.log('@store: MUT_CLEAR_CURRENT_UAT')
  const uat_siruta = state.current_selection.uat_siruta

  state.current_selection.uat_siruta = ''
  state.current_selection.uat_index = ''
  state.current_selection.uat_name_ro = ''
  state.current_selection.uat_name_en = ''
  state.current_selection.uat_pdf_path = ''

  // send request to control-server to delete the pdf file
  Axios.get('/api/uat/' + uat_siruta + '/pdfdelete')
  .then( (response) => {
    // !!! for some reason it does not go on this branch
    console.log('@store: MUT_CLEAR_CURRENT_UAT > Pdf file deleted on server: ', response.data)
    state.current_selection.uat_pdf_path = ''
  })
  // error management
  .catch(function (error) {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.log('ERR data', error.response.data)
      console.log('ERR status', error.response.status)
      console.log('ERR header', error.response.headers)
    } else if (error.request) {
      // The request was made but no response was received
      // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
      // http.ClientRequest in node.js
      console.log('ERR request', error.request)
    } else {
      // Something happened in setting up the request that triggered an Error
      console.log('Error', error.message)
    }
    console.log(error.config)
  })
}

}
