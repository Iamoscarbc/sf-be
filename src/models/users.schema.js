import mongoose from "../config/db.js";

const UsersSchema = new mongoose.Schema({
  user: String,
  password: String,
  firstname: String,
  lastname: String,
  docnumber: String,
  phone: String,
  codemployee: String,
  idProfile: String
});

const Users = mongoose.model('users', UsersSchema);

export default Users