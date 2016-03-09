module.exports = {

    show: function (req, res) {
        CheckManagement.listChecks(req.param('id'), function(checks) {
            if (req.wantsJSON) {
                return res.json(checks);
            } else {
                return res.view({checks: checks});
            }
        });
    },

    getstats: function (req, res) {
        CheckManagement.getData(req.param('id'), function(data) {
            return res.json(data);
        });
    },

    create: function (req, res) {
        var data = {
            name: req.query.name,
            domainNameOrIP: req.query.domainNameOrIP,
            port: req.query.port,
        };
        if (data.name.length !== 0 && data.domainNameOrIP.length !== 0 && data.port !== 0) {
            CheckManagement.createCheck(data, function(created) {
                return res.json(created);
            });
        } else {
            return res.serverError(500);
        }
    },

//    update: function (req, res) {
//        var data = {
//            name: req.query.name,
//            domainNameOrIP: req.query.domainNameOrIP,
//            port: req.query.port
//        };
//        CheckManagement.updateCheck(req.param('id'), data, function(updated) {
//            return res.json(updated);
//        });
//    },

    destroy: function (req, res) {
        CheckManagement.destroyCheck(req.param('id'), function(destroyed) {
            return res.json(destroyed);
        });
    }
};
