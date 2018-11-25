
import fs from 'fs';
import model from '../models';

const { RO_SIRUTA_county } = model;
const csvFilePath = '../control-data/siruta/siruta-counties.csv';
const csvDelimiter = ';';


class RO_SIRUTA_counties {
  // delete all data from table
  static clear(req, res) {
    return model.sequelize.query('TRUNCATE TABLE public."RO_SIRUTA_counties" RESTART IDENTITY')
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
        where: { id: id },
        defaults: {
          name_ro,
          name_en,
          code_fsj,
          code_auto,
          region_id,
        },
      })
      .spread((record, created) => created)
      .then(created => created)
      .catch(err => err);
  }

  // CREATE a bulk of items at once
  static addBulk(items) {
    return RO_SIRUTA_county
      .bulkCreate(items, { validate: true })
      .then(() => RO_SIRUTA_county.findAll({
        attributes: [[model.sequelize.fn('COUNT', model.sequelize.col('*')), 'total']],
      }))
      .catch(err => err);
  }

  // READ Data from CSV file
  static readCSV(csvPath, delimiter) {
    return fs.readFileSync(csvPath)
      .toString()
      .split('\n')
      .splice(1)
      .map((line) => {
        // avoid empty lines and header
        if (line !== '') {
          const record = line.split(delimiter);
          // console.log('@line: ', record);
          return {
            id: record[0],
            name_ro: record[1],
            name_en: record[2],
            code_fsj: record[3],
            code_auto: record[4],
            region_id: record[5],
          };
        }
      })
      .filter(line => line);
  }

  // UPLOAD data from CSV file
  static uploadCSV(req, res) {
    const arrSiruta = RO_SIRUTA_counties.readCSV(csvFilePath, csvDelimiter);
    // console.log(arrSiruta);
    RO_SIRUTA_counties.addBulk(arrSiruta)
      .then(value => res.send(value))
      .catch(err => err);
  }

  // GET all records
  static list(req, res) {
    return RO_SIRUTA_county
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
}

export default RO_SIRUTA_counties;
