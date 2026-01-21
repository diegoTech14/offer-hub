"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const dotenv = require("dotenv");
dotenv.config();
async function testConnection() {
    const prisma = new client_1.PrismaClient();
    try {
        const result = await prisma.$queryRaw `SELECT 1 as result`;
        console.log("Database connection successful!");
        console.log("Query result:", result);
        return { success: true, result };
    }
    catch (error) {
        console.error("Failed to connect to the database:", error);
        return { success: false, error };
    }
    finally {
        await prisma.$disconnect();
    }
}
testConnection()
    .then((result) => {
    if (result.success) {
        process.exit(0);
    }
    else {
        process.exit(1);
    }
})
    .catch((error) => {
    console.error("Unexpected error:", error);
    process.exit(1);
});
//# sourceMappingURL=test-db-connection.js.map