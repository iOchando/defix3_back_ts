import dbConnect from "../config/postgres";
import { Pool } from "pg";

const validateDefixId = async (defixId: String) => {
    try {
        const conexion: Pool = await dbConnect();
        const resultados = await conexion.query("select * \
                                            from users where \
                                            defix_id = $1\
                                            ", [defixId]);
  
        if(resultados.rows.length > 0) {
            return true;
        }
        return false;
    } catch (err) {
        console.log(err)
        return false
    }
};

export { validateDefixId };
