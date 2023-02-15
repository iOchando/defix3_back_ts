import { Request, Response } from "express";
import { Suscribe } from "../entities/suscribe.entity";
import { validateEmail } from "../helpers/utils";

async function setEmailSuscribe(req: Request, res: Response) {
  try {
    const { email } = req.body

    console.log(email)

    if (await validateEmail(email)) {

      const subs = new Suscribe ()
      subs.email = email
      const saved = await subs.save()
      
      if (saved) return res.send(true)

      return res.status(400).send()
    } else {
      return res.status(400).send()
    }
  } catch (error) {
    return res.status(500).send()
  }
}

export { setEmailSuscribe }