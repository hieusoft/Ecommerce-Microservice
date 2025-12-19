const jwt = require("jsonwebtoken");

function getUserFromToken(req) {
    const authHeader = req.headers['authorization'];
    if (!authHeader) throw new Error("No token provided");

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
        algorithms: ['HS256'],
        audience: process.env.JWT_AUDIENCE
    });

    const userId = decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];
    const roles = decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || [];

    return { userId, roles: Array.isArray(roles) ? roles : [roles] };
}

module.exports = { getUserFromToken };