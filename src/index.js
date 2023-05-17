import express from 'express'
import path from 'path'
import bodyParser from 'body-parser'
import {fileURLToPath} from 'url'
import fileUpload from 'express-fileupload'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
const app = express()
import fs from 'fs'
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
import "./config/loadEnvironment.js"

import { Inspect, PaymentPenalties, Users, Profiles } from './models/index.js'

app.use(bodyParser.urlencoded({
  extended: true,
  charset: 'UTF-8'
}))

app.set('port', process.env.PORT || 3000)
app.set('json spaces', 1)

app.use(fileUpload())

//Routes
app.get('/api/inspects', tokenVerify, async (req, res) => {
    try{
      let collection = await Inspect.find().populate({
        path: "idUser",
        model: Users,
        select: "firstname lastname phone docnumber codemployee user",
      })
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

app.get('/api/inspect/:id', tokenVerify, async (req, res) => {
  try{
    let collection = await Inspect.findById(req.params.id).populate({
      path: "idUser",
      model: Users,
      select: "firstname lastname phone docnumber codemployee user",
    })
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

app.post('/api/inspects', tokenVerify, async (req, res) => {
  try{
    let {date, description} = req.body
    let as = await Inspect.create({
      date,
      description,
      idUser: req.userId
    })
    
    let route = path.join(__dirname, `/documents/${as._id}`)
    if(! await fs.existsSync(route)){
      await fs.mkdirSync(route)
    }
    let documents = [
      { path: path.join(route, req.files.file.name), name: req.files.file.name }
    ]
    if(!!req.files.file.length){
      for (let i = 0; i < req.files.file.length; i++) {
        const d = req.files.file[i];
        await fs.writeFileSync(path.join(route, d.name), d.data)
      }
      documents = req.files.file.map(d => {
        return {
          path: path.join(route, d.name),
          name: d.name
        }
      })
    }else{
      await fs.writeFileSync(path.join(route, req.files.file.name), req.files.file.data)
    }

    await Inspect.findOneAndUpdate({_id: as._id},{
      documents,
    })

    res.json({
      success: true,
      message: "Inspect created!!"
    })
  } catch (err) {
    console.error(err)
    res.json({
      success: false,
      error: err
    })
  }
})

app.get('/api/payment-penaltie', tokenVerify, async (req, res) => {
    try{
      let collection = await PaymentPenalties.find().populate({
        path: "idUser",
        model: Users,
        select: "firstname lastname phone docnumber codemployee user",
      })
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

app.get('/api/users', tokenVerify, async (req, res) => {
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

app.get('/api/profiles', tokenVerify, async (req, res) => {
  try{
    let collection = await Profiles.find()
    res.json({
      success: true,
      message: "Profiles obtained!!",
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

app.post('/api/auth/login', async (req, res) => {
  const { user, password } = req.body;

  try {
    // Verificar si el usuario existe en la base de datos
    const userFound = await Users.findOne({ user });
    if (!userFound) return res.status(404).json({
      success: false,
      message: 'Usuario no encontrado'
    });

    // Verificar si la contraseña es correcta
    const isPasswordValid = await bcrypt.compare(password, userFound.password);
    if (!isPasswordValid) return res.status(401).json({
      success: false,
      message: 'Usuario o Contraseña incorrecta'
    });

    // Generar un token JWT
    const token = jwt.sign({ id: userFound._id }, 'GroverFalcon123SecretKey', { expiresIn: 86400 });
    res.status(200).json({
      success: true,
      token,
      message: 'Login exitoso'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Error en el servidor'
    });
  }
})

app.get('/api/auth/user', tokenVerify, async (req, res) => {
  try {
    let user = await Users.findOne({ _id: req.userId }, ['firstname','lastname','phone','docnumber','codemployee','user'])
    res.status(200).json({
      success: true,
      message: 'Lista de usuarios',
      user
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Error en el servidor'
    });
  }
})

app.post('/api/auth/logout', tokenVerify, async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: 'Logout exitoso'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Error en el servidor'
    });
  }
})

app.post('/api/user', tokenVerify, async (req, res) => {
  const { firstname, lastname, phone, docnumber, codemployee, user, password, idProfile } = req.body;

  try {
    const usuarioExistente = await Users.findOne({ user, docnumber, codemployee });
    if (usuarioExistente) return res.status(409).json({
      success: false,
      message: 'Este usuario ya ha sido registrado'
    });

    const hash = await bcrypt.hash(password, 10);

    Users.create({
      firstname,
      lastname,
      phone,
      docnumber,
      codemployee,
      user,
      password: hash,
      idProfile
    });

    res.status(201).json({
      success: true,
      message: 'Usuario registrado correctamente'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Error en el servidor'
    });
  }
})

async function tokenVerify(req, res, next) {
  const token = req.headers['authorization'];
  if (!token) return res.status(401).json({ success: false, mensaje: 'No se inició sesión' });

  try {
    const decoded = jwt.verify(token.split(' ')[1], 'GroverFalcon123SecretKey');
    
    req.userId = decoded.id;
    next();
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, mensaje: 'Token inválido' });
  }
}

app.listen(3000, () => {
    console.log("Server is listening on port 3000")
})