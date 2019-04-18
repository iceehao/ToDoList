//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose=require("mongoose");
const _=require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


//database connecting and saving server sided

mongoose.connect("mongodb+srv://firehao:pokemon123@cluster0-veiix.mongodb.net/todolistDB",{useNewUrlParser:true});

const itemsSchema={ // 1st we need a schema
  name:String
};

const Item= mongoose.model("Item",itemsSchema); // then we create a model using the schema

// created multiple itesm for our list ?
const item1= new Item({

name:"Welcome to your todolist!"
});

const item2= new Item({
  name:"Hit the + button to add a new item."
});

const item3= new Item({
  name:"<-- Hit this to delete an item"
});

// created an array to save all items more cleanly
const defaultItems=[item1,item2,item3];
// used the model name and insert many to insert the array

// list items schema and model
const listSchema={
  name: String,
  items:[itemsSchema]
};

const List = mongoose.model("List", listSchema);


app.get("/", function(req, res) {
// curly braces empty to find everyting
  Item.find({}, function(err,foundItems){
if (foundItems.length===0){
  Item.insertMany(defaultItems,function(err){

  if(err){
    console.log("error");
  }
  else{
    console.log("success");
  }

res.redirect("/");
  });

}
else{
res.render("list",{listTitle: "Today", newListItems:foundItems});
}



});
});

// dynamic web page setup use express parameters
app.get("/:customeListName",function(req,res){
// 1. we create the custom express parametere which starts with a slash
const customeListName=_.capitalize(req.params.customeListName);
// 2. then we requested the parameter of anyhting (work/school) into a variable
List.findOne({name:customeListName},function(err,foundList){
// we use the findone method to find the object id
if(!err){// if there was no list then it creates a new on in the DB
  if(!foundList){
    const list= new List({
      name:customeListName,
      items:defaultItems
    });
    list.save(); // saves it and redirects to create the whole thing
    res.redirect("/"+customeListName);
  }
  else{
//show an exisitng list
res.render("list",{listTitle: foundList.name, newListItems:foundList.items});
}// if there was a list then it displays the parameter in found list.name and all of them items thats already stored
}


});


});
//
app.post("/", function(req, res){

  const itemName = req.body.newItem; // saved it a new constant
 const listName= req.body.list;

const item= new Item({ // created a new object
  name: itemName // new item
});

if(listName==="Today"){
  item.save(); //saves it to our collection ?
  res.redirect("/");
}
else{
  List.findOne({name:listName},function(err,foundList){

    foundList.items.push(item);
    foundList.save();
    res.redirect("/"+listName);
  });
}
});


 // goes back to our home page to save it ?


app.post("/delete",function(req, res){
  const checkedItemId= (req.body.checkbox);
  const listName= req.body.listName;


  if(listName==="Today"){
    Item.findByIdAndRemove(checkedItemId,function(err){
      if(!err){
        console.log("success");
        res.redirect("/");
      }
      else{
        console.log(" error");
      }
    });
  }

  else{
    List.findOneAndUpdate({name:listName},{$pull: {items: {_id: checkedItemId}}}, function(err,foundList){

if(!err){
  res.redirect("/"+listName);
}


    });
  }


});


app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
