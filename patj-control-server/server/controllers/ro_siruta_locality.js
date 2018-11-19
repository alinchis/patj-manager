'use strict';

import model from '../models';

const { RO_SIRUTA_locality } = model;

class RO_SIRUTA_localities {
  // CREATE a record on server
  static add(item) {
    const {
      code_siruta,
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
    } = item
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
    .spread((item, created) => {
      // console.log(item.get({
      //   plain: true
      // }))
      // console.log(item.code_siruta + ' Locality: ' + created)
      return
    })
    .spread((record, created) => created)
    .then(() => {
      res.status(200).send(RO_SIRUTA_region.count())
    })
  };

  // GET all records
  static list(req, res) {
    return RO_SIRUTA_locality
    .findAll()
    .then(records => res.status(200).send(records));
  };

  // GET all UAT from given County via county_id
  static UATlist(req, res) {
    const { sirutaSup } = req.params
    return RO_SIRUTA_locality
    .findAll({
      where: { code_siruta_sup: sirutaSup }
    })
    .then(records => res.status(200).send(records));
  };

  // GET all localities included in a UAT via code_siruta_sup = uat:code_siruta
  static localities(req, res) {
    const { sirutaUAT } = req.params
    return RO_SIRUTA_locality
    .findAll({
      where: { code_siruta_sup: sirutaUAT }
    })
    .then(records => res.status(200).send(records));
  };
};

export default RO_SIRUTA_localities
