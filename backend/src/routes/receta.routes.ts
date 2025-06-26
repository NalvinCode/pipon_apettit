import express from 'express';
import { Request, Response } from 'express';
const router = express.Router();

router.get('/ultimas', (req, res) => {});
router.get('/buscar', (req, res) => {});
router.get('/pendientes', (req, res) => {});
router.get('/:id', (req, res) => {});
router.post('/', (req, res) => {});
router.post('/:id/valorar', (req, res) => {});
router.post('/:id/escalar/guardar', (req, res) => {});

export default router;
