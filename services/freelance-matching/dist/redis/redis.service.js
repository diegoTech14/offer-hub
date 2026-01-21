"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var RedisService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const ioredis_1 = require("ioredis");
let RedisService = RedisService_1 = class RedisService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(RedisService_1.name);
        this.redisClient = new ioredis_1.default({
            host: this.configService.get("REDIS_HOST"),
            port: this.configService.get("REDIS_PORT"),
            password: this.configService.get("REDIS_PASSWORD") || undefined,
            retryStrategy: (times) => {
                const delay = Math.min(times * 50, 2000);
                return delay;
            },
        });
    }
    async onModuleInit() {
        try {
            const pong = await this.redisClient.ping();
            this.logger.log(`Redis connection established: ${pong}`);
        }
        catch (error) {
            this.logger.error("Failed to connect to Redis", error);
        }
    }
    async onModuleDestroy() {
        await this.redisClient.quit();
        this.logger.log("Redis connection closed");
    }
    getClient() {
        return this.redisClient;
    }
    async set(key, value, ttl) {
        if (ttl) {
            return this.redisClient.set(key, value, "EX", ttl);
        }
        return this.redisClient.set(key, value);
    }
    async get(key) {
        return this.redisClient.get(key);
    }
    async del(key) {
        return this.redisClient.del(key);
    }
};
exports.RedisService = RedisService;
exports.RedisService = RedisService = RedisService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], RedisService);
//# sourceMappingURL=redis.service.js.map