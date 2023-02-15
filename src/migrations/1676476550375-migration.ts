import { MigrationInterface, QueryRunner } from "typeorm";

export class migration1676476550375 implements MigrationInterface {
    name = 'migration1676476550375'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "suscribe" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "suscribe" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "suscribe" DROP COLUMN "updated_at"`);
        await queryRunner.query(`ALTER TABLE "suscribe" DROP COLUMN "created_at"`);
    }

}
