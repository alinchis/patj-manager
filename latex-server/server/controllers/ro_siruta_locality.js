'use strict';

import sequelize from 'sequelize';
import model from '../models';

const { RO_SIRUTA_locality } = model;

class RO_SIRUTA_localities {
  // CREATE::LOCAL a record on server
  static add(item) {
    const code_siruta = item[0];
    const name_ro = item[1];
    const name_en = item[2];
    const code_postal = item[3];
    const county_id = item[4];
    const code_siruta_sup = item[5];
    const code_type = item[6];
    const code_level = item[7];
    const code_med = item[8];
    const region_id = item[9];
    const code_fsj = item[10];
    const code_fs2 = item[11];
    const code_fs3 = item[12];
    const code_fsl = item[13];
    const rank = item[14];
    const fictional = item[15];

    return RO_SIRUTA_locality
    .findOrCreate({
      where: {code_siruta: code_siruta},
      defaults: {
        name_ro,
        name_en,
        code_postal,
        county_id,
        code_siruta_sup,
        code_type,
        code_level,
        code_med,
        region_id,
        code_fsj,
        code_fs2,
        code_fs3,
        code_fsl,
        rank,
        fictional
      }
    })
    .spread((record, created) => created)
    .then((created) => console.log('@ADD Locality item: ', created))
    .catch(err => console.log(err));
  };

  // GET::CLIENT all records
  static list(req, res) {
    return RO_SIRUTA_locality
    .findAll()
    .then(records => res.status(200).send({
      success: true,
      message: 'Retrieved ' + records.length + ' records',
      records
    }))
    .catch(err => res.status(200).send({
      success: false,
      message: err
    }))
  };

  // GET::CLIENT all UAT from given County via county_id
  static UATlist(req, res) {
    const { sirutaSup } = req.params
    return RO_SIRUTA_locality
    .findAll({
      where: { code_siruta_sup: sirutaSup }
    })
    .then(records => res.status(200).send({
      success: true,
      message: 'Retrieved ' + records.length + ' records',
      records
    }))
    .catch(err => res.status(200).send({
      success: false,
      message: err
    }))
  };

  // GET::LOCAL UAT data for given code_siruta
  // static getLocalUAT(siruta) {
  //   return RO_SIRUTA_locality
  //     .findAll({
  //       where: { code_siruta: siruta },
  //       raw: true
  //     })
  //     .then(function(uat) {
  //       console.log('@Latex: test...', uat[0])
  //       return uat[0];
  //     })
  // };
  static async getLocalUAT(req, res, siruta) {
    const records = await RO_SIRUTA_locality
      .findAll({
        where: { code_siruta: siruta },
        raw: true
      })
      .then(records => {
        console.log('Retrieved ' + records.length + ' records');
        records
      })
      .catch(err => console.log(err))
  };

  // GET::LOCAL UAT list of components for given code_siruta
  static async getLocalUATList(siruta) {
    const records = await RO_SIRUTA_locality
      .findAll({
        where: { code_siruta_sup: siruta },
        raw: true
      })
      .then(records => {
        console.log('Retrieved ' + records.length + ' records');
        records
      })
      .catch(err => console.log(err))
  };


  // GET::CLIENT all localities included in a UAT via code_siruta_sup = uat:code_siruta
  static localities(req, res) {
    const { sirutaUAT } = req.params
    return RO_SIRUTA_locality
    .findAll({
      where: { code_siruta_sup: sirutaUAT }
    })
    .then(records => res.status(200).send({
      success: true,
      message: 'Retrieved ' + records.length + ' records',
      records
    }))
    .catch(err => res.status(200).send({
      success: false,
      message: err
    }))
  };
};

export default RO_SIRUTA_localities
