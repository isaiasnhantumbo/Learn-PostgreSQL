const path = require("path");
const express = require("express");
const router = express.Router();
const pg = require("pg");

// client side static assets
router.get("/", (_, res) => res.sendFile(path.join(__dirname, "./index.html")));
router.get("/client.js", (_, res) =>
  res.sendFile(path.join(__dirname, "./client.js"))
);
router.get("/detail-client.js", (_, res) =>
  res.sendFile(path.join(__dirname, "./detail-client.js"))
);
router.get("/style.css", (_, res) =>
  res.sendFile(path.join(__dirname, "../style.css"))
);
router.get("/detail", (_, res) =>
  res.sendFile(path.join(__dirname, "./detail.html"))
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

router.get("/search", async function (req, res) {
  console.log("search recipes");

  // return recipe_id, title, and the first photo as url
  //
  // for recipes without photos, return url as default.jpg
  const { rows } = await connection.query(
    `SELECT
    DISTINCT ON (recipes.recipe_id)
    recipes.recipe_id, title, 
    COALESCE(recipes_photos.url, 'default.jpg') as url
    FROM recipes
    LEFT JOIN recipes_photos
    ON
    recipes.recipe_id = recipes_photos.recipe_id`
  );
  res.status(200).json({ status: "Ok", rows });
});

router.get("/get", async (req, res) => {
  const recipeId = req.query.id ? +req.query.id : 1;
  console.log("recipe get", recipeId);

  // return all ingredient rows as ingredients
  //    name the ingredient image `ingredient_image`
  //    name the ingredient type `ingredient_type`
  //    name the ingredient title `ingredient_title`
  const { rows: ingredients } = await connection.query(
    `
    SELECT 
    ingredients.image AS ingredient_image,
    ingredients.type AS ingredient_type,
    ingredients.title AS ingredient_title
    FROM recipe_ingredients
    INNER JOIN ingredients
    ON ingredients.id = recipe_ingredients.ingredient_id
    WHERE recipe_ingredients.recipe_id = $1
  `,
    [recipeId]
  );
    //
  // return all photo rows as photos
  //    return the title, body, and url (named the same)
  //
  //
  const { rows: photos } = await connection.query(
    `
    SELECT 
    recipes.title as title,
    recipes.body as body,
    COALESCE(recipes_photos.url, 'default.jpg') as url
    FROM recipes
    LEFT JOIN recipes_photos
    ON recipes.recipe_id = recipes_photos.recipe_id
    WHERE recipes.recipe_id = $1
  `,
    [recipeId]
  );
console.log({photos});
  // return the title as title
  // return the body as body
  // if no row[0] has no photo, return it as default.jpg


  res
    .status(200)
    .json({ ingredients, photos, title: photos[0]?.title, body: photos[0]?.body });
});
/**
 * Student code ends here
 */

module.exports = router;
