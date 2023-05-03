const multer = require("multer");
const ApiError = require("../utils/apiError");

const MulterProps = () => {
  //////////////////////////////////////////////////////
  //disk storage==>لو انت مش عايز تعدل حاجه هنكتفي ب دي
  // const multerStorage = multer.diskStorage({
  //   destination: function (req, file, cb) {
  //     cb(null, "uploads/categories");
  //   },
  //   filename: function (req, file, cb) {
  //     //format =>> category-{id}-date.now().photoFormat
  //     const extension = file.mimetype.split("/")[1];
  //     const filename = `category-${uuidv4()}-${Date.now()}.${extension}`;
  //     cb(null, filename);
  //   },
  // });
  ////////////////////////////////////////////////////////////////////
  const multerStorage = multer.memoryStorage();

  const multerFilter = function (req, file, cb) {
    if (file.mimetype.startsWith("image")) {
      cb(null, true);
    } else {
      cb(new ApiError("Onley Images Allowed", 400), false);
    }
  };

  const upload = multer({ storage: multerStorage, fileFilter: multerFilter });
  return upload;
};

module.exports = {
  /*لو انت محتاج تعمل (image proccessing)للصور  اللي هو تعدل طول عرض جوده  ==>هنستخدم ميموري ستوريج */
  //memory storage
  uploadSingleImage: (fieldName) => MulterProps().single(fieldName),

  uploadMixOfImages: (arrOfFields) => MulterProps().fields(arrOfFields),
};
