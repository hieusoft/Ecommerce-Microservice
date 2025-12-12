const fs = require("fs");
const path = require("path");

class ImageService {
    constructor(baseDir) {
        this.baseDir = baseDir;
        if (!fs.existsSync(this.baseDir)) {
            fs.mkdirSync(this.baseDir, { recursive: true });
        }
    }

    async saveBase64Images(base64Images) {
        const savedPaths = [];

        for (let item of base64Images) {
           
            const base64 =
                typeof item === "string"
                    ? item
                    : item?.base64;

            console.log("👉 ImageService processing:", { item, base64 });

            if (typeof base64 !== "string") {
                console.warn("❌ ImageService: Not a base64 string:", item);
                continue;
            }

            const matches = base64.match(/^data:(.*);base64,(.*)$/);
            if (!matches) {
                console.warn("❌ Invalid base64 format:", base64.slice(0, 30));
                continue;
            }

            const mime = matches[1];
            const data = matches[2];
            const ext = mime.split("/")[1];
            const allowedExt = ["png", "jpg", "jpeg", "gif"];

            if (!allowedExt.includes(ext)) {
                console.warn(`⚠️ File type ${ext} not allowed`);
                continue;
            }

            const fileName =
                Date.now() +
                "-" +
                Math.random().toString(36).substring(2) +
                "." +
                ext;

            const filePath = path.join(this.baseDir, fileName);

            fs.writeFileSync(filePath, Buffer.from(data, "base64"));

            savedPaths.push(
                path.join("/uploads", path.basename(this.baseDir), fileName)
            );
        }

        return savedPaths;
    }
}

function getImageService(entityType) {
    const baseDir = path.join(__dirname, `../../../uploads/${entityType}`);
    return new ImageService(baseDir);
}

module.exports = { ImageService, getImageService };
