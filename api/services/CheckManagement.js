const { calcCheckStats, isDomainNameOrIP, customFloor, garbageCollection } = require('./Utilities');

const config = require('../../config/local');

/*
* Trims the check's history to only return a specified number of pings
* and its statistics
* @param {Object} check - a check's raw DB record
* @param {Number} desiredHistoryLength - the number of history entries to return
* @returns {Object}
*/
const formatChecks = (checks, desiredHistoryLength) => {
    const checksObject = {};

    checks.forEach((check) => {
        checksObject[check.id] = Object.assign(
            {},
            check,
            { history: check.history.slice(-desiredHistoryLength) },
            calcCheckStats(customFloor, check.history, config.checkInterval)
        );
    });

    return checksObject;
};

module.exports = {
    /**
     * Retrieve a user's checks, calcs each check's statistics
     * and adds it to each check properties
     * @param {Function} fetcher - record fetching and population function
     * @param {String} userId - the id of the user requesting this action
     * @param {Function} callback
     */
    getChecks(fetcher, userId, callback) {
        fetcher('check', { owner: userId }, (err, checks) => callback(err, formatChecks(checks, 20)));
    },

    /**
     * Creates a check in the database and returns it
     * @param {Function} fetcher - record fetching function
     * @param {Function} creator - create a record with provided data
     * @param {String} userId - the id of the user requesting this action
     * @param {Object} checkData - the attributes of the check to create
     * @param {Function} callback
     */
    createCheck(fetcher, creator, userId, checkData, callback) {
        fetcher('check', { owner: userId }, (err, checks) => {
            if (err) return callback(err);

            if (checks.length >= config.checkNbLimit) {
                return callback('You reached the limit of ten checks per user');
            } else if (!isDomainNameOrIP(checkData.domainNameOrIP)) {
                return callback('Incorrect domain name or IP address');
            } else if (!checkData.name || !checkData.port) {
                return callback('Incorrect attributes');
            }

            return creator('check', checkData, callback);
        });
    },

    /**
     * Update a check's name and notifications preferences
     * @param {Function} fetcher - a function fetching a single record
     * @param {Function} updater - a function updating a record's content
     * @param {String} userId - the id of the user requesting this action
     * @param {String} checkId - the id of the check to update
     * @param {Object} data - the attributes to update and their new contents
     * @param {Function} callback
     */
    updateCheck(fetcher, updater, userId, checkId, data, callback) {
        fetcher('check', checkId, (err, check) => {
            if (err) return callback(err);
            if (!check) return callback('Check not found');

            if (check.owner !== userId) {
                return callback('You do not have access to this check');
            }

            return updater('check', { id: checkId }, data, callback);
        });
    },

    /**
     * Destroy specified check from the dabatase
     * @param {Function} fetcher - a function fetching a single record
     * @param {Function} destroyer - a function destroying a record
     * @param {String} userId - the id of the user requesting this action
     * @param {String} checkId - the id of the check to destroy
     * @param {Function} callback
     */
    destroyCheck(fetcher, destroyer, userId, checkId, callback) {
        fetcher('check', checkId, (err, check) => {
            if (err) return callback(err);

            if (check.owner !== userId) {
                return callback('You do not have access to this check');
            }

            return destroyer('check', checkId, callback);
        });
    },

    /**
     * Insert a ping into a check's history
     * @param {Function} fetcher - a function fetching a single record
     * @param {Function} updater - a function updating a record
     * @param {String} checkId - the id of the check we want to update
     * @param {Object} ping - the result of a connexion attempt to a check
     */
    insertHistory(fetcher, updater, checkId, ping, callback) {
        fetcher('check', checkId, (err, check) => {
            if (err) return callback(err);
            if (!check) return callback(null);

            const newHistoryArray = garbageCollection(check.history, new Date());
            newHistoryArray.push({ date: ping.date, duration: ping.open ? ping.duration : null });

            // And update the DB record
            return updater('check', { id: check.id }, { history: newHistoryArray }, callback);
        });
    },
};
