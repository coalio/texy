const axios = require("axios");
const qs = require("qs");
const sharp = require("sharp");
const uuid = require("uuid");

// Create an axios client
const client = axios.create({
    baseURL: "https://quicklatex.com/latex3.f",
    headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "*/*",
        Host: "quicklatex.com",
    },
});

const performLaTeXQuery = async (formula, options) => {
    try {
        const fsize = 512;
        const mode = 0;
        const out = 1;
        const remhost = "quicklatex.com";
        const preamble =
            "\\usepackage{amsmath}\\usepackage{amsfonts}\\usepackage{amssymb}";
        const rnd = Math.floor(Math.random() * 100);

        // Get the font color from the formula
        const fcolor_match = formula.match(/\\textcolor\{(.+?)\}/);
        const fcolor = fcolor_match ? fcolor_match[1] : "fefefe";

        // Remove fcolor_match from the formula
        formula = formula.replace(/\\textcolor\{(.+?)\}/, "");

        console.log("Performing query:", formula);

        const data = {
            formula: formula,
            fsize: fsize,
            fcolor: fcolor,
            mode: mode,
            out: out,
            remhost: remhost,
            preamble: preamble,
            rnd: rnd,
        };

        const response = await client.post("", qs.stringify(data));

        // Get rid of the first line and then retrieve the url
        const image_url = response.data.match(
            /https:\/\/quicklatex.com\/cache.+?\s/
        )[0];

        const image = await axios.get(image_url, {
            responseType: "arraybuffer",
        });
        const image_canvas = await sharp(image.data);
        const metadata = await image_canvas.metadata();

        if (options.type == "sticker") {
            // Resize the image to 256px while keeping the aspect ratio
            await image_canvas.resize(
                512,
                Math.round((512 * metadata.height) / metadata.width)
            );

            // Store in cache and return the file path
            const file_path = `./cache/${uuid.v4()}.webp`;
            await image_canvas.toFile(file_path);

            return file_path;
        } else if (options.type == "image") {
            // Resize the image to 512px while keeping the aspect ratio
            await image_canvas.resize(
                512,
                Math.round((512 * metadata.height) / metadata.width),
                {
                    fit: "contain",
                    background: { r: 255, g: 255, b: 255, alpha: 0 },
                }
            );

            // Return the image data
            return image_canvas.toBuffer();
        } else {
            return null;
        }
    } catch (error) {
        console.log("Unable to perform LaTeX query: ", formula);

        return null;
    }
};

module.exports = {
    performLaTeXQuery,
};
