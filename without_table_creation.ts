import { connect } from "@tursodatabase/sync";

const db = await connect({
  path: ":memory:",
  url: "http://localhost:8080",
});

const changed = await db.pull();
console.log("changed", changed);

const rows = await db.prepare("select * from notes").all();
console.log("rows", rows);
