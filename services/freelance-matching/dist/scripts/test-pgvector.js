"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const dotenv = require("dotenv");
dotenv.config();
async function testPgVector() {
    const prisma = new client_1.PrismaClient();
    try {
        const extensionResult = await prisma.$queryRaw `
      SELECT * FROM pg_extension WHERE extname = 'vector';
    `;
        console.log("pgvector extension status:", extensionResult);
        if (Array.isArray(extensionResult) && extensionResult.length > 0) {
            console.log("pgvector extension is enabled!");
            const vectorResult = await prisma.$queryRaw `
        SELECT '[1,2,3]'::vector <-> '[4,5,6]'::vector AS distance;
      `;
            console.log("Vector operation test result:", vectorResult);
            return { success: true, extensionResult, vectorResult };
        }
        else {
            console.error("pgvector extension is not enabled.");
            return { success: false, error: "Extension not enabled" };
        }
    }
    catch (error) {
        console.error("Error testing pgvector:", error);
        return { success: false, error };
    }
    finally {
        await prisma.$disconnect();
    }
}
testPgVector()
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
//# sourceMappingURL=test-pgvector.js.map