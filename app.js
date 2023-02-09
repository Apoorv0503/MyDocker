//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

//We were fatching data from this array but now we create a DB and store the data.
// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];

// create and connect to a DB
//used {useNewUrlParser:true} to avoid deprecation warning

//for srv connect to mongoDB cloud DB
//mongodb+srv://todo:<password>@cluster0.dqh3aau.mongodb.net/?retryWrites=true&w=majority
mongoose.connect("mongodb+srv://todo:1223@cluster0.dqh3aau.mongodb.net/todolistDB", {
  useNewUrlParser: true,
});

//create a schema for our todolist db
const itemsSchema = new mongoose.Schema({
  name: String,
});

//create a MODEL
const Item = new mongoose.model("Item", itemsSchema);


//----------create new schema and model for new routes ie. various lists-----------
const listSchema = new mongoose.Schema({
  name: String,
  items: [itemsSchema]
});

const List= mongoose.model("List", listSchema);
//----------------------------------------------------------------------------
//now since we dont use array we will make docs from above model
//to store and render them in our list.

const item1 = new Item({
  name: "welcome to your todoList!",
});

const item2 = new Item({
  name: "Hit the + button to add a new item",
});

const item3 = new Item({
  name: "<---- Hit this to delete an item",
});

const defaultItems = [item1, item2, item3];

//--------------my get--------------------

app.get("/", function (req, res) {
  // const day = date.getDate();

  Item.find({}, function (err, foundItem) {
    if (foundItem.length === 0) {
      //insert the above array in our db using the model that we made
      Item.insertMany(defaultItems, function (err) {
        if (err) {
          console.log(err);
        } else {
          console.log("inserted successfully");
        }
      });

      res.redirect("/");
    } else {
      res.render("list", { listTitle: "Today", newListItems: foundItem });
    }
  });
});

//dynamic routing using express route parameter
// app.get("/:customListName", function(req,res){
  
//         const customListName= req.params.customListName;
      
//       List.findOne({name :customListName }, function(err, foundList){
//         if(!err)
//         {
//           if(!foundList)
//           {
//             const list= new List({
//               name: customListName,
//               items: defaultItems
    
//             });
    
//             list.save();
//             res.redirect("/"+ customListName);
//           }
//         }
//       else
//       {
//         res.render("list",{listTitle: foundList.name ,newListItems: foundList.items} );
//       }
 
//    });
//   });

app.get("/:customListName", function(req, res){
  const customListName = req.params.customListName;

  List.findOne({name: customListName}, function(err, foundList){
    if (!err){
      if (!foundList){
        //Create a new list
        const list = new List({
          name: customListName,
          items: defaultItems
        });
        // list.save();
        // res.redirect("/" + customListName);//always use save function with async fucntions
        list.save(function (err) {
          if (err) {
            console.log(err);
          } else {
            res.redirect("/" + customListName);
          }
        });
      } else {
        //Show an existing list

        res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
      }
    }
  });
});




//post request to home route but, since many fucntions were deprecated hence took some help and replaced with 
//new ones.
/*
app.post("/", function (req, res) {

 
  //sare routes abhi chhodo
  const itemName = req.body.newItem;
  const listName = req.body.list;

  // make a new document nd save that in db so that newley entered item hme dikhe in our to do list
  const item = new Item({
    name: itemName,
  });

  //now save it using save function in place of using func like insertOne/many
  // item.save();

  //check krege phle ki kis listName me add hona h new itme usi 
  //according item add kro + redirect


  if(listName==="today")
  {
    
    // foundList.save().then(() => console.log("Success for today!!"));
    //always use error handing with save() nai to save kaam nai krega.
    item.save(function (err) {
      if (err) {
        console.log(err);
      } else {
        res.redirect("/");
      }
    });
   

  }
  else{

    List.findOne({name:listName},function(err, foundList){
      foundList.items.push(item);
     
      // foundList.save().then(() => console.log("Success!!"));

      item.save(function (err) {
        if (err) {
          console.log(err);
        } else {
          res.redirect("/"+listName);
        }
           
    });
    

   });
   
  }
 
});

//post request to delete route
app.post("/delete", function (req, res) {
  // console.log(req.body);
  const checkedItemId = req.body.checkBox;

  // used built in find and remove function to delete an element by it's ID
  Item.findByIdAndRemove(checkedItemId, function (err) {
    if (!err) {
      console.log("Successfully deleted checked item.");
      res.redirect("/");
    }
  });
});

//not neede bcz of dynamic routing
// app.get("/work", function(req,res){
//   res.render("list", {listTitle: "Work List", newListItems: workItems});
// });

// app.get("/about", function(req, res){
//   res.render("about");
// });
*/

app.post("/", function (req, res) {
const itemName = req.body.newItem;
const listName = req.body.list.trim();

const item = new Item({
  name: itemName
});

if (listName === "Today"){
  // *** Save item to mongoose: ***

  // item.save();
  item.save(function (err) {
    if (err) {
      console.log(err);
    } else {
      // *** render item to home page: ***
      res.redirect("/");
    }
  });
}
else {
  List.findOne({name: listName}, function(err, foundList){
    foundList.items.push(item);
    // foundList.save();
    foundList.save(function (err) {
      if (err) {
        console.log(err);
      } else {
        res.redirect("/" + listName);
      }
    });
  });
}
});

app.post("/delete", function(req, res){
const checkedItemId = req.body.checkbox.trim();
const listName = req.body.listName.trim();

if (listName === "Today"){
  Item.findByIdAndRemove(checkedItemId, function(err){
    if (!err) {
      // mongoose.connection.close();
      console.log("Successfully deleted checked item.");
      res.redirect("/");
    }
  });
}
else {
  List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList){
    if (!err) {
      res.redirect("/" + listName);
    }
  });
}
});



app.listen(3000, function () {
  console.log("Server started on port 3000");
});


// ***** *** Require Packages: other sol close to mine 1*** *****
/*
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
 
 
const app = express();
 
app.set('view engine', 'ejs');
 
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
 
// *** Create a New Database inside MongoDB via Connecting mongoose: ***
mongoose.connect("mongodb://localhost:27017/todolistDB");
// mongoose.connect("mongodb://localhost:27017/todolistDB", {useNewUrlParser: true}); // ==> use this if deprect a warning 
 
// *** Create a Schema: ***
const itemsSchema = {
  name: String
};
 
// *** Create a Model: (usually Capitalized) ***
const Item = mongoose.model("Item", itemsSchema);
 
// *** Create a Mongoose Documents: ***
const item1 = new Item({
  name: "Welcome to your todolist!"
});
 
const item2 = new Item({
  name: "Hit the + button to add a new item."
});
 
const item3 = new Item({
  name: "<-- Hit this to delete an item."
});
 
const defaultItems = [item1, item2, item3];
 
// *** Create a list Schema: ***
const listSchema = {
  name: String,
  items: [itemsSchema]
};
 
// *** Create a list Model: ***
const List = mongoose.model("list", listSchema);
 
app.get("/", function(req, res) {
  // *** Mongoose find() ***
  Item.find({}, function(err, foundItems){
 
    if (foundItems.length === 0) {
      // *** Mongoose insertMany() ***
      Item.insertMany(defaultItems, function(err){
        if (err) {
          console.log(err);
        }
        else{
          console.log("Successfully saved default items to databse.");
        }
      });
      res.redirect("/");
    }
    else{
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }   
  });
});
 
// *** Create a custom parameters Route: ***
app.get("/:customListName", function(req, res){
  const customListName = _.capitalize(req.params.customListName);
 
  List.findOne({name: customListName}, function(err, foundList){
 
    if (!err) {
      if (!foundList) {
        // *** Create a new list: ***
        // *** Create a new Mongoose Document: ***
        const list = new List({
          name: customListName,
          items: defaultItems
        });
 
        // list.save();
        list.save(function (err) {
          if (err) {
            console.log(err);
          } else {
            res.redirect("/" + customListName);
          }
        });
        //res.redirect("/" + customListName);
        
      }
      else {
        // *** Show an existing list: ***
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
      }
    }
 
  });
  
});

app.post("/", function(req, res){
  // *** Adding a New Item: ***

const itemName = req.body.newItem;
const listName = req.body.list.trim();

const item = new Item({
  name: itemName
});

if (listName === "Today"){
  // *** Save item to mongoose: ***

  // item.save();
  item.save(function (err) {
    if (err) {
      console.log(err);
    } else {
      // *** render item to home page: ***
      res.redirect("/");
    }
  });
  
  // res.redirect("/");
}
else {
  List.findOne({name: listName}, function(err, foundList){
    foundList.items.push(item);
    // foundList.save();
    foundList.save(function (err) {
      if (err) {
        console.log(err);
      } else {
        res.redirect("/" + listName);
      }
    });
    // res.redirect("/" + listName);
  });
}
});

app.post("/delete", function(req, res){
const checkedItemId = req.body.checkbox.trim();
const listName = req.body.listName.trim();

if (listName === "Today"){
  Item.findByIdAndRemove(checkedItemId, function(err){
    if (!err) {
      // mongoose.connection.close();
      console.log("Successfully deleted checked item.");
      res.redirect("/");
    }
  });
}
else {
  List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList){
    if (!err) {
      res.redirect("/" + listName);
    }
  });
}
});


// app.get("/about", function(req, res){
// res.render("about");
// });

app.listen(3000, function() {
console.log("Server started on port 3000");
});


*/