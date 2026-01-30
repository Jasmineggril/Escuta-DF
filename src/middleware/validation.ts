import { body } from 'express-validator';
import { ReportCategory, InputType } from '../types';

/**
 * Validação para criação de relatório
 */
export const createReportValidation = [
  body('category')
    .isIn(Object.values(ReportCategory))
    .withMessage('Categoria inválida'),
  
  body('description')
    .trim()
    .isLength({ min: 10, max: 5000 })
    .withMessage('Descrição deve ter entre 10 e 5000 caracteres'),
  
  body('title')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Título deve ter no máximo 200 caracteres'),
  
  body('isAnonymous')
    .optional()
    .isBoolean()
    .withMessage('isAnonymous deve ser booleano'),
  
  body('citizenName')
    .if(body('isAnonymous').equals('false'))
    .optional()
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Nome deve ter entre 3 e 200 caracteres'),
  
  body('citizenEmail')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Email inválido'),
  
  body('citizenPhone')
    .optional()
    .matches(/^[\d\s\-\+\(\)]+$/)
    .withMessage('Telefone inválido'),
  
  body('primaryInputType')
    .optional()
    .isIn(Object.values(InputType))
    .withMessage('Tipo de entrada inválido'),
  
  body('location.latitude')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude inválida'),
  
  body('location.longitude')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude inválida')
];
