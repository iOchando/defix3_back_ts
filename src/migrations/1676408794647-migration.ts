import { MigrationInterface, QueryRunner } from "typeorm";

export class migration1676408794647 implements MigrationInterface {
    name = 'migration1676408794647'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "suscribe" ("id" SERIAL NOT NULL, "email" character varying NOT NULL, CONSTRAINT "PK_aa95ed8913609aa79e402f712d7" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "suscribe"`);
    }

}
