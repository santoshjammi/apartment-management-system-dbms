const express = require("express");
const bodyParser = require('body-parser');
const db = require('./mysql_connect');
const dashB = require('./routes/dashb');
const cors = require("cors")


//port number to listen
const port = 5000;

//init
const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use("/dashboard",dashB);
app.use(cors())


//initializing
app.listen(port,()=>{
  console.log("Server starten to listen...");
}); 

//home page 
app.get('/', function(req, res){
  res.send("Only accepting GET and POST requests!");
});

//authorisation
app.post("/auth", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  let rep = "unknown";
  let acces = "denied";

  if(username &&
    username.toUpperCase().charAt(0) === "E" &&
    password &&
    password.length >= 6){
      rep = "employee";

      // res.send({ user: "employee" });
    }else if (
    username &&
    username.toUpperCase().charAt(0) === "A" &&
    password &&
    password.length >= 6
  ) {
    rep = "admin";
  }else if (
    username &&
    username.toUpperCase().charAt(0) === "T" &&
    password &&
    password.length >= 6
  ) {
    rep = "tenant";
  }else if (
    username &&
    username.toUpperCase().charAt(0) === "O" &&
    password &&
    password.length >= 6
  ) {
    rep= "owner";
  }  else if(password.length < 6) {
    res.send({ user: "passunknown" });
  }else {
    res.send({ user: "unknown" });
  }

  const resul =db.authoriseuser(username,password,(err,result)=>{
    if(err) console.log(err);
    acces = result;
    res.send({
      access: acces,
      user: rep,
    })
  })
});


//register complaint
app.post('/raisingcomplaint',function(req,res){
    // const name = req.body.name;
    // const floorno = req.body.floorno;
    const desc = req.body.descp;
    const blockno = req.body.blockno;
    const roomno = req.body.roomno;
    const values = [desc,blockno,roomno];
    const resul =db.registercomplaint(values,(err,result)=>{
      if(err) console.log(err);
    res.send(result);
    })
});


//creates owner in owner table
app.post('/createowner',(req,res)=>
{
  const ownerid = req.body.ownerid;
    const name = req.body.name;
    const age = req.body.age;
    const aggrement_status = req.body.aggrement_status;
    const roomno = req.body.roomno;
    const dob = req.body.dob;
    const proof = req.body.proof;
    const values = [ownerid,name,age,aggrement_status,roomno,dob];
    const proofval = [proof,ownerid];

    const rest = db.createowner(values,(err,result)=>{
      if(err) console.log(err);//res.sendStatus(404);

  });
  const rep = db.createownerproof(proofval,(err,result)=>{
    if(err) console.log(err);//res.sendStatus(404);
    else res.sendStatus(200);
});
});

app.get('/tenentdetails',(req,res)=>
{
    const rest = db.getdata('tenant',(err,result)=>
    {
      res.send(result);
    })
})



//view complaints that are in the database
app.get('/viewcomplaints',(req,res)=>
{
    const rest = db.viewcomplaints((err,result)=>
    {
      res.send(result);
    })
})



//books parking slot for tenents
app.post('/bookslot',(req,res)=>
{
    const roomno =req.body.roomno;
    const slno = req.body.slotNo;
    const values = [slno,roomno,];
    const rest = db.bookslot(values,(err,result)=>{
      if(err) console.log(err);
      if(err) res.sendStatus(405);
      res.sendStatus(200);
  })
});

//Other routes
app.get('*', function(req, res){
  res.send('Sorry, this is an invalid URL.');
});