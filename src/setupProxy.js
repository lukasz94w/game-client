const {createProxyMiddleware} = require("http-proxy-middleware");
const cors = require("cors");

module.exports = function (app) {
    // app.use(cors());
    // app.use((req, res, next) => {
    //     res.header('Access-Control-Allow-Headers, *, Access-Control-Allow-Origin', 'Origin, X-Requested-with, Content_Type,Accept,Authorization', 'http://localhost:3000');
    //     if (req.method === 'OPTIONS') {
    //         res.header('Access-Control-Allow-Methods', 'PUT,POST,PATCH,DELETE,GET');
    //         return res.status(200).json({});
    //     }
    //     next();
    // });
};