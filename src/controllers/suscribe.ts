import { Request, Response } from "express";
import dbConnect from "../config/postgres";
import { validateEmail } from "../helpers/utils";

async function setEmailSuscribe(req: Request, res: Response) {
  try {
    const { email } = req.body
    var result

    if (await validateEmail(email)) {
      const conexion = await dbConnect()
      await conexion.query(`insert into suscribe
                  (email)
                  values ($1)`, [email])
        .then(() => {
          result = true
        }).catch(() => {
          result = false
        })
      res.send({ respuesta: "ok", data: result })
    } else {
      res.status(400).send()
    }
  } catch (error) {
    console.log(error)
    res.status(500).send()
  }
}

export { setEmailSuscribe }