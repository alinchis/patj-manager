import fs from 'fs';
import model from '../models';

const { tempo_chapter } = model;
const jsonFilePath = '../control-data/insse/tempoL1.json';


class tempo_chapters {
    // ////////////////////////////////////////////////////////////////////////////
    // METHODS

    // CREATE a record on server
    static dbAdd(item) {
        const {
            parent_code,
            level,
            index,
            name,
            code,
            childrenUrl,
            comment,
            url,
        } = { item };

        return tempo_chapter
            .findOrCreate({
                where: { code: code },
                defaults: {
                    parent_code,
                    level,
                    index,
                    name,
                    childrenUrl,
                    comment,
                    url,
                },
            })
            .spread((record, created) => created)
            .then(created => created)
            .catch(err => err);
    }

    // CREATE a bulk of items at once
    static dbAddBulk(items) {
        return tempo_chapter
            .bulkCreate(items, { validate: true })
            .then(() => tempo_chapter.findAll({
                attributes: [[model.sequelize.fn('COUNT', model.sequelize.col('*')), 'total']],
            }))
            .catch(err => err);
    }

    // READ Data from JSON file
    static fsReadJSON(jsonPath) {
        const { level1 } = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
        return level1
            .map((item) => {
                const newIndex = item.context.name.replace(/^(.\.\d*)\s+.*$/g, `$1`);
                const newName = item.context.name.replace(/^.\.\d*\s+/g, '');

                return {
                    parent_code: item.parentCode,
                    level: item.level,
                    index: newIndex,
                    name: newName,
                    code: item.context.code,
                    childrenUrl: item.context.childrenUrl,
                    comment: item.context.comment || '',
                    url: item.context.url,
                };
            });
    }


    // ////////////////////////////////////////////////////////////////////////////
    // REQUESTS

    // delete all data from table
    static clear(req, res) {
        return model.sequelize.query('TRUNCATE TABLE public."tempo_chapters" RESTART IDENTITY')
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

    // UPLOAD data from JSON file
    static uploadJSON(req, res) {
        const arr = tempo_chapters.fsReadJSON(jsonFilePath);
        // console.log(arr);

        tempo_chapters.dbAddBulk(arr)
            .then(value => res.send(value))
            .catch(err => err);
    }

    // GET::CLIENT all records
    static list(req, res) {
        return tempo_chapter
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
        // return model.sequelize.query('SELECT * FROM public."tempo_chapters"')
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
}

export default tempo_chapters;
