class ImageValidator {
    static validateMaxImages(images, max) {
        if (!Array.isArray(images)) return;
        if (images.length > max) {
            throw new Error(`Only upload up to ${max} photos`);
        }
    }

    static validateMaxSize(images, maxMB) {
        if (!Array.isArray(images)) return;

        for (const base64 of images) {
            const matches = base64.match(/^data:(.*);base64,(.*)$/);
            if (!matches) continue;

            const data = matches[2];
            const sizeInBytes = (data.length * 3) / 4; 
            const sizeInMB = sizeInBytes / (1024 * 1024);

            if (sizeInMB > maxMB) {
                throw new Error(`Photo exceeds maximum size ${maxMB}MB`);
            }
        }
    }

    static validateImages(images, maxFiles, maxMB) {
        this.validateMaxImages(images, maxFiles);
        this.validateMaxSize(images, maxMB);
    }
}

module.exports = ImageValidator;