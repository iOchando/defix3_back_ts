import { Request, Response } from "express";
import dbConnect from "../config/postgres";

const getUsersDefix = async (req: Request, res: Response) => {
  try {
    const conexion = await dbConnect()
    const response = await conexion.query("select defix_id \
                                          from users")

    res.send(response.rows)
  } catch (error) {
    res.status(404).send()
  }
}

export { getUsersDefix }