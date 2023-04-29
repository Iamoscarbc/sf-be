import express from 'express';
import path from 'path'
import {fileURLToPath} from 'url';
import fileUpload from 'express-fileupload';
const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import "./config/loadEnvironment.js";

import { Inspect, PaymentPenalties, Users, Profiles } from './models/index.js';

app.set('port', process.env.PORT || 3000);
app.set('json spaces', 1)

app.use(fileUpload())

//Routes
app.get('/api/inspects', async (req, res) => {
    try{
      let collection = await Inspect.find()
      res.json({
        success: true,
        message: "Inspects obtained!!",
        data: collection
      })
    } catch (err) {
      console.error(err)
      res.json({
        success: false,
        error: err
      })
    }
})

app.get('/api/payment-penaltie', async (req, res) => {
    try{
      let collection = await PaymentPenalties.find()
      res.json({
        success: true,
        message: "Payment Penalties obtained!!",
        data: collection
      })
    } catch (err) {
      console.error(err)
      res.json({
        success: false,
        error: err
      })
    }
})

app.get('/api/users', async (req, res) => {
    try{
      let collection = await Users.find().populate({
        path: "idProfile",
        model: Profiles,
        select: "name",
      })
      res.json({
        success: true,
        message: "Users obtained!!",
        data: collection
      })
    } catch (err) {
      console.error(err)
      res.json({
        success: false,
        error: err
      })
    }
})

app.listen(3000, () => {
    console.log("Server is listening on port 3000")
})