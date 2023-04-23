import mongoose from "../config/db.js";

const inspectSchema = new mongoose.Schema({
  date: String,
  firstname: String,
  lastname: String,
  docnumner: String,
  description: String,
  documents: Array
});

const Inspect = mongoose.model('inspects', inspectSchema);

export default Inspect