const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");

// Get current date
let day = date.getDate();

// Create Express app
const app = express();

// Middleware setup
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static("public"));
app.set("view engine", "ejs");

// Connect to MongoDB
const { MongoClient } = require("mongodb");

const uri = "uri";
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function connectToDatabase() {
  try {
    await client.connect();
    console.log("Connected to the database");
  } catch (err) {
    console.error("Error connecting to the database", err);
  }
}

connectToDatabase();

function Capitalize(str) {
  // This is for dynamic urls
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

// Retrieve all items from the database
async function getAllItems() {
  try {
    const db = client.db("todolist");
    const collection = db.collection("todos");
    return collection.find({}).toArray();
  } catch (err) {
    console.error("Error retrieving items:", err);
    throw err;
  }
}

// Function to check if the database is empty and add default items
async function checkIfEmpty() {
  try {
    const db = client.db("todolist");
    const collection = db.collection("todos");
    const items = await collection.find({}).toArray();
    if (items.length === 0) {
      const defaultItems = [
        { name: "eating" },
        { name: "running" },
        { name: "working" },
      ];
      await collection.insertMany(defaultItems);
      console.log("Default items saved");
    }
  } catch (err) {
    console.error("Error checking and inserting default items:", err);
  }
}

// Call the function to check if the database is empty and insert default items
checkIfEmpty();

// Route: Home Page
app.get("/", async function (req, res) {
  try {
    const items = await getAllItems();
    res.render("list", { kindofday: day, allItems: items });
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve items" });
  }
});

// Route: Add or Delete item
app.post("/", async function (req, res) {
  try {
    const db = client.db("todolist");
    const collection = db.collection("todos");
    // Add a new item
    var newItem = req.body.newItem;
    const items = await getAllItems();
    if (items.some((item) => item.name === newItem)) {
      console.log("Item already exists in the collection:", items);
    }
    if (
      newItem !== "" &&
      newItem !== null &&
      newItem !== undefined &&
      newItem !== "none" &&
      !items.includes(newItem)
    ) {
      await collection.insertOne({ name: newItem });
      res.redirect("/");
      console.log("Redirected to home page");
    } else {
      res.redirect("/");
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to create item" });
  }

  // Delete an item
  var deleteName = req.body.DeleteValue;
  if (deleteName != undefined) {
    try {
      const db = client.db("todolist");
      const collection = db.collection("todos");
      await collection.deleteOne({ name: deleteName });
      console.log("Item deleted successfully");
    } catch (error) {
      console.error("Failed to delete item:", error);
      res.status(500).json({ error: "Failed to delete item" });
    }
  }
});

// Route: Custom page
app.get("/:custom", async function (req, res) {
  try {
    const param = Capitalize(req.params.custom);
    const db = client.db("todolist");
    const collection = db.collection(param);
    const items = await collection.find({}).toArray();
    res.render("list", { kindofday: day, allItems: items });
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve items" });
  }
});

// Route: Add or Delete item in the custom page
app.post("/:custom", async function (req, res) {
  try {
    const param = Capitalize(req.params.custom);
    const db = client.db("todolist");
    const collection = db.collection(param);
    // Add a new item to the custom collection
    var newItem = req.body.newItem;
    const items = await collection.find({}).toArray();
    if (items.some((item) => item.name === newItem)) {
      console.log("Item already exists in the collection:", items);
    }
    if (
      newItem !== "" &&
      newItem !== null &&
      newItem !== undefined &&
      newItem !== "none" &&
      !items.includes(newItem)
    ) {
      await collection.insertOne({ name: newItem });
      res.redirect("/" + param);
      console.log("Redirected to custom page");
    } else {
      res.redirect("/" + param);
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to create item" });
  }

  // Delete an item from the custom collection
  var deleteName = req.body.DeleteValue;
  if (deleteName != undefined) {
    try {
      const param = Capitalize(req.params.custom);
      const db = client.db("todolist");
      const collection = db.collection(param);
      await collection.deleteOne({ name: deleteName });
      console.log("Item deleted successfully");
    } catch (error) {
      console.error("Failed to delete item:", error);
      res.status(500).json({ error: "Failed to delete item" });
    }
  }
});

// Start the server
app.listen(3000, function (req, res) {
  console.log("Server started on port 3000");
});
