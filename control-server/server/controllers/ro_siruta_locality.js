
import fs from 'fs';
import model from '../models';

const { RO_SIRUTA_locality } = model;
const csvFilePath = '../control-data/siruta/siruta-localities.csv';
const csvDelimiter = ';';


class RO_SIRUTA_localities {
  // ////////////////////////////////////////////////////////////////////////////
  // METHODS

  // CREATE::LOCAL a record on server
  static dbAdd(item) {
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
        where: { code_siruta: code_siruta },
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
          fictional,
        },
      })
      .spread((record, created) => created)
      .then(created => created)
      .catch(err => err);
  }

  // CREATE a bulk of items at once
  static dbAddBulk(items) {
    return RO_SIRUTA_locality
      .bulkCreate(items, { validate: true })
      .then(() => RO_SIRUTA_locality.findAll({
        attributes: [[model.sequelize.fn('COUNT', model.sequelize.col('*')), 'total']],
      }))
      .catch(err => err);
  }

  // READ Data from CSV file
  static fsReadCSV(csvPath, delimiter) {
    return fs.readFileSync(csvPath)
      .toString()
      .split('\n')
      // remove header row
      .splice(1)
      .map((line) => {
        // avoid empty lines
        if (line !== '') {
          const record = line.split(delimiter);
          // console.log('@line: ', record);
          return {
            code_siruta: record[0],
            name_ro: record[1],
            name_en: record[2],
            code_postal: record[3],
            county_id: record[4],
            code_siruta_sup: record[5],
            code_type: record[6],
            code_level: record[7],
            code_med: record[8],
            region_id: record[9],
            code_fsj: record[10],
            code_fs2: record[11],
            code_fs3: record[12],
            code_fsl: record[13],
            rank: record[14],
            fictional: record[15],
          };
        }
      })
      .filter(line => line);
  }

  // GET::LOCAL UAT list of included localities for given code_siruta
  static async dbGetLocalUATList(siruta) {
    await RO_SIRUTA_locality
      .findAll({
        where: { code_siruta_sup: siruta },
        raw: true,
      })
      .then((records) => {
        // console.log(`Retrieved ${records.length} records`);
        return records;
      })
      .catch(err => err);
  }

  // GET: UAT row
  static async dbGetLocalUAT(siruta) {
    await RO_SIRUTA_locality
      .findAll({
        where: { code_siruta: siruta },
        raw: true,
      })
      .then((records) => {
        // console.log(`Retrieved ${records.length} records`);
        return records;
      })
      .catch(err => console.log(err));
  }


  // ////////////////////////////////////////////////////////////////////////////
  // REQUESTS

  // delete all data from table
  static clear(req, res) {
    return model.sequelize.query('TRUNCATE TABLE public."RO_SIRUTA_localities" RESTART IDENTITY')
      .spread((results, metadata) => {
        // Results will be an empty array and metadata will contain the number of affected rows.
        res.status(200)
          .json({
            status: metadata,
            data: results,
            message: 'Table cleared',
          });
      });
  }

  // UPLOAD data from CSV file
  static uploadCSV(req, res) {
    const arrSiruta = RO_SIRUTA_localities.fsReadCSV(csvFilePath, csvDelimiter);
    // console.log(arrSiruta);
    RO_SIRUTA_localities.dbAddBulk(arrSiruta)
      .then(value => res.send(value))
      .catch(err => err);
  }

  // GET::CLIENT all records
  static list(req, res) {
    return RO_SIRUTA_locality
      .findAll()
      .then(records => res.status(200).send({
        success: true,
        message: `Retrieved ${records.length} records`,
        records,
      }))
      .catch(err => res.status(200).send({
        success: false,
        message: err,
      }));
  }

  // GET::CLIENT all UAT from given County via county_id
  static UATlist(req, res) {
    const { sirutaSup } = req.params;
    return RO_SIRUTA_locality
      .findAll({
        where: { code_siruta_sup: sirutaSup },
      })
      .then(records => res.status(200).send({
        success: true,
        message: `Retrieved ${records.length} records`,
        records,
      }))
      .catch(err => res.status(200).send({
        success: false,
        message: err,
      }));
  }

  // GET::CLIENT all localities included in a UAT via code_siruta_sup = uat:code_siruta
  static localities(req, res) {
    const { sirutaUAT } = req.params;
    return RO_SIRUTA_locality
      .findAll({
        where: { code_siruta_sup: sirutaUAT },
      })
      .then(records => res.status(200).send({
        success: true,
        message: `Retrieved ${records.length} records`,
        records,
      }))
      .catch(err => res.status(200).send({
        success: false,
        message: err,
      }));
  }
}

export default RO_SIRUTA_localities;
