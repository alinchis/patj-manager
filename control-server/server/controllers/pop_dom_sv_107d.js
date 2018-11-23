'use strict';

import model from '../models';

const { pop_dom_SV_107D } = model;

class POP_dom_SV_107Ds {
  // CREATE a record on server
  static add(item) {
    const code_siruta = item[0];
    const u_admin = item[1];
    const name_en = item[2];
    const y1992 = item[3];
    const y1993 = item[4];
    const y1994 = item[5];
    const y1995 = item[6];
    const y1996 = item[7];
    const y1997 = item[8];
    const y1998 = item[9];
    const y1999 = item[10];
    const y2000 = item[11];
    const y2001 = item[12];
    const y2002 = item[13];
    const y2003 = item[14];
    const y2004 = item[15];
    const y2005 = item[16];
    const y2006 = item[17];
    const y2007 = item[18];
    const y2008 = item[19];
    const y2009 = item[20];
    const y2010 = item[11];
    const y2011 = item[12];
    const y2012 = item[13];
    const y2013 = item[14];
    const y2014 = item[15];
    const y2015 = item[16];
    const y2016 = item[17];
    const y2017 = item[18];
    const y2018 = item[19];

    return pop_dom_SV_107D
    .findOrCreate({
      where: {code_siruta: code_siruta},
      defaults: {
        u_admin,
        name_en,
        y1992,
        y1993,
        y1994,
        y1995,
        y1996,
        y1997,
        y1998,
        y1999,
        y2000,
        y2001,
        y2002,
        y2003,
        y2004,
        y2005,
        y2006,
        y2007,
        y2008,
        y2009,
        y2010,
        y2011,
        y2012,
        y2013,
        y2014,
        y2015,
        y2016,
        y2017,
        y2018
      }
    })
    .spread((record, created) => created)
    .then((created) => res.status(201).send({
      success: true,
      message: 'POP_dom_SV_107Ds with SIRUTA = ' + code_siruta + 'added successfully',
      created
    }))
  };

  // GET all records
  static list(req, res) {
    return pop_dom_SV_107D
    .findAll()
    .then(records => res.status(200).send({
      success: true,
      message: 'Query successful: ' + records.lenght + ' found',
      records
    }));
  };

};

export default POP_dom_SV_107Ds
