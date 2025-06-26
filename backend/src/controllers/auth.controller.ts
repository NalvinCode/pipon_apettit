// src/controllers/auth.controller.ts
import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import User  from '../models/User';
import { generarJWT } from '../utils/jwt';

export const registrarUsuario = async (req: Request, res: Response) => {
  const { email, nombre, password } = req.body;

  try {
    // Verificar si ya existe
    const existe = await User.findOne({ email });
    if (existe) {
      res.status(400).json({ msg: 'El usuario ya existe' });
    }

    // Crear usuario
    const user = new User({ email, nombre, password });

    // Encriptar contraseña
    const salt = bcrypt.genSaltSync(10);
    user.password = bcrypt.hashSync(password, salt);

    await user.save();

    // Generar JWT
    const token = await generarJWT(user.id);

    res.status(201).json({
      usuario: {
        id: user.id,
        nombre: user.nombre,
        email: user.email
      },
      token
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Error interno del servidor' });
  }
};

export const loginUsuario = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      res.status(401).json({ msg: 'Credenciales incorrectas' });
      return;
    }

    // Comparar contraseña encriptada
    const passwordValido = bcrypt.compareSync(password, user.password);
    if (!passwordValido) {
      res.status(401).json({ msg: 'Credenciales incorrectas' });
    }

    const token = await generarJWT(user._id.toString());

    res.json({
      usuario: {
        id: user.id,
        nombre: user.nombre,
        email: user.email
      },
      token
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Error interno del servidor' });
  }
};