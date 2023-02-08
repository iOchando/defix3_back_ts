import { Request, Response } from "express";
import dbConnect from "../config/postgres";
import { validateDefixId, validateMnemonicDefix } from "../helpers/utils";
import { status2faFn, validarCode2fa } from "./2fa";
import { encrypt, decrypt } from "../helpers/crypto";

const setEmailData = async (req: Request, res: Response) => {
	const { defixId } = req.body

	const DefixId = defixId.toLowerCase()

	status2faFn(DefixId).then((respStatus) => {
		switch (respStatus) {
			case true: {
				const { code } = req.body;
				validarCode2fa(code, DefixId).then((respValidacion) => {
					console.log(respValidacion);
					switch (respValidacion) {
						case true: {
							return EjecutarsetEmailData(req, res);
						}
						case false: {
							res.json({ respuesta: "code" });
						}
							break;
						default: res.status(500).json({ respuesta: "Error interno del sistema" })
							break;
					}
				})
			}
				break;
			case false: {
				return EjecutarsetEmailData(req, res);
			}
			default: res.status(500).json({ respuesta: "Error interno del sistema" })
				break;
		}
	})
}

async function EjecutarsetEmailData(req: Request, res: Response) {
	try {
		const { defixId, seedPhrase, email, flag_send, flag_receive, flag_dex, flag_fiat, name, last_name, legal_document, type_document } = req.body

		const mnemonic = decrypt(seedPhrase)
		if (!mnemonic) return res.status(400).send() 

		const response = await validateMnemonicDefix(defixId, mnemonic)
		var result

		if (legal_document == ! null) {
			if (type_document == ! "v" && type_document == ! "j") {
				return res.status(204).json({ respuesta: "Error tipo de documento" })
			}
		}

		if (!response) return res.status(400).send()

		const conexion = await dbConnect()
		await conexion.query("update users\
                                set email = $1, flag_send = $2, flag_receive = $3, flag_dex = $4, flag_fiat = $5, name = $6, last_name = $7, legal_document = $8, type_document=$9 where\
                                defix_id = $10\
                                ", [email, flag_send, flag_receive, flag_dex, flag_fiat, name, last_name, legal_document, type_document, defixId])
			.then(() => {
				result = true
			}).catch(() => {
				result = false
			})
		return res.json({ respuesta: "ok", data: result })

	} catch (error) {
		return res.status(500).send()
	}
}

const getEmailData = async (req: Request, res: Response) => {
	try {
		const { defixId } = req.body
		const response = await validateDefixId(defixId)

		if (!response) return res.status(400).send()

		const conexion = await dbConnect()

		const resultados = await conexion.query("select email, flag_send, flag_receive, flag_dex, flag_fiat, name, last_name, legal_document, type_document, dosfa \
                                                    from users where \
                                                    defix_id = $1\
                                                    ", [defixId])
		res.send(resultados.rows[0])
	} catch (error) {
		return res.status(500).send()
	}
}

const closeAllSessions = async (req: Request, res: Response) => {
	try {
		const { defixId, seedPhrase } = req.body

		const DefixId = defixId.toLowerCase()

		const mnemonic = decrypt(seedPhrase)
		if (!mnemonic) return res.status(400).send() 

		const response = await validateMnemonicDefix(DefixId, mnemonic)

		if (!response) return res.status(400).send()

		var result

		const conexion = await dbConnect()
		await conexion.query("update users\
															set close_sessions = $1 where\
															defix_id = $2\
															", [true, DefixId])
			.then(() => {
				result = true
			}).catch(() => {
				result = false
			})
		res.json(result)

	} catch (error) {
		return res.status(500).send()
	}
}

const getCloseAllSesions = async (req: Request, res: Response) => {
	try {
		const { defixId } = req.body

		const response = await validateDefixId(defixId.toLowerCase())

		if (!response) return res.status(400).send()
		const conexion = await dbConnect()

		const resultados = await conexion.query("select close_sessions \
																									from users where \
																									defix_id = $1\
																									", [defixId.toLowerCase()])
		res.send(resultados.rows[0].close_sessions)

	} catch (error) {
		return res.status(500).send()
	}
}

export { getCloseAllSesions, closeAllSessions, setEmailData, getEmailData }