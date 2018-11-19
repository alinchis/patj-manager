'use strict';

import model from '../models';

const { RO_SIRUTA_county } = model;

class RO_SIRUTA_counties {
  // CREATE a record on server
  static add(item) {
    const { id, name_ro, name_en, code_fsj, code_auto, region_id } = item;
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
    .then(() => {
      res.status(200).send(RO_SIRUTA_region.count())
    })
  };

  // GET all records
  static list(req, res) {
    return RO_SIRUTA_county
    .findAll()
    .then(records => res.status(200).send(records));
  };
};

export default RO_SIRUTA_counties;
