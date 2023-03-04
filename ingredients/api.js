const path = require("path");
const express = require("express");
const router = express.Router();
const pg = require("pg");
// client side static assets
router.get("/", (_, res) => res.sendFile(path.join(__dirname, "./index.html")));
router.get("/client.js", (_, res) =>
  res.sendFile(path.join(__dirname, "./client.js"))
);

/**
 * Student code starts here
 */

// connect to postgres
const connection = new pg.Pool({
  user: "postgres",
  host: "localhost",
  database: "recipeguru",
  password: "postgrespw",
  port: 55000,
});

router.get("/type", async (req, res) => {
  const { type } = req.query;
  console.log("get ingredients", type);
  // return all ingredients of a type
  const { rows } = await connection.query(
    `SELECT * 
      FROM ingredients 
      WHERE type=$1`,
    [type]
  );
  console.log({ rows });
  res.status(200).json({ rows });


  // res.status(501).json({ status: "not implemented", rows: [] });
});

router.get("/search", async (req, res) => {
  let { term, page } = req.query;
  page = page ? page : 0;
  console.log("search ingredients", term, page);
  const pageOffset = page * 5;
  // return all columns as well as the count of all rows as total_count
  // make sure to account for pagination and only return 5 rows at a time

  const { rows } = await connection.query(
    `SELECT *,
      COUNT(*) OVER ()::INTEGER As total_count 
      FROM ingredients 
      WHERE CONCAT(title, type) ILIKE $1 
      OFFSET $2 
      LIMIT 5`,
    [`%${term}%`, pageOffset]
  );
  res.status(200).json({ rows });

  // res.status(501).json({ status: "not implemented", rows: [] });
});

/**
 * Student code ends here
 */

module.exports = router;
