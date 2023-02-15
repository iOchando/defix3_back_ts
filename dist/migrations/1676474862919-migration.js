"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.migration1676474862919 = void 0;
class migration1676474862919 {
    constructor() {
        this.name = 'migration1676474862919';
    }
    up(queryRunner) {
        return __awaiter(this, void 0, void 0, function* () {
            yield queryRunner.query(`ALTER TABLE "balances" ADD "userId" integer`);
            yield queryRunner.query(`ALTER TABLE "balances" ADD CONSTRAINT "UQ_414a454532d03cd17f4ef40eae2" UNIQUE ("userId")`);
            yield queryRunner.query(`ALTER TABLE "balances" ADD CONSTRAINT "FK_414a454532d03cd17f4ef40eae2" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        });
    }
    down(queryRunner) {
        return __awaiter(this, void 0, void 0, function* () {
            yield queryRunner.query(`ALTER TABLE "balances" DROP CONSTRAINT "FK_414a454532d03cd17f4ef40eae2"`);
            yield queryRunner.query(`ALTER TABLE "balances" DROP CONSTRAINT "UQ_414a454532d03cd17f4ef40eae2"`);
            yield queryRunner.query(`ALTER TABLE "balances" DROP COLUMN "userId"`);
        });
    }
}
exports.migration1676474862919 = migration1676474862919;
