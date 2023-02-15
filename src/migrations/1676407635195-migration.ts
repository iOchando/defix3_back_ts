import { MigrationInterface, QueryRunner } from "typeorm";

export class migration1676407635195 implements MigrationInterface {
    name = 'migration1676407635195'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "users" ("id" SERIAL NOT NULL, "defix_id" character varying NOT NULL, "email" character varying, "import_id" character varying NOT NULL, "name" character varying, "lastname" character varying, "close_sessions" boolean NOT NULL DEFAULT false, "dosfa" boolean DEFAULT false, "legal_document" character varying, "type_document" character varying, "secret" character varying, "flag_send" boolean, "flag_receive" boolean, "flag_dex" boolean, "flag_fiat" boolean, CONSTRAINT "UQ_5b4b4aa7a7fa89043d7f1ecc415" UNIQUE ("defix_id"), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "UQ_4761723de32da9c56d745ecdacc" UNIQUE ("import_id"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "addresses" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "address" character varying NOT NULL, "userId" integer, CONSTRAINT "PK_745d8f43d3af10ab8247465e450" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "addresses" ADD CONSTRAINT "FK_95c93a584de49f0b0e13f753630" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "addresses" DROP CONSTRAINT "FK_95c93a584de49f0b0e13f753630"`);
        await queryRunner.query(`DROP TABLE "addresses"`);
        await queryRunner.query(`DROP TABLE "users"`);
    }

}
