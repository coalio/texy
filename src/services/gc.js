const fs = require("fs");

const cleanCache = () => {
    console.log("Cleaning the cache...");

    const cache = fs.readdirSync("./cache");
    let cleanup_count = 0;

    cache.forEach((file) => {
        // Get the file creation date
        const file_stats = fs.statSync(`./cache/${file}`);
        const file_creation_date = file_stats.birthtime;

        // If the file is older than 1 minute, delete it
        if (Date.now() - file_creation_date > 60000) {
            fs.unlinkSync(`./cache/${file}`);
            cleanup_count++;
        }
    });

    console.log(`Cleaned up ${cleanup_count} files`);
};

module.exports = {
    cleanCache,
};
