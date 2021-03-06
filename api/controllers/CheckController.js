const DB = require('../services/DB');
const { getChecks, createCheck, updateCheck, destroyCheck } = require('../services/CheckManagement');

module.exports = {

    /**
     * HTTP route to get the user's own data (name, emailHash),
     * his checks and their stats
     * @param {Object} req - HTTP request (must be GET)
     * @param {Object} res - Express' response object
     * @returns {JSON} Either an error or the user and his checks' data
     */
    find: (req, res) => {
        getChecks(DB.fetch, req.user.id, (err, data) => {
            if (err) return res.serverError(err);

            return res.json(data);
        });
    },

    /**
     * HTTP route to create a check
     * @param {Object} req - HTTP request (must be POST)
     * @param {Object} res - Express' response object
     * @returns {JSON} Either an error or the created check
     */
    create: (req, res) => {
        const data = {
            name: String(req.param('name')),
            domainNameOrIP: String(req.param('domainNameOrIP')),
            port: Number(req.param('port')),
            emailNotifications: Boolean(req.param('emailNotifications')),
            owner: req.user.id,
        };
        createCheck(DB.fetch, DB.create, req.user.id, data, (err, created) => res.json({ err, created }));
    },

    /**
     * HTTP route to update an existing check
     * @param {Object} req - HTTP request (must be POST)
     * @param {Object} res - Express' response object
     * @returns {JSON} Either an error or the updated check
     */
    update: (req, res) => {
        const data = {
            name: String(req.param('name')),
            emailNotifications: Boolean(req.param('emailNotifications')),
        };
        updateCheck(DB.fetchOne, DB.update, req.user.id, req.param('id'), data, (err, updated) => {
            if (err) return res.serverError(err);

            return res.json(updated[0]);
        });
    },

    /**
     * HTTP route to delete an existing check
     * @param {Object} req - HTTP request (must be POST)
     * @param {Object} res - Express' response object
     * @returns {JSON} Either an error or the destroyed check
     */
    destroy: (req, res) => {
        destroyCheck(DB.fetchOne, DB.destroy, req.user.id, req.param('id'), (err) => {
            if (err) return res.serverError(err);

            return res.json({});
        });
    },
};

