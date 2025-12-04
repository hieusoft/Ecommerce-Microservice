const jwt = require("jsonwebtoken");

function getUserIdFromToken(req) {
    const authHeader = req.headers['authorization'];
    console.log("Authorization Header:", authHeader);
    if (!authHeader) throw new Error("No token provided");

    const token = authHeader.split(" ")[1];
    console.log("Extracted Token:", token);

    try {
        // Verify token bằng secret key và audience từ .NET
        const decoded = jwt.verify(token, process.env.JWT_SECRET, {
            algorithms: ['HS256'],
            audience: process.env.JWT_AUDIENCE  // <--- thêm audience
        });
        
        console.log("Decoded JWT Payload:", decoded);

        // Lấy userId từ claim của .NET
        const userId = decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];

        if (!userId) throw new Error("User ID not found in token");

        return userId;
    } catch (err) {
        console.error("JWT Error:", err.name, err.message);
        if (err.name === "TokenExpiredError") {
            throw new Error("Token expired");
        } else if (err.name === "JsonWebTokenError") {
            throw new Error("Invalid token");
        } else if (err.name === "NotBeforeError") {
            throw new Error("Token not active yet");
        } else {
            throw err;
        }
    }
}

module.exports = {
    getUserIdFromToken
};
