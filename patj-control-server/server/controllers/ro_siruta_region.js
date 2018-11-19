'use strict';

import model from '../models';

const { RO_SIRUTA_region } = model;

class RO_SIRUTA_regions {
  // CREATE a record on server
  static add(item) {
    const { id, code_siruta, name_ro, name_en } = item;
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
    .then(() => {
      res.status(200).send(RO_SIRUTA_region.count())
    })
  };

  // GET all records
  static list(req, res) {
    return RO_SIRUTA_region
    .findAll()
    .then(records => res.status(200).send(records));
  }
};

export default RO_SIRUTA_regions;
