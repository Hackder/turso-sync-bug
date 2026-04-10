import { connect } from "@tursodatabase/sync";

const db = await connect({
  path: ":memory:",
  url: "http://localhost:8080",
});

const changed = await db.pull();
console.log("changed", changed);

const seed_table = await Bun.file("./seed_table.sql").text();
await db.exec(seed_table);

const seed_data = await Bun.file("./seed_data.sql").text();
await db.exec(seed_data);

await db.push();

const rows = await db.prepare("select * from notes").all();
console.log("rows", rows);
