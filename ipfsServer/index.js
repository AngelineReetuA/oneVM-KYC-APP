"use strict";

// IMPORT STATEMENTS
import { createServer } from "http";
import express from "express";
const app = express();
import bodyParser from "body-parser";
import cors from "cors";
import fileupload from "express-fileupload";
import sql2 from "mysql2";

// IMPORTS FROM APPLICATION GATEWAY
import { create } from "ipfs-http-client";
import { start } from "./application-javascript/app.js";
import { getAllDocs } from "./application-javascript/app.js";
import { createHash } from "./application-javascript/app.js";

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// SQL Initialization
var con = sql2.createConnection({
  host: "localhost",
  user: "root",
  password: "Fl6004c@suqeele",
  database: "panDB",
});

// addToSql function adds a row of data to the SQL node
function addToSql({ id, name, pNum, filePath }) {
  con.connect(function (err) {
    if (err) throw err;
    console.log("Connected!");
    var sql = `INSERT INTO kyc (id ,name, panNo, pahHash) VALUES (${id}, '${name}', ${pNum}, '${filePath}')`;
    con.query(sql, function (err, result) {
      if (err) throw err;
      console.log("Row inserted");
    });
  });
  return "IPFS HF SQL DONE !!";
}

app.options("*", cors());
app.use(cors());
app.use(fileupload());

// IPFS Initialization
const port = 4000;
const ipfs = create({
  host: "127.0.0.1",
  port: "5001",
  protocol: "http",
  apiPath: "/api/v0",
});

let hashDoc;

// Route /uploadfiles uploads the document to IPFS and gets back a hash value
app.use("/uploadfiles", async (req, res) => {
  // Get the uploaded files from the request
  const files = req.files;
  hashDoc = await uploadToIPFS(files.files);
  console.log("IPFS DONE", hashDoc);
  res.status(201).send(hashDoc);
});

// Route /addToHF&SQL adds the whole document of data to HF Ledger and SQL
app.use("/addToHF&SQL", async (req, res) => {
  const obj = req.body;
  if (obj) {
    const details = obj.obj;
    console.log("DETAILS::::", details);
    const id = hashDoc.id;
    const cusName = obj.name;
    const numP = obj.pNum;
    const hashV = hashDoc.filePath;
    const doc = { id: id, name: cusName, pNum: numP, filePath: hashV };
    console.log("FINAL DOC FOR SQL AND HF:", doc);
    await createHash(contract, { doc });
    const result = await addToSql(doc);
    console.log("HF AND SQL DONE");
    res.status(201).send(result);
  } else {
    console.log("OBJ NOT FOUND");
  }
});

// STARTING THE SERVER (Fabric - Creating a gateway and initializing ledger with initial datat)
app.use((req, res) => res.status(404).send("Router not found"));
let contract;
var server = createServer(app).listen(port, async () => {
  contract = await start();
  await getAllDocs(contract);
  console.log(`Server with HF started on ${port}`);
});

server.timeout = 240000;

// uploadToIPFS function uploads a file to IPFS | It is used in /uploadfiles route
// Returns a document of ID and Hash
const uploadToIPFS = async (fileList) => {
  var jsonStr = "[";
  console.log("uploadToIPFS starting");
  try {
    var fileAdded;

    // Single file comes as JSON object
    if (fileList.name !== undefined) {
      fileList = [fileList];
    }

    // Process multiple files
    if (fileList.length) {
      for (let i = 0; i < fileList.length; i++) {
        console.log("FILE LIST: ", fileList);
        var file = fileList[i];
        const fileName = file.name;
        const buffer = await file.data;
        try {
          console.log("Trying to add files");
          fileAdded = await ipfs.add(buffer);
        } catch (err) {
          console.log(err);
          return err.message;
        }

        if (fileAdded.path !== "") {
          jsonStr +=
            '{"name":"' +
            fileName +
            '","value":"' +
            fileAdded.path +
            '","mimetype":"' +
            file.mimetype +
            '"},';

          console.log("JSON STRING OF FILE DETAILS: ", jsonStr);
          console.log("FILE SUCCESSFULLY ADDED!!");
        } else {
          console.log("Process failed");
          return "Could not upload the file to ipfs network";
        }
      }
      // Remove the last comma from the string.
      jsonStr = jsonStr.replace(/,\s*$/, "") + "]";
      return {
        id: Date.now(),
        filePath: fileAdded.path,
      };
    }
  } catch (err) {
    console.log(err);
    message.error(err.message);
  }
};
