import { MigrationInterface, QueryRunner } from "typeorm";

export class migration1676474385095 implements MigrationInterface {
    name = 'migration1676474385095'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "balances" ("id" SERIAL NOT NULL, "blockchain" character varying NOT NULL, "coin" character varying NOT NULL, "balance" double precision NOT NULL, CONSTRAINT "PK_74904758e813e401abc3d4261c2" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "balances"`);
    }

}
