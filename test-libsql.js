const { createClient } = require('@libsql/client');

async function test() {
  try {
    const libsql = createClient({
      url: 'file:///C:/Users/kazama/Desktop/Scape/dev.db',
    });
    const result = await libsql.execute("SELECT * FROM Post");
    console.log("Success:", result.rows.length);
  } catch (err) {
    console.error("Test Error:", err);
  }
}
test();
