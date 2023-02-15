import { MigrationInterface, QueryRunner } from "typeorm";

export class migration1676477031405 implements MigrationInterface {
    name = 'migration1676477031405'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "balances" DROP CONSTRAINT "FK_414a454532d03cd17f4ef40eae2"`);
        await queryRunner.query(`ALTER TABLE "balances" DROP CONSTRAINT "UQ_414a454532d03cd17f4ef40eae2"`);
        await queryRunner.query(`ALTER TABLE "balances" ADD CONSTRAINT "FK_414a454532d03cd17f4ef40eae2" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "balances" DROP CONSTRAINT "FK_414a454532d03cd17f4ef40eae2"`);
        await queryRunner.query(`ALTER TABLE "balances" ADD CONSTRAINT "UQ_414a454532d03cd17f4ef40eae2" UNIQUE ("userId")`);
        await queryRunner.query(`ALTER TABLE "balances" ADD CONSTRAINT "FK_414a454532d03cd17f4ef40eae2" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
