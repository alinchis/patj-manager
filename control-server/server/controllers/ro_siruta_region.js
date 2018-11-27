
import fs from 'fs';
import model from '../models';


const { RO_SIRUTA_region } = model;
const csvFilePath = '../control-data/siruta/siruta-regions.csv';
const csvDelimiter = ';';

class RO_SIRUTA_regions {

  // ////////////////////////////////////////////////////////////////////////////
  // METHODS

  // CREATE a record on server
  static dbAdd(item) {
    const id = item[0];
    const codeSiruta = item[1];
    const nameRo = item[2];
    const nameEn = item[3];

    return RO_SIRUTA_region
      .findOrCreate({
        where: { id: id },
        defaults: {
          codeSiruta,
          nameRo,
          nameEn,
        },
      })
      .spread((record, created) => created)
      .then(created => created)
      .catch(err => err);
  }

  // CREATE a bulk of items at once
  static dbAddBulk(items) {
    return RO_SIRUTA_region
      .bulkCreate(items, { validate: true })
      .then(() => RO_SIRUTA_region.findAll({
        attributes: [[model.sequelize.fn('COUNT', model.sequelize.col('*')), 'total']],
      }))
      .catch(err => err);
  }

  // READ Data from CSV file
  static fsReadCSV(csvPath, delimiter) {
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
            code_siruta: record[1],
            name_ro: record[2],
            name_en: record[3],
          };
        }
      })
      .filter(line => line);
  }

  // ////////////////////////////////////////////////////////////////////////////
  // REQUESTS

  // delete all data from table
  static clear(req, res) {
    return model.sequelize.query('TRUNCATE TABLE public."RO_SIRUTA_regions" RESTART IDENTITY')
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
    const arrSiruta = RO_SIRUTA_regions.fsReadCSV(csvFilePath, csvDelimiter);
    // console.log(arrSiruta);
    RO_SIRUTA_regions.dbAddBulk(arrSiruta)
      .then(value => res.send(value))
      .catch(err => err);
  }

  // GET all records
  static list(req, res) {
    return RO_SIRUTA_region
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

export default RO_SIRUTA_regions;
