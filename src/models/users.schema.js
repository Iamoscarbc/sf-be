import mongoose from "../config/db.js";

const UsersSchema = new mongoose.Schema({
  user: String,
  password: String,
  firstname: String,
  lastname: String,
  docnumner: String,
  phone: String,
  codemployee: String,
  idProfile: String
});

const Users = mongoose.model('users', UsersSchema);

export default Users