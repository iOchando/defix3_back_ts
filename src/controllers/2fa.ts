import { Request, Response } from "express";
import dbConnect from "../config/postgres";
import { authenticator } from "otplib";
import QRCode from "qrcode";
import { validateMnemonicDefix } from "../helpers/utils";

const generar2fa = async (req: Request, res: Response) => {
  try {
    const { defixId, mnemonic } = req.body
    const validate = await validateMnemonicDefix(defixId, mnemonic)

    if (!validate) return res.status(400).send()

    const conexion = await dbConnect()
    const resultados = await conexion.query("select dosfa, secret from users where defix_id = $1", [defixId])

    if (resultados.rowCount === 1) {
      switch (resultados.rows[0].dosfa) {
        case true: {
          res.json({ respuesta: "dosfa" })
        }
          break;
        case false: {
          if (resultados.rows[0].secret == null) {
            const secret = authenticator.generateSecret();
            await conexion.query("update users set secret = $1 where defix_id = $2 ", [secret, defixId])
              .then(() => {
                let codigo = authenticator.keyuri(defixId, 'Defix3 App', secret)
                QRCode.toDataURL(codigo, (err, url) => {
                  if (err) {
                    throw err
                  }
                  res.json({ respuesta: "ok", qr: url, codigo: secret })
                })
              }).catch(() => {
                res.status(500).json({ respuesta: "error en la base de datos" })
              })
          } else {
            let codigo = authenticator.keyuri(defixId, 'Defix3 App', resultados.rows[0].secret)
            QRCode.toDataURL(codigo, (err, url) => {
              if (err) {
                throw err
              }
              res.json({ respuesta: "ok", qr: url, codigo: resultados.rows[0].secret })
            })
          }
        }
          break;

        default:
          res.status(500).json({ respuesta: "error en el campo dosfa" })
          break;
      }
    } else {
      res.status(500).json({ respuesta: "user no existe" })
    }

  } catch (error) {
    return res.status(500).json({ respuesta: error })
  }
}

const activar2fa = async (req: Request, res: Response) => {
  try {
    const { defixId, mnemonic, code } = req.body
    const response = await validateMnemonicDefix(defixId, mnemonic)

    if (!response) return res.status(400).send()

    const conexion = await dbConnect();

    const resultados = await conexion.query("select dosfa, secret from users where defix_id = $1", [defixId]);
  
    if (resultados.rowCount === 1) {
      console.log(resultados.rows[0].secret)
      if (resultados.rows[0].secret != null) {
        var auth = authenticator.check(code.toString(), resultados.rows[0].secret)
        if (auth) {
          await conexion.query("update users set dosfa = true where defix_id = $1 ", [defixId])
            .then(() => {
              res.json({ respuesta: "ok" });
            }).catch(() => {
              res.status(500).json({ respuesta: "error en la base de datos" });
            })
        } else {
          res.json({ respuesta: "code" });
        }
      } else {
        res.json({ respuesta: "secret" });
      }
    }
  } catch (error) {
    return res.status(500).send()
  }
}

const desactivar2fa = async (req: Request, res: Response) => {
  const { defixId, code } = req.body

  validarCode2fa(code, defixId).then(async result => {
      switch (result) {
          case true: {
              const conexion = await dbConnect();
  
              const resultados = await conexion.query("select dosfa, secret from users where defix_id = $1", [defixId]);
              if(resultados.rowCount === 1) {
                  if(resultados.rows[0].dosfa === true) {
                      await conexion.query("update users set dosfa = false, secret = null where defix_id = $1 ", [defixId])
                      .then(() => {
                          res.json({respuesta: "ok"});
                      }).catch(() => {
                          res.status(500).json({respuesta: "error en la base de datos"});
                      })                
                  } else {
                      res.json({respuesta: "ok"});
                  }
              }
          }
              break;
          case false: {
              res.json({respuesta: "code"});
          }
              break;
          default: res.status(500).json({respuesta: "error inesperado"});
              break;
      }
  });
}


const status2fa = async (req: Request, res: Response) => {
  const { defixId } = req.body
  status2faFn(defixId).then(result => {
      res.json(result);
  });
}

// UTILS

async function validarCode2fa(code: string, defixId: string) { 
  const conexion = await dbConnect();
  const resultados = await conexion.query("select secret from users where defix_id = $1", [defixId]);
  if(resultados.rowCount === 1) {
      var auth = authenticator.check(String(code), resultados.rows[0].secret)
      return auth;
  }
  return null
}

async function status2faFn(defixId: string) {
  const conexion = await dbConnect();
  const resultados = await conexion.query("select dosfa from users where defix_id = $1", [defixId]);
  if(resultados.rowCount === 1) {
      return resultados.rows[0].dosfa;
  } 
  return null;
}

export { generar2fa, activar2fa, desactivar2fa, status2fa, validarCode2fa, status2faFn }