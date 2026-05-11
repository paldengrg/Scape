require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const { PrismaLibSql } = require('@prisma/adapter-libsql');
const { createClient } = require('@libsql/client');

const libsql = createClient({
  url: 'file:///C:/Users/kazama/Desktop/Scape/dev.db',
});
const adapter = new PrismaLibSql(libsql);
const prisma = new PrismaClient({ adapter });

async function test() {
  try {
    const posts = await prisma.post.findMany();
    console.log("Success:", posts.length);
  } catch (err) {
    console.error("Test Error:", err);
  }
}
test();
