const multer = require("multer");
const path = require("path");

const uploadPath = path.join(process.cwd(), "backend", "uploads");

if (!fs.existsSync(uploadPath)) {
fs.mkdirSync(uploadPath, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadPath);
    },
    filename: function (req, file, cb){
        const cleanName = file.originalname.replace(/\s+/g, "_");
        cb(null, Date.now() + "_" + cleanName);
    }
});

module.exports = multer({storage});


