import fs from 'fs';
import model from '../models';

const { tempo_geography } = model;
const csvFilePath = '../control-data/siruta/siruta-localities.csv';
const csvDelimiter = ';';


class tempo_geographies {
    // ////////////////////////////////////////////////////////////////////////////
    // METHODS

    // CREATE a record on server
    static dbAdd(item) {
        const code_siruta = item[0];
        const code_siruta_sup = item[1];
        const name_ro = item[2];
        const name_en = item[3];

        return tempo_geography
            .findOrCreate({
                where: { code_siruta: code_siruta },
                defaults: {
                    code_siruta_sup,
                    name_ro,
                    name_en,
                },
            })
            .spread((record, created) => created)
            .then(created => created)
            .catch(err => err);
    }

    // CREATE a bulk of items at once
    static dbAddBulk(items) {
        return tempo_geography
            .bulkCreate(items, { validate: true })
            .then(() => tempo_geography.findAll({
                attributes: [[model.sequelize.fn('COUNT', model.sequelize.col('*')), 'total']],
            }))
            .catch(err => err);
    }

    // READ Data from CSV file
    static fsReadCSV(csvPath, delimiter) {
        return fs.readFileSync(csvPath)
            .toString()
            .split('\n')
            .filter(line => line !== '')
            .map((line, index) => {
                let code_siruta = '';
                let code_siruta_sup = '';
                let name_ro = '';
                let name_en = '';
                // for normal lines
                if (index > 0) {
                    const record = line.split(delimiter);
                    // console.log('@line: ', record);
                    code_siruta = record[0];
                    code_siruta_sup = record[5];
                    name_ro = record[1];
                    name_en = record[2];
                    // replace header row with 'Romania' item
                } else {
                    code_siruta = '1';
                    code_siruta_sup = '0';
                    name_ro = 'România';
                    name_en = 'Romania';
                }
                // return value
                return {
                    code_siruta,
                    code_siruta_sup,
                    name_ro,
                    name_en,
                };
            });
    }

    // GET::LOCAL UAT list of included localities for given code_siruta
    static dbGetLocalUATList(siruta) {
        return tempo_geography
            .findAll({
                where: { code_siruta_sup: siruta },
                raw: true,
            })
            .catch(err => err);
    }

    // GET: UAT row
    static dbGetLocalUAT(siruta) {
        return tempo_geography
            .findAll({
                where: { code_siruta: siruta },
                raw: true,
            })
            .catch(err => console.log(err));
    }

    // ////////////////////////////////////////////////////////////////////////////
    // REQUESTS

    // delete all data from table
    static clear(req, res) {
        return model.sequelize.query('TRUNCATE TABLE public."tempo_geographies" RESTART IDENTITY')
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
        const arrSiruta = tempo_geographies.fsReadCSV(csvFilePath, csvDelimiter);
        // console.log(arrSiruta);
        tempo_geographies.dbAddBulk(arrSiruta)
            .then(value => res.send(value))
            .catch(err => err);
    }

    // GET::CLIENT all records
    static list(req, res) {
        return tempo_geography
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
        // raw sql alternative
        // return model.sequelize.query('SELECT * FROM public."tempo_geographies"')
        //     .spread((results, metadata) => {
        //         // Results will be an empty array and metadata will contain the number of affected rows.
        //         res.status(200)
        //             .json({
        //                 status: metadata,
        //                 data: results,
        //                 message: 'Table items',
        //             });
        //     });
    }

    // GET::CLIENT all UAT from given County via county_id
    static UATlist(req, res) {
        const { sirutaSup } = req.params;
        return tempo_geography
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
        return tempo_geography
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

export default tempo_geographies;