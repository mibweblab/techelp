const mongoose = require('mongoose');

const { Schema } = mongoose; //ES6 way to shorten const Schema = mongoose.Schema; mongoose has a property name Schema, we jsut want to assign that same property to a variable name Schema

//what i gathered from using mongo and mongoose... so let's say that mongodb uses this flow: dbs --> collections --> documents... In direct contrast mongoose, similarly, uses this flow: db --> Model Class --> Model instance... SO with that being said a mongoose class represents an entire mongodb collection, it's used to access a single collection sitting inside of mongodb. Things like creating a new record(document) or searching all the records inside the collection is done by using a model class.... Model instances represent a single record (document) sitting inside of a mongodb collection... but the main difference i noticed is: looking at mongo documents or records, every records inside of a collection could have its unique set of properties. ex: you could have a set of records (collection) containing {id:1,name:"anna",height:150} and {id:2,name:"alex",age:21} (noticed they dont have the same exact properties) however when we make use of mongoose we loose that ability, mongoose wants to know all of the different properties that our records will have inside our dbs and it requires us to define those ahead of time with the schema object.

const userSchema = new Schema({
  googleId: String, //tells our schema that every time theres a value on the google id property it will always be astring because it could also have letters
  displayName: String
});

mongoose.model('users', userSchema); //tell mongoose that there is a collection that needs to be created with users
