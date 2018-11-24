'use strict';

import model from '../models';

const { RO_SIRUTA_county } = model;

class RO_SIRUTA_counties {
  // CREATE a record on server
  static add(item) {
    const id = item[0];
    const name_ro = item[1];
    const name_en = item[2];
    const code_fsj = item[3];
    const code_auto = item[4];
    const region_id = item[5];

    return RO_SIRUTA_county
    .findOrCreate({
      where: {id: id},
      defaults: {
        name_ro,
        name_en,
        code_fsj,
        code_auto,
        region_id
      }
    })
    .spread((record, created) => created)
    .then((created) => {
      console.log('@ADD County item: ', created)
    })
    .catch(err => res.status(200).send({
      success: false,
      message: err
    }))
  };

  // GET all records
  static list(req, res) {
    return RO_SIRUTA_county
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
};

export default RO_SIRUTA_counties;
