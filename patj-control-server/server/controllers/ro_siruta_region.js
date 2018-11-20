'use strict';

import model from '../models';

const { RO_SIRUTA_region } = model;

class RO_SIRUTA_regions {
  // CREATE a record on server
  static add(item) {
    const id = item[0];
    const code_siruta = item[1];
    const name_ro = item[2];
    const name_en = item[3];

    return RO_SIRUTA_region
    .findOrCreate({
      where: {id: id},
      defaults: {
        code_siruta,
        name_ro,
        name_en
      }
    })
    .spread((record, created) => created)
    .then((created) => {
      console.log('@ADD Region item: ', created)
    });
  };

  // GET all records
  static list(req, res) {
    return RO_SIRUTA_region
    .findAll()
    .then(records => res.status(200).send(records));
  }
};

export default RO_SIRUTA_regions;
